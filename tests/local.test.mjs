import test from 'node:test';
import assert from 'node:assert/strict';
import { createLocalCommunity, LOCAL_KEY, LOCAL_PASSWORD } from '../community/local-server.mjs';
import worker from '../community/worker.mjs';

test('local contribution environment uses fictional accounts without email or payment credentials', async () => {
  const { env, sqlite } = await createLocalCommunity();
  try {
    assert.equal(env.SMTP_PASSWORD, undefined);
    assert.equal(env.STRIPE_SECRET_KEY, undefined);
    const call = async (path, body, token) => {
      const response = await worker.fetch(new Request('http://127.0.0.1:8787' + path, { method: body ? 'POST' : 'GET', headers: { 'X-Demo-Key': LOCAL_KEY, ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: 'Bearer ' + token } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) }), env);
      return { status: response.status, body: await response.json() };
    };
    const config = await call('/membership/config');
    assert.equal(config.body.email_enabled, false); assert.equal(config.body.payments_enabled, false);
    const accounts = sqlite.prepare('SELECT email FROM members').all();
    assert.equal(accounts.length, 2);
    assert.ok(accounts.every(x => x.email.endsWith('@example.invalid')));
    const member = await call('/auth/login', { email: 'member@example.invalid', password: LOCAL_PASSWORD });
    const admin = await call('/auth/login', { email: 'admin@example.invalid', password: LOCAL_PASSWORD });
    assert.equal(member.body.member.is_admin, false); assert.equal(admin.body.member.is_admin, true);
    assert.equal((await call('/admin/mailing-list', undefined, member.body.token)).status, 403);
    assert.equal((await call('/admin/mailing-list', undefined, admin.body.token)).status, 200);
    assert.equal((await call('/posts')).body.posts.length, 2);
    assert.equal((await call('/posts', { title: 'Anonymous', body: 'Should fail' })).status, 401);
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM email_outbox').get().n, 0);
  } finally { sqlite.close(); }
});
