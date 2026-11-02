import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes,webcrypto} from 'node:crypto';
import {mkdir,readFile,writeFile,readdir,rm} from 'node:fs/promises';
import path from 'node:path';
import {gunzipSync,gzipSync} from 'node:zlib';
import {createContext,runInContext} from 'node:vm';
import {deriveKey,encrypt,decrypt} from '../scripts/preview-crypto.mjs';
import {protect} from '../scripts/protect-preview.mjs';

test('encrypted data rejects the wrong password and tampering',()=>{
  const salt=randomBytes(16),key=deriveKey('correct test password',salt),plain=Buffer.from('confidential test fixture'),cipher=encrypt(plain,key);
  assert.deepEqual(decrypt(cipher,key),plain);
  assert.equal(cipher.includes(plain),false);
  assert.throws(()=>decrypt(cipher,deriveKey('wrong test password',salt)));
  cipher[15]^=1;assert.throws(()=>decrypt(cipher,key));
});

test('an open browser can unlock a replacement release after caching the previous configuration',async()=>{
  const password='test-only-release-password';
  function release(version){
    const salt=randomBytes(16),key=deriveKey(password,salt);
    return {
      config:{version,salt:salt.toString('base64'),iterations:600000,manifest:version,session_hours:4},
      manifest:encrypt(gzipSync(JSON.stringify({version,files:{}})),key),
    };
  }
  const previous=release('previous'),replacement=release('replacement');
  let current=previous,saved;
  const handlers=new Map();
  const context=createContext({
    crypto:webcrypto,TextEncoder,TextDecoder,Blob,Response,DecompressionStream,URL,atob,
    self:{addEventListener:(name,handler)=>handlers.set(name,handler),clients:{matchAll:async()=>[]}},
    fetch:async url=>{
      if(url.startsWith('/_preview/config.json'))return Response.json(current.config);
      return url===`/_preview/payload/${current.config.manifest}.bin`
        ?new Response(current.manifest):new Response('Not found',{status:404});
    },
  });
  runInContext(await readFile('hosting/worker.js','utf8'),context);
  context.storedSession=async(action,value)=>{if(action==='put')saved=value;else if(action==='delete')saved=undefined;return saved;};
  async function message(data){
    let pending,result;
    handlers.get('message')({data,ports:[{postMessage:value=>result=value}],waitUntil:promise=>pending=promise});
    await pending;return result;
  }
  assert.equal((await message({type:'status'})).ok,false);
  current=replacement;
  assert.equal((await message({type:'unlock',password})).ok,true);
  assert.equal(saved.version,'replacement');
  await message({type:'lock'});
  assert.equal((await message({type:'unlock',password:'wrong password'})).ok,false);
  assert.equal((await message({type:'status'})).ok,false);
});

test('every published route and asset is protected, including direct deep links',async()=>{
  const root=path.resolve('tmp/security-test'),source=path.join(root,'source'),output=path.join(root,'output');
  assert.ok(root.startsWith(path.resolve('tmp')+path.sep));
  await rm(root,{recursive:true,force:true});await mkdir(path.join(source,'resources'),{recursive:true});await mkdir(path.join(source,'_nuxt'),{recursive:true});
  const marker='PRIVATE-CONTENT-TEST-983416';
  await writeFile(path.join(source,'index.html'),'<html><body>'+marker+'</body></html>');
  await writeFile(path.join(source,'resources/index.html'),'<html><body>'+marker+' resources</body></html>');
  await writeFile(path.join(source,'_nuxt/app.js'),'console.log("'+marker+'");');
  await writeFile(path.join(source,'portrait.png'),Buffer.from(marker));
  await assert.rejects(protect({source,output,password:''}),/ISAMO_DEMO_PASSWORD/);
  const password='test-only-password-2026-long';
  await protect({source,output,password});
  const config=JSON.parse(await readFile(path.join(output,'_preview/config.json'),'utf8'));
  const key=deriveKey(password,Buffer.from(config.salt,'base64'));
  const unpack=async id=>gunzipSync(decrypt(await readFile(path.join(output,'_preview/payload',id+'.bin')),key));
  const manifest=JSON.parse((await unpack(config.manifest)).toString());
  for(const name of ['/','/resources/','/_nuxt/app.js','/portrait.png']) assert.ok(manifest.files[name],name);
  assert.match((await unpack(manifest.files['/resources/'].id)).toString(),/PRIVATE-CONTENT-TEST/);
  for(const name of ['index.html','404.html','resources/index.html'])assert.match(await readFile(path.join(output,name),'utf8'),/<form id="unlock">/);
  for(const file of await readdir(output,{recursive:true,withFileTypes:true})){
    if(!file.isFile())continue;
    const bytes=await readFile(path.join(file.parentPath,file.name));
    assert.equal(bytes.includes(Buffer.from(marker)),false,file.name+' leaked content');
    assert.equal(bytes.includes(Buffer.from(password)),false,file.name+' leaked password');
  }
  assert.equal((await readdir(output)).includes('_nuxt'),false);
  const worker=await readFile(path.join(output,'preview-worker.js'),'utf8');
  assert.match(worker,/isamo-preview-access/);
  assert.match(worker,/startsWith\('\/'\)/);
});

test('resource links include ChickyBase and major facilities without duplicate URLs',async()=>{
  const resources=JSON.parse(await readFile('data/chicken-resources.json','utf8'));
  assert.equal(new Set(resources.map(r=>r.url)).size,resources.length);
  for(const item of resources){assert.equal(new URL(item.url).protocol,'https:');assert.ok(item.description);assert.ok(item.category);}
  for(const name of ['ChickyBase','Nagoya','Roslin'])assert.ok(resources.some(r=>r.name.includes(name)));
});
