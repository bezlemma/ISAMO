import { readFile, readdir, mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { randomBytes, createHash } from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';
import { deriveKey, encrypt, decrypt, ITERATIONS } from './preview-crypto.mjs';

const root = path.resolve(import.meta.dirname, '..');
const base = '/';
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.avif':'image/avif','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.txt':'text/plain','.ico':'image/x-icon'};

export async function protect({source = path.join(root,'.output/public'), output = path.join(root,'preview-dist'), password = process.env.ISAMO_DEMO_PASSWORD} = {}) {
  if (!password || password.length < 20) throw new Error('ISAMO_DEMO_PASSWORD must contain at least 20 characters. Nothing was published.');
  source = path.resolve(source); output = path.resolve(output);
  // Only remove known generated output within this checkout.
  if (output !== path.join(root,'preview-dist') && !output.startsWith(path.join(root,'tmp') + path.sep)) throw new Error('Unsafe output path');
  if (source === output || source.startsWith(output + path.sep)) throw new Error('Output contains source');
  await readFile(path.join(source,'index.html'));
  await rm(output,{recursive:true,force:true});
  await mkdir(path.join(output,'_preview/payload'),{recursive:true});
  const salt = randomBytes(16), key = deriveKey(password,salt), version = randomBytes(12).toString('hex');
  const files = {};
  let count = 0;
  async function pack(bytes) {
    const encrypted = encrypt(gzipSync(bytes),key);
    if (!gunzipSync(decrypt(encrypted,key)).equals(bytes)) throw new Error('Encrypted asset verification failed');
    const id = createHash('sha256').update(encrypted).digest('hex');
    await writeFile(path.join(output,'_preview/payload',id+'.bin'),encrypted);
    count++;
    return id;
  }
  const favicon = 'data:image/png;base64,' + (await readFile(path.join(root,'public/favicon.png'))).toString('base64');
  const template = async file => (await readFile(path.join(root,'hosting',file),'utf8')).replaceAll('__BUILD_VERSION__',version).replaceAll('__FAVICON__',favicon);
  const login = await template('login.html');
  for (const file of await readdir(source,{recursive:true,withFileTypes:true})) {
    if (!file.isFile()) continue;
    const full = path.join(file.parentPath,file.name);
    const relative = path.relative(source,full).split(path.sep).join('/');
    if (['.nojekyll','CNAME','robots.txt'].includes(relative)) continue;
    let bytes = await readFile(full);
    const extension = path.extname(relative);
    if (extension === '.html') {
      bytes = Buffer.from(bytes.toString().replace('</body>','<script src="'+base+'_preview/session.js" defer></script></body>'));
      const destination = path.join(output,relative);
      await mkdir(path.dirname(destination),{recursive:true});
      await writeFile(destination,login);
    }
    const entry = {id:await pack(bytes),type:mime[extension]||'application/octet-stream'};
    files[base+relative] = entry;
    if (relative.endsWith('index.html')) files[base+relative.slice(0,-10)] = entry;
  }
  const manifest = await pack(Buffer.from(JSON.stringify({version,files})));
  await writeFile(path.join(output,'_preview/config.json'),JSON.stringify({version,salt:salt.toString('base64'),iterations:ITERATIONS,manifest,session_hours:4}));
  for (const file of ['login.html','login.js','session.js']) await writeFile(path.join(output,'_preview',file),await template(file));
  await writeFile(path.join(output,'preview-worker.js'),(await readFile(path.join(root,'hosting/worker.js'),'utf8')).replace('__BUILD_VERSION__',version));
  for (const file of ['index.html','404.html']) await writeFile(path.join(output,file),login);
  await writeFile(path.join(output,'robots.txt'),'User-agent: *\nDisallow: /\n');
  await writeFile(path.join(output,'.nojekyll'),'');
  console.log('Verified encrypted demo: '+count+' payloads.');
  return {files: Object.keys(files).length, payloads:count, version};
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await protect();
