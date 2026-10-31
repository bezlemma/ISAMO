import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('preview-dist');
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.bin':'application/octet-stream','.txt':'text/plain'};
const server=createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost');
    let file=path.resolve(root,decodeURIComponent(url.pathname.slice(1)));
    if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
    try {if((await stat(file)).isDirectory())file=path.join(file,'index.html');}
    catch {file=path.join(root,'404.html');res.statusCode=404;}
    res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
    res.setHeader('Cache-Control','no-store');
    res.end(await readFile(file));
  }catch {res.writeHead(500);res.end('Preview failed');}
});
server.listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173/'));
