import test from 'node:test';
import assert from 'node:assert/strict';
import { setup } from './helpers/community.mjs';
import { deliverMemberMail } from '../community/member-mail.mjs';
import { deliverMail } from '../community/email.mjs';

async function fixture() {
  const context = setup();
  const register = async (email, name) => (await context.call('/auth/register', { method: 'POST', body: { email, name, password: 'fictional testing password' } })).body;
  const admin = await register('admin@example.invalid', 'Trustee Example');
  const member = await register('member@example.invalid', 'Member Example');
  context.sqlite.prepare('UPDATE members SET is_admin=1 WHERE id=?').run(admin.member.id);
  context.sqlite.exec('UPDATE members SET email_verified=1');
  const adminCall = (path, options = {}) => context.call(path, { token: admin.token, ...options });
  const mailOn = () => Object.assign(context.env, { MAIL_ENABLED: 'true', SMTP_HOST: 'smtp.example.invalid', SMTP_USER: 'example', SMTP_PASSWORD: 'private-example', MAIL_FROM: 'admin@avianmodel.org' });
  return { ...context, admin, member, adminCall, mailOn };
}
const dues = () => ({ id: crypto.randomUUID(), kind: 'paid', amount: 2500, currency: 'GBP', paid_date: '2026-01-01', valid_until: '2099-12-31', method: 'bank transfer', note: 'Example transfer' });

test('member management authenticates every read and write and never exposes authentication fields', async () => {
  const { call, adminCall, member, admin, sqlite } = await fixture();
  const paths = ['/admin/members', `/admin/members/${member.member.id}/dues`, '/admin/emails', `/admin/emails/${crypto.randomUUID()}`];
  const writes = ['/admin/emails/preview', `/admin/emails/${crypto.randomUUID()}/send`, `/admin/emails/${crypto.randomUUID()}/retry`, `/admin/emails/${crypto.randomUUID()}/cancel`, `/admin/members/${member.member.id}/dues`, `/admin/dues/${crypto.randomUUID()}/void`];
  for (const path of [...paths, ...writes]) {
    const options = writes.includes(path) ? { method: 'POST', body: {} } : {};
    assert.equal((await call(path, options)).status, 401);
    assert.equal((await call(path, { ...options, token: member.token })).status, 403);
  }
  const roster = (await adminCall('/admin/members')).body;
  assert.equal(roster.total, 2);
  assert.ok(roster.members.every(m => !('password_hash' in m) && !('salt' in m) && !('recovery_hash' in m) && !('research' in m)));
  assert.equal((await adminCall('/admin/members?q=Member')).body.total, 1);
  assert.equal((await adminCall('/admin/members?q=%25')).body.total, 0);
  assert.equal((await adminCall('/admin/members?offset=-1')).status, 400);
  sqlite.prepare('UPDATE members SET is_admin=0 WHERE id=?').run(admin.member.id);
  assert.equal((await adminCall('/admin/members')).status, 403);
  sqlite.close();
});

test('dues entries are validated, idempotent, private, and retain corrections and waivers', async () => {
  const { call, adminCall, member, admin, sqlite } = await fixture();
  const path = `/admin/members/${member.member.id}/dues`, entry = dues();
  assert.equal((await adminCall(path, { method: 'POST', body: { ...entry, paid_date: '2026-02-30' } })).status, 400);
  assert.equal((await adminCall(path, { method: 'POST', body: { ...entry, amount: 1.5 } })).status, 400);
  assert.equal((await adminCall(path, { method: 'POST', body: entry })).status, 201);
  assert.equal((await adminCall(path, { method: 'POST', body: entry })).status, 200);
  assert.equal((await adminCall(path, { method: 'POST', body: { ...entry, amount: 9900 } })).status, 409);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM manual_dues').get().n, 1);
  assert.equal((await call('/membership/status', { token: member.token })).body.dues_status, 'paid');
  assert.equal((await call('/membership/status', { token: admin.token })).body.paid_until, null);
  assert.equal((await adminCall('/admin/members?dues=paid')).body.total, 1);
  assert.equal((await adminCall(`/admin/dues/${entry.id}/void`, { method: 'POST', body: { reason: '' } })).status, 400);
  await adminCall(`/admin/dues/${entry.id}/void`, { method: 'POST', body: { reason: 'Wrong amount' } });
  assert.equal((await call('/membership/status', { token: member.token })).body.dues_status, 'none');
  const history = (await adminCall(path)).body.records;
  assert.equal(history[0].void_reason, 'Wrong amount'); assert.equal(history[0].recorded_by, 'Trustee Example');
  await adminCall(path, { method: 'POST', body: { ...dues(), kind: 'waived', amount: 0 } });
  assert.equal((await call('/membership/status', { token: member.token })).body.dues_status, 'waived');
  await adminCall(path, { method: 'POST', body: { ...dues(), valid_until: '2026-01-02' } });
  assert.equal((await adminCall('/admin/members?dues=waived')).body.total, 1);
  sqlite.close();
});

test('email preview excludes news opt-outs, sends separately, and rechecks preferences before delivery', async () => {
  const { adminCall, member, admin, sqlite, env, mailOn } = await fixture(); mailOn();
  const compose = { kind: 'news', subject: 'Example seminar', body: 'A fictional message', filter: { dues: 'all' } };
  const first = await adminCall('/admin/emails/preview', { method: 'POST', body: compose });
  assert.equal(first.status, 201); assert.equal(first.body.recipients.length, 2);
  const id = first.body.id;
  let sent = [];
  await deliverMemberMail(env, async message => sent.push(message)); assert.equal(sent.length, 0);
  assert.equal((await adminCall(`/admin/emails/${id}/send`, { method: 'POST' })).status, 200);
  assert.equal((await adminCall(`/admin/emails/${id}/send`, { method: 'POST' })).status, 200);
  sqlite.prepare('UPDATE members SET mailing_list=0 WHERE id=?').run(member.member.id);
  await Promise.all([deliverMemberMail(env, async message => sent.push(message)), deliverMemberMail(env, async message => sent.push(message))]);
  assert.equal(sent.length, 1); assert.equal(sent[0].to, admin.member.email);
  assert.equal(sent[0].cc, undefined); assert.equal(sent[0].bcc, undefined); assert.match(sent[0].text, /unsubscribe\?token=/);
  const history = (await adminCall(`/admin/emails/${id}`)).body;
  assert.equal(history.recipients.find(r => r.member_id === member.member.id).status, 'skipped');
  const second = await adminCall('/admin/emails/preview', { method: 'POST', body: compose });
  assert.equal(second.body.excluded, 1); assert.equal(second.body.recipients.length, 1);
  assert.equal((await adminCall('/admin/emails/preview', { method: 'POST', body: { ...compose, subject: 'Subject\r\nBcc: someone@example.invalid' } })).status, 400);
  const direct = (await adminCall('/admin/emails/preview', { method: 'POST', body: { ...compose, kind: 'membership', member_ids: [member.member.id] } })).body;
  await adminCall(`/admin/emails/${direct.id}/send`, { method: 'POST' });
  await deliverMemberMail(env, async message => sent.push(message));
  assert.equal(sent.length, 2); assert.equal(sent[1].to, member.member.email); assert.doesNotMatch(sent[1].text, /unsubscribe\?token=/);
  sqlite.close();
});

test('mail survives temporary failures, retries only failed recipients, and supports cancellation and a shared daily limit', async () => {
  const { adminCall, sqlite, env, mailOn, member } = await fixture(); mailOn();
  const compose = { kind: 'membership', subject: 'Example dues', body: 'Fictional message', member_ids: [member.member.id] };
  const preview = async () => (await adminCall('/admin/emails/preview', { method: 'POST', body: compose })).body.id;
  const id = await preview(); await adminCall(`/admin/emails/${id}/send`, { method: 'POST' });
  await deliverMemberMail(env, async () => { throw new Error(env.SMTP_PASSWORD); });
  let job = sqlite.prepare('SELECT * FROM member_email_recipients WHERE email_id=?').get(id);
  assert.equal(job.status, 'pending'); assert.equal(job.attempts, 1); assert.ok(!job.last_error.includes(env.SMTP_PASSWORD));
  sqlite.prepare('UPDATE member_email_recipients SET next_attempt=0 WHERE email_id=?').run(id);
  await deliverMemberMail(env, async () => { throw Object.assign(new Error('rejected'), { responseCode: 550 }); });
  assert.equal(sqlite.prepare('SELECT status FROM member_email_recipients WHERE email_id=?').get(id).status, 'failed');
  await adminCall(`/admin/emails/${id}/retry`, { method: 'POST' });
  let sends = 0; await deliverMemberMail(env, async () => { sends++; });
  await adminCall(`/admin/emails/${id}/retry`, { method: 'POST' }); await deliverMemberMail(env, async () => { sends++; });
  assert.equal(sends, 1);
  const cancelled = await preview(); await adminCall(`/admin/emails/${cancelled}/send`, { method: 'POST' }); await adminCall(`/admin/emails/${cancelled}/cancel`, { method: 'POST' });
  await deliverMemberMail(env, async () => { sends++; }); assert.equal(sends, 1);
  assert.equal((await adminCall(`/admin/emails/${cancelled}/send`, { method: 'POST' })).status, 409);
  // Additional fictional recipients consume the shared allowance, including cancelled work.
  for (let i = 0; i < 198; i++) {
    const idMember = crypto.randomUUID();
    sqlite.prepare('INSERT INTO members(id,email,name,password_hash,salt,recovery_hash,created) VALUES(?,?,?,?,?,?,?)').run(idMember, `fictional${i}@example.invalid`, 'Fictional', '', '', '', new Date().toISOString());
    sqlite.prepare('INSERT INTO member_email_recipients(id,email_id,member_id,recipient,status) VALUES(?,?,?,?,?)').run(crypto.randomUUID(), id, idMember, `fictional${i}@example.invalid`, 'sent');
  }
  const over = await preview(); assert.equal((await adminCall(`/admin/emails/${over}/send`, { method: 'POST' })).status, 429);
  assert.equal((await adminCall('/admin/emails')).body.remaining, 0);
  sqlite.close();
});

test('password reset is private, expiring and single-use; it revokes sessions and preserves roles and preferences', async () => {
  const { call, member, adminCall, sqlite, env, mailOn } = await fixture(); mailOn();
  const known = await call('/auth/request-reset', { method: 'POST', body: { email: member.member.email } });
  const unknown = await call('/auth/request-reset', { method: 'POST', body: { email: 'unknown@example.invalid' } });
  assert.deepEqual(known, unknown);
  const job = sqlite.prepare("SELECT * FROM email_outbox WHERE purpose='reset'").get();
  const code = job.body.match(/reset-password#([a-f0-9]{64})/)[1];
  const messages = []; await deliverMail(env, async message => messages.push(message));
  assert.equal(messages[0].subject, 'Set your ISAMO password');
  const reset = { token: code, password: 'new fictional password', is_admin: true };
  assert.equal((await call('/auth/reset-password', { method: 'POST', body: { ...reset, password: 'short' } })).status, 400);
  const result = await call('/auth/reset-password', { method: 'POST', body: reset });
  assert.equal(result.status, 200); assert.equal(result.body.recovery.length, 64);
  assert.equal((await call('/me', { token: member.token })).status, 401);
  assert.equal((await call('/auth/reset-password', { method: 'POST', body: reset })).status, 400);
  const login = await call('/auth/login', { method: 'POST', body: { email: member.member.email, password: reset.password } });
  assert.equal(login.status, 200); assert.equal(login.body.member.is_admin, false); assert.equal(login.body.member.mailing_list, true);
  assert.equal((await adminCall('/admin/members')).status, 200);
  await call('/auth/request-reset', { method: 'POST', body: { email: member.member.email } });
  const expiredCode = sqlite.prepare("SELECT body FROM email_outbox WHERE purpose='reset' AND sent_at IS NULL").get().body.match(/reset-password#([a-f0-9]{64})/)[1];
  sqlite.exec('UPDATE password_reset_tokens SET expires=0');
  assert.equal((await call('/auth/reset-password', { method: 'POST', body: { ...reset, token: expiredCode } })).status, 400);
  sqlite.close();
});
