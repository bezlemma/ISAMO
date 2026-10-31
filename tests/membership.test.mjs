import test from 'node:test';
import assert from 'node:assert/strict';
import { setup } from './helpers/community.mjs';
import worker from '../community/worker.mjs';
import { deliverMail, unsubscribeToken } from '../community/email.mjs';
import { checkout, paymentWebhook } from '../community/payments.mjs';
import { encoder, hex, hmacKey } from '../community/common.mjs';

const credentials = { name: 'Test member', email: 'member@example.invalid', password: 'a long testing password' };
const fullProfile = { name: 'Updated name', institution: 'Research Institute', role: 'Postdoctoral researcher', research: 'How the avian heart forms.', mailing_list: false };

test('signup stores profile, mailing preferences, and keeps private fields out of posts', async () => {
  const { call, sqlite } = setup();
  const result = await call('/auth/register', { method: 'POST', body: { ...credentials, ...fullProfile } });
  assert.equal(result.status, 201); assert.equal(result.body.email_status, 'not_configured');
  assert.equal(result.body.member.research, fullProfile.research); assert.equal(result.body.member.mailing_list, false);
  const token = result.body.token;
  assert.equal((await call('/me', { method: 'PATCH', token, body: { ...fullProfile, mailing_list: 'false' } })).status, 400);
  assert.equal((await call('/me', { method: 'PATCH', token, body: { ...fullProfile, mailing_list: true } })).body.mailing_list, true);
  await call('/posts', { method: 'POST', token, body: { title: 'Seminar', body: 'Join us', kind: 'event', event_date: '2099-11-01', event_series: 'seminar' } });
  const post = (await call('/posts?kind=event')).body.posts[0];
  assert.equal(post.event_series, 'seminar'); assert.equal(post.research, undefined); assert.equal(post.email, undefined);
  assert.equal((await call('/admin/mailing-list', { token })).status, 403);
  assert.equal((await call('/admin/retry-email', { method: 'POST', token })).status, 403);
  sqlite.close();
});

test('confirmation delivery retries, confirmation is single use, and unsubscribe needs no sign-in', async () => {
  const { call, sqlite, env } = setup();
  Object.assign(env, { MAIL_ENABLED: 'true', SMTP_HOST: 'smtp.example.invalid', SMTP_USER: 'test', SMTP_PASSWORD: 'test', MAIL_FROM: 'admin@avianmodel.org' });
  const result = await call('/auth/register', { method: 'POST', body: credentials });
  assert.equal(result.body.email_status, 'queued');
  const job = sqlite.prepare('SELECT * FROM email_outbox').get();
  const code = job.body.match(/confirm-email#([a-f0-9]{64})/)[1];
  const sent = [];
  await deliverMail(env, async () => { throw new Error('temporary SMTP failure'); });
  assert.equal(sqlite.prepare('SELECT attempts FROM email_outbox').get().attempts, 1);
  sqlite.prepare('UPDATE email_outbox SET next_attempt=0').run();
  await deliverMail(env, async msg => { sent.push(msg); });
  await deliverMail(env, async msg => { sent.push(msg); });
  assert.equal(sent.length, 1); assert.match(sent[0].text, /Your ISAMO community account has been created/);
  assert.equal(sqlite.prepare('SELECT body FROM email_outbox').get().body, null);
  assert.equal((await call('/auth/confirm-email', { method: 'POST', gate: false, body: { token: 'bad' } })).status, 400);
  assert.equal((await call('/auth/confirm-email', { method: 'POST', gate: false, body: { token: code } })).status, 200);
  assert.equal((await call('/auth/confirm-email', { method: 'POST', gate: false, body: { token: code } })).status, 400);
  assert.equal((await call('/me', { token: result.body.token })).body.email_verified, true);
  sqlite.prepare('UPDATE members SET is_admin=1 WHERE id=?').run(result.body.member.id);
  assert.equal((await call('/admin/mailing-list', { token: result.body.token })).body.members.length, 1);
  const link = 'https://api.example.invalid/unsubscribe?token=' + await unsubscribeToken(env, result.body.member.id);
  assert.equal((await worker.fetch(new Request(link), env)).status, 200);
  assert.equal(sqlite.prepare('SELECT mailing_list FROM members').get().mailing_list, 1);
  assert.equal((await worker.fetch(new Request(link, { method: 'POST' }), env)).status, 200);
  assert.equal((await call('/admin/mailing-list', { token: result.body.token })).body.members.length, 0);
  assert.equal((await worker.fetch(new Request(link + 'f', { method: 'POST' }), env)).status, 400);
  sqlite.close();
});

test('email verification expires and disabled email does not queue or send', async () => {
  const { call, sqlite, env } = setup();
  const result = await call('/auth/register', { method: 'POST', body: credentials });
  assert.equal(result.body.email_status, 'not_configured');
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM email_outbox').get().n, 0);
  let sends = 0; await deliverMail(env, () => { sends++; }); assert.equal(sends, 0);
  Object.assign(env, { MAIL_ENABLED: 'true', SMTP_HOST: 'smtp.example.invalid', SMTP_USER: 'test', SMTP_PASSWORD: 'test', MAIL_FROM: 'admin@avianmodel.org' });
  await call('/auth/resend-confirmation', { method: 'POST', token: result.body.token });
  const code = sqlite.prepare('SELECT body FROM email_outbox').get().body.match(/confirm-email#([a-f0-9]{64})/)[1];
  sqlite.prepare('UPDATE email_tokens SET expires=0').run();
  assert.equal((await call('/auth/confirm-email', { method: 'POST', body: { token: code } })).status, 400);
  sqlite.close();
});

test('payment is disabled without configuration and never contacts Stripe', async () => {
  const { call, sqlite, env } = setup();
  env.STRIPE_FETCH = () => { throw new Error('Unexpected network request'); };
  const result = await call('/auth/register', { method: 'POST', body: credentials });
  assert.equal((await call('/membership/config')).body.payments_enabled, false);
  assert.equal((await call('/membership/checkout', { method: 'POST', token: result.body.token, body: { plan: 'student' } })).status, 503);
  assert.equal((await call('/payments/webhook', { method: 'POST', gate: false, body: {} })).status, 503);
  assert.equal((await call('/membership/status', { token: result.body.token })).body.paid_until, null);
  sqlite.close();
});

test('checkout controls the price and member; signed paid events grant one term and full refunds revoke it', async () => {
  const { call, sqlite, env } = setup();
  const result = await call('/auth/register', { method: 'POST', body: credentials });
  Object.assign(env, { PAYMENTS_ENABLED: 'true', STRIPE_SECRET_KEY: 'test-only', STRIPE_WEBHOOK_SECRET: 'webhook-test-only', MEMBERSHIP_PLANS: JSON.stringify({ student: { label: 'Student', priceId: 'price_demo', days: 365 } }) });
  let paymentStatus = 'unpaid', submitted;
  env.STRIPE_FETCH = async (url, options) => {
    if (url.includes('/prices/')) return Response.json({ active: true, type: 'one_time', unit_amount: 2000, currency: 'gbp' });
    if (url.endsWith('/checkout/sessions')) { submitted = options.body; return Response.json({ id: 'cs_test_demo', url: 'https://checkout.stripe.com/c/pay/demo' }); }
    if (url.includes('/charges/')) return Response.json({ payment_intent: 'pi_demo', refunded: true });
    return Response.json({ id: 'cs_test_demo', mode: 'payment', payment_status: paymentStatus, client_reference_id: result.body.member.id, payment_intent: 'pi_demo', amount_total: 2000, currency: 'gbp', line_items: { data: [{ price: { id: 'price_demo' }, quantity: 1 }] } });
  };
  await assert.rejects(() => checkout(env, result.body.member, 'untrusted'), /Choose/);
  await checkout(env, result.body.member, 'student');
  assert.equal(submitted.get('line_items[0][price]'), 'price_demo');
  assert.equal(submitted.get('client_reference_id'), result.body.member.id);
  assert.equal(submitted.get('success_url'), 'https://avianmodel.org/membership?payment=received');
  async function event(id, type = 'checkout.session.completed', object = { id: 'cs_test_demo' }, age = 0, badSignature = false) {
    const raw = JSON.stringify({ id, type, data: { object } }), t = Math.floor(Date.now() / 1000) - age;
    const sig = hex(await crypto.subtle.sign('HMAC', await hmacKey(env.STRIPE_WEBHOOK_SECRET), encoder.encode(t + '.' + raw)));
    return paymentWebhook(new Request('https://api.example.invalid/payments/webhook', { method: 'POST', headers: { 'Stripe-Signature': `t=${t},v1=${badSignature ? '0'.repeat(64) : sig}` }, body: raw }), env);
  }
  await assert.rejects(() => event('evt_bad', undefined, undefined, 0, true), /signature/);
  await assert.rejects(() => event('evt_old', undefined, undefined, 600), /signature/);
  await event('evt_pending'); assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM membership_payments').get().n, 0);
  paymentStatus = 'paid'; await event('evt_paid');
  const until = sqlite.prepare('SELECT valid_until FROM membership_payments').get().valid_until;
  await event('evt_paid'); await event('evt_again', 'checkout.session.async_payment_succeeded');
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM membership_payments').get().n, 1);
  assert.equal(sqlite.prepare('SELECT valid_until FROM membership_payments').get().valid_until, until);
  assert.equal((await call('/membership/status', { token: result.body.token })).body.paid_until, until);
  await event('evt_refund', 'charge.refunded', { id: 'ch_demo' });
  assert.equal((await call('/membership/status', { token: result.body.token })).body.paid_until, null);
  sqlite.close();
});
