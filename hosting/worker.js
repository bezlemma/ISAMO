const BUILD_VERSION='__BUILD_VERSION__';
let configPromise,sessionPromise;
const decoder=new TextDecoder();
async function config(){
  if(!configPromise)configPromise=fetch('/_preview/config.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('Preview configuration unavailable');return r.json();});
  return configPromise;
}
function database(){return new Promise((resolve,reject)=>{const request=indexedDB.open('isamo-preview-access',1);request.onupgradeneeded=()=>request.result.createObjectStore('session');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
async function storedSession(action,value){
  const db=await database();
  try{return await new Promise((resolve,reject)=>{
    const transaction=db.transaction('session',action==='get'?'readonly':'readwrite'),store=transaction.objectStore('session');
    const request=action==='get'?store.get('current'):action==='put'?store.put(value,'current'):store.delete('current');
    let result;request.onsuccess=()=>{result=request.result;};transaction.oncomplete=()=>resolve(result);transaction.onerror=()=>reject(transaction.error);
  });}finally{db.close();}
}
async function plaintext(id,key){
  const response=await fetch('/_preview/payload/'+id+'.bin');if(!response.ok)throw new Error('Preview asset unavailable');
  const bytes=new Uint8Array(await response.arrayBuffer());
  const zipped=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.subarray(0,12)},key,bytes.subarray(12));
  return new Response(new Blob([zipped]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
}
async function restore(){
  const settings=await config(),saved=await storedSession('get');
  if(!saved||saved.version!==settings.version||saved.expires<=Date.now())return null;
  try{return{...saved,manifest:JSON.parse(decoder.decode(await plaintext(settings.manifest,saved.key)))};}catch{return null;}
}
async function session(){
  if(!sessionPromise)sessionPromise=restore();
  const current=await sessionPromise;
  if(current?.expires<=Date.now()){sessionPromise=Promise.resolve(null);await storedSession('delete');return null;}
  return current;
}
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('message',event=>{
  const reply=message=>event.ports[0]?.postMessage(message);
  event.waitUntil((async()=>{
    if(event.data?.type==='lock'){sessionPromise=Promise.resolve(null);await storedSession('delete');for(const client of await self.clients.matchAll())client.postMessage({type:'locked'});reply({ok:true});return;}
    if(event.data?.type==='status'){reply({ok:!!await session()});return;}
    if(event.data?.type!=='unlock')return;
    try{
      const settings=await config();
      const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(event.data.password),'PBKDF2',false,['deriveKey']);
      const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:Uint8Array.from(atob(settings.salt),c=>c.charCodeAt(0)),iterations:settings.iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);
      const manifest=JSON.parse(decoder.decode(await plaintext(settings.manifest,key)));
      if(manifest.version!==settings.version)throw new Error('Version mismatch');
      const saved={key,version:settings.version,expires:Date.now()+settings.session_hours*3600000};
      await storedSession('put',saved);sessionPromise=Promise.resolve({...saved,manifest});reply({ok:true});
    }catch{reply({ok:false,error:'That passphrase did not match, or the preview could not be loaded. Check the passphrase and try again.'});}
  })());
});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin||!url.pathname.startsWith('/')||url.pathname.startsWith('/_preview/')||url.pathname==='/preview-worker.js')return;
  event.respondWith((async()=>{
    try{
      if(!['GET','HEAD'].includes(event.request.method))return new Response('Method not allowed',{status:405});
      const current=await session();
      if(!current){
        if(event.request.mode==='navigate')return fetch('/_preview/login.html',{cache:'no-store'});
        return new Response('Preview locked',{status:401,headers:{'Cache-Control':'no-store'}});
      }
      let pathname;
      try{pathname=decodeURIComponent(url.pathname);}catch{return new Response('Invalid path',{status:400});}
      const entry=current.manifest.files[pathname]||current.manifest.files[pathname+'/'];
      if(!entry)return new Response('Not found',{status:404,headers:{'Content-Type':'text/plain'}});
      const bytes=await plaintext(entry.id,current.key);
      return new Response(event.request.method==='HEAD'?null:bytes,{headers:{'Content-Type':entry.type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow, noarchive'}});
    }catch{configPromise=null;sessionPromise=null;if(event.request.mode==='navigate')return fetch('/_preview/login.html',{cache:'no-store'});return new Response('The preview could not be loaded. Reload this page to try again.',{status:503,headers:{'Content-Type':'text/plain'}});}
  })());
});
