const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.md':'text/plain; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.pdf':'application/pdf','.woff2':'font/woff2','.mp4':'video/mp4','.webm':'video/webm','.gif':'image/gif'};

function startServer({port = 0, prefix = '/', directory = root} = {}) {
  if (!prefix.startsWith('/') || !prefix.endsWith('/')) throw new Error('prefix는 /로 시작하고 끝나야 합니다.');
  const base = fs.realpathSync(directory);
  const server = http.createServer((req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (!pathname.startsWith(prefix)) {res.writeHead(404).end(); return;}
      const relative = pathname.slice(prefix.length) || 'index.html';
      if (relative.split('/').some(part => part.startsWith('.')) || /^(node_modules|_site|tmp)\//.test(relative)) {res.writeHead(404).end(); return;}
      const file = path.resolve(base, relative);
      if (!file.startsWith(base + path.sep)) {res.writeHead(403).end(); return;}
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {res.writeHead(404).end(); return;}
      const real = fs.realpathSync(file);
      if (!real.startsWith(base + path.sep)) {res.writeHead(403).end(); return;}
      const size=fs.statSync(real).size,headers={'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes'};
      let start=0,end=size-1,status=200;
      if(req.headers.range){
        const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        if(!match||(!match[1]&&!match[2])){res.writeHead(416,{'Content-Range':`bytes */${size}`}).end();return;}
        if(match[1]){start=Number(match[1]);end=match[2]?Math.min(size-1,Number(match[2])):size-1;}
        else start=Math.max(0,size-Number(match[2]));
        if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=size||end<start){res.writeHead(416,{'Content-Range':`bytes */${size}`}).end();return;}
        status=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`;
      }
      headers['Content-Length']=Math.max(0,end-start+1);res.writeHead(status,headers);
      if (req.method === 'HEAD'||size===0) res.end(); else fs.createReadStream(real,{start,end}).pipe(res);
    } catch {res.writeHead(400).end();}
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve({server, url:`http://127.0.0.1:${server.address().port}${prefix}`}));
  });
}
module.exports = {startServer};
if (require.main === module) {
  const portIndex = process.argv.indexOf('--port');
  const port = Number(portIndex >= 0 ? process.argv[portIndex + 1] : process.env.PORT || 4173);
  startServer({port}).then(({url}) => console.log('기획 작업대: ' + url + 'feature-inventory.html'))
    .catch(error => {console.error(error.code === 'EADDRINUSE' ? '포트 사용 중: npm run dev -- --port 4174 로 별도 실행하세요.' : error); process.exitCode = 1;});
}
