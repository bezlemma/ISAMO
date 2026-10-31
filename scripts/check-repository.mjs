import { execFileSync } from 'node:child_process';
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const disallowed = /(^|\/)(?:tmp|backend|pb_data|\.wrangler|node_modules|preview-dist|\.output)(?:\/|$)|(^|\/)\.env(?:\.|$)|(^|\/)\.dev\.vars(?:\.|$)|\.(?:db(?:-.*)?|sqlite3?|bundle|pem|key)$/i;
const bad = files.filter(path => path !== '.env.example' && disallowed.test(path));
if (bad.length) { console.error('Private or generated files must not be tracked:\n' + bad.join('\n')); process.exitCode = 1; }
else console.log('Tracked files exclude local data, credentials and generated output.');
