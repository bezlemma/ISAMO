import test from 'node:test';
import assert from 'node:assert/strict';
import { setup } from './helpers/community.mjs';
import { pageDefaults } from '../shared/site-pages.mjs';

test('only administrators can publish page content, without exposing member information', async () => {
  const { call, sqlite } = setup();
  const account = (await call('/auth/register', { method: 'POST', body: { name: 'Editor', email: 'editor@example.invalid', password: 'long test password', research: '' } })).body;
  const token = account.token;
  assert.ok(token);
  assert.equal((await call('/me', { method: 'PATCH', token, body: { name: 'Editor', institution: 'University', role: 'Researcher', mailing_list: false, is_admin: true } })).body.is_admin, false);
  for (const [slug, content] of Object.entries(pageDefaults)) {
    assert.equal((await call('/pages/' + slug, { gate: false })).status, 401);
    const initial = await call('/pages/' + slug);
    assert.equal(initial.status, 200);
    assert.equal(initial.body.revision, 0);
    assert.deepEqual(initial.body.content, content);
    const update = { method: 'PATCH', body: { revision: 0, content } };
    assert.equal((await call('/pages/' + slug, update)).status, 401);
    assert.equal((await call('/pages/' + slug, { ...update, token })).status, 403);
  }
  sqlite.prepare('UPDATE members SET is_admin=1 WHERE id=?').run(account.member.id);
  for (const [slug, content] of Object.entries(pageDefaults)) {
    const updated = { ...content, title: 'Edited ' + content.title, private_note: 'never publish this' };
    const saved = await call('/pages/' + slug, { method: 'PATCH', token, body: { revision: 0, content: updated } });
    assert.equal(saved.status, 200);
    assert.equal(saved.body.revision, 1);
    const viewed = (await call('/pages/' + slug)).body;
    assert.equal(viewed.content.title, updated.title);
    assert.equal(viewed.content.private_note, undefined);
    assert.equal(viewed.updated_by, undefined);
    assert.ok(!JSON.stringify(viewed).includes('editor@example.invalid'));
    assert.equal((await call('/pages/' + slug, { method: 'PATCH', token, body: { revision: 0, content } })).status, 409);
    assert.equal((await call('/pages/' + slug, { method: 'PATCH', token, body: { revision: 1, content } })).body.revision, 2);
    assert.equal((await call('/pages/' + slug, { method: 'PATCH', token, body: { revision: 1, content } })).status, 409);
  }
  assert.equal((await call('/pages/membership', { method: 'PATCH', token, body: { revision: 0, content: {} } })).status, 404);
  sqlite.close();
});

test('page editing rejects unsafe links, excessive input and changes to event identifiers', async () => {
  const { call, sqlite } = setup();
  const account = (await call('/auth/register', { method: 'POST', body: { name: 'Editor', email: 'editor@example.invalid', password: 'long test password' } })).body;
  sqlite.prepare('UPDATE members SET is_admin=1 WHERE id=?').run(account.member.id);
  const save = (slug, content) => call('/pages/' + slug, { method: 'PATCH', token: account.token, body: { revision: 0, content } });
  for (const url of ['javascript:alert(1)', 'data:text/html,bad', 'https://password@example.com']) {
    const content = structuredClone(pageDefaults.resources);
    content.resources[0].url = url;
    assert.equal((await save('resources', content)).status, 400);
  }
  const events = structuredClone(pageDefaults.events); events.series[0].id = 'untrusted';
  assert.equal((await save('events', events)).status, 400);
  const who = structuredClone(pageDefaults['who-we-are']); who.trustees[0].avatar = 'javascript:bad';
  assert.equal((await save('who-we-are', who)).status, 400);
  assert.equal((await save('about', { ...pageDefaults.about, mission: 'x'.repeat(10001) })).status, 400);
  assert.equal((await save('about', { ...pageDefaults.about, mission: 'x'.repeat(250001) })).status, 413);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM site_pages').get().n, 0);
  sqlite.close();
});

test('signup no longer needs research text and profile changes preserve existing research', async () => {
  const { call, sqlite } = setup();
  const result = await call('/auth/register', { method: 'POST', body: { name: 'Member', email: 'new@example.invalid', password: 'long test password', research: undefined } });
  assert.equal(result.status, 201);
  assert.equal(result.body.member.research, '');
  sqlite.prepare('UPDATE members SET research=? WHERE id=?').run('Existing private description', result.body.member.id);
  const updated = await call('/me', { method: 'PATCH', token: result.body.token, body: { name: 'Member', institution: 'Institute', role: 'Researcher', mailing_list: false } });
  assert.equal(updated.status, 200);
  assert.equal(sqlite.prepare('SELECT research FROM members WHERE id=?').get(result.body.member.id).research, 'Existing private description');
  sqlite.close();
});
