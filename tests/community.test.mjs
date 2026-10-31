import test from 'node:test';
import assert from 'node:assert/strict';
import { setup } from './helpers/community.mjs';

test('community protects private data, ownership, sessions, recovery, and safe links', async () => {
  const { call, sqlite } = setup();
  assert.equal((await call('/posts', { gate: false })).status, 401);
  assert.equal((await call('/posts', { origin: 'https://unrelated.example' })).status, 403);
  const a = await call('/auth/register', { method: 'POST', body: { name: 'Researcher A', email: 'a@example.invalid', password: 'long unique password A', is_admin: true } });
  const b = await call('/auth/register', { method: 'POST', body: { name: 'Researcher B', email: 'b@example.invalid', password: 'long unique password B' } });
  assert.equal(a.status, 201); assert.equal(a.body.member.is_admin, false); assert.ok(a.body.recovery);
  assert.equal((await call('/auth/login', { method: 'POST', body: { email: 'a@example.invalid', password: 'wrong' } })).status, 401);
  const data = { title: 'An event', body: '<script>alert(1)</script>', kind: 'event', event_date: '2099-10-30', link: 'https://example.org' };
  assert.equal((await call('/posts', { method: 'POST', body: data })).status, 401);
  assert.equal((await call('/posts', { method: 'POST', token: a.body.token, body: { ...data, link: 'javascript:alert(1)' } })).status, 400);
  const created = await call('/posts', { method: 'POST', token: a.body.token, body: data });
  assert.equal(created.status, 201);
  const path = '/posts/' + created.body.id;
  assert.equal((await call(path, { method: 'PATCH', token: b.body.token, body: data })).status, 403);
  assert.equal((await call(path, { method: 'DELETE', token: b.body.token })).status, 403);
  const events = (await call('/posts?kind=event')).body.posts;
  assert.equal(events.length, 1); assert.equal(events[0].body, data.body); assert.equal(events[0].email, undefined);
  const reply = await call(path + '/comments', { method: 'POST', token: b.body.token, body: { body: 'A reply' } });
  assert.equal(reply.status, 201);
  assert.equal((await call('/comments/' + reply.body.id, { method: 'DELETE', token: a.body.token })).status, 403);
  assert.equal((await call(path + '/comments')).body.length, 1);
  await call(path, { method: 'DELETE', token: a.body.token });
  assert.equal((await call('/posts')).body.posts.length, 0);
  await call(path, { method: 'PATCH', token: a.body.token, body: { restore: true } });
  assert.equal((await call('/posts')).body.posts.length, 1);
  const recovered = await call('/auth/recover', { method: 'POST', body: { email: 'a@example.invalid', recovery: a.body.recovery, password: 'changed password for A' } });
  assert.equal(recovered.status, 200);
  assert.equal((await call('/me', { token: a.body.token })).status, 401);
  assert.equal((await call('/me', { token: recovered.body.token })).status, 200);
  assert.equal((await call('/auth/recover', { method: 'POST', body: { email: 'a@example.invalid', recovery: a.body.recovery, password: 'another new password' } })).status, 400);
  await call('/auth/logout', { method: 'POST', token: recovered.body.token });
  assert.equal((await call('/me', { token: recovered.body.token })).status, 401);
  sqlite.close();
});

test('sign-in attempts are rate limited', async () => {
  const { call, sqlite } = setup();
  for (let i = 0; i < 15; i++) assert.equal((await call('/auth/login', { method: 'POST', body: { email: 'missing@example.invalid', password: 'wrong password' } })).status, 401);
  assert.equal((await call('/auth/login', { method: 'POST', body: { email: 'missing@example.invalid', password: 'wrong password' } })).status, 429);
  sqlite.close();
});
