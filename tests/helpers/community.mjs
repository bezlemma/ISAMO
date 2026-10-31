import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import worker from '../../community/worker.mjs';
export function setup() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync('community/schema.sql', 'utf8'));
  const wrap = (sql, values = []) => ({
    bind: (...args) => wrap(sql, args),
    first: async () => sqlite.prepare(sql).get(...values) || null,
    all: async () => ({ results: sqlite.prepare(sql).all(...values) }),
    run: async () => sqlite.prepare(sql).run(...values)
  });
  const env = { DEMO_KEY: 'test-demo-key', AUTH_PEPPER: 'test-only-pepper', ALLOWED_ORIGINS: 'https://avianmodel.org', DB: { prepare: wrap, batch: async statements => { sqlite.exec('BEGIN'); try { const results = []; for (const s of statements) results.push(await s.run()); sqlite.exec('COMMIT'); return results; } catch (error) { sqlite.exec('ROLLBACK'); throw error; } } } };
  async function call(path, { method = 'GET', body, token, gate = true, origin = 'https://avianmodel.org' } = {}) {
    const response = await worker.fetch(new Request('https://api.example.test' + path, { method, headers: { Origin: origin, ...(gate ? { 'X-Demo-Key': env.DEMO_KEY } : {}), ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(path === '/auth/register' ? {institution:'Test University',role:'Researcher',research:'Avian biology',mailing_list:true,...body} : body) : undefined }), env);
    return { status: response.status, body: await response.json() };
  }
  return { call, sqlite, env };
}

