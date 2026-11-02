import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import worker from './worker.mjs';
import { localDatabase } from './local-db.mjs';

export const LOCAL_KEY = 'local-development-only';
export const LOCAL_PASSWORD = 'local-demo-password-2026';

export async function createLocalCommunity() {
  const { sqlite, DB } = localDatabase();
  // Construct a fresh environment. Never inherit production bindings or secrets.
  const env = {
    DB, DEMO_KEY: LOCAL_KEY, AUTH_PEPPER: randomBytes(32).toString('hex'),
    ALLOWED_ORIGINS: 'http://127.0.0.1:3000,http://localhost:3000,http://127.0.0.1:4173,http://localhost:4173',
    MAIL_ENABLED: 'false', PAYMENTS_ENABLED: 'false'
  };
  async function seed(path, body, token) {
    const response = await worker.fetch(new Request('http://127.0.0.1:8787' + path, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Demo-Key': LOCAL_KEY, ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: JSON.stringify(body)
    }), env);
    if (!response.ok) throw new Error('Could not prepare the local example database.');
    return response.json();
  }
  const profile = { password: LOCAL_PASSWORD, institution: 'Example Avian Institute', role: 'Researcher', research: 'Fictional research for testing the website.', mailing_list: false };
  const member = await seed('/auth/register', { ...profile, name: 'Alex Example', email: 'member@example.invalid' });
  const admin = await seed('/auth/register', { ...profile, name: 'Sam Example', email: 'admin@example.invalid' });
  sqlite.prepare('UPDATE members SET is_admin=1 WHERE id=?').run(admin.member.id);
  sqlite.exec('UPDATE members SET email_verified=1');
  await seed('/posts', { title: 'Welcome to the local community', body: 'This is a fictional post. Changes here are discarded when the local server stops.' }, member.token);
  const date = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  await seed('/posts', { title: 'Example avian seminar', body: 'A fictional event for trying the events page.', kind: 'event', event_date: date, event_series: 'seminar' }, admin.token);
  return { env, sqlite };
}

export async function startLocalCommunity(port = 8787) {
  const { env, sqlite } = await createLocalCommunity();
  const server = createServer(async (incoming, outgoing) => {
    try {
      const chunks = []; let size = 0;
      for await (const chunk of incoming) {
        size += chunk.length;
        if (size > 250000) { outgoing.writeHead(413); outgoing.end('Request too large'); return; }
        chunks.push(chunk);
      }
      const method = incoming.method || 'GET';
      const request = new Request('http://127.0.0.1:' + port + incoming.url, {
        method, headers: incoming.headers,
        ...(!['GET', 'HEAD'].includes(method) ? { body: Buffer.concat(chunks) } : {})
      });
      const response = await worker.fetch(request, env);
      outgoing.writeHead(response.status, Object.fromEntries(response.headers));
      outgoing.end(Buffer.from(await response.arrayBuffer()));
    } catch { outgoing.writeHead(500); outgoing.end('Local community request failed.'); }
  });
  server.once('close', () => sqlite.close());
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  return server;
}
