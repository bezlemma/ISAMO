import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { startLocalCommunity, LOCAL_KEY, LOCAL_PASSWORD } from '../community/local-server.mjs';

const server = await startLocalCommunity();
console.log('Local website: http://127.0.0.1:3000');
console.log('Fictional accounts: member@example.invalid or admin@example.invalid');
console.log('Local-only password: ' + LOCAL_PASSWORD);
console.log('The database resets on restart. Email and payments are disabled.');
const child = spawn(process.execPath, [fileURLToPath(new URL('../node_modules/nuxt/bin/nuxt.mjs', import.meta.url)), 'dev', '--host', '127.0.0.1', '--port', '3000'], {
  stdio: 'inherit', env: { ...process.env, NUXT_PUBLIC_COMMUNITY_URL: 'http://127.0.0.1:8787', NUXT_PUBLIC_COMMUNITY_KEY: LOCAL_KEY }
});
let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  child.kill(); server.close(); server.closeAllConnections();
}
process.once('SIGINT', stop); process.once('SIGTERM', stop);
child.once('error', error => { console.error(error.message); stop(); process.exitCode = 1; });
child.once('exit', code => { stop(); process.exitCode = code || 0; });
