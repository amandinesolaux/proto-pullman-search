const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const PORT = process.argv[2] || 3456;
const MIME = {'.html':'text/html','.css':'text/css','.js':'application/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2','.woff':'font/woff','.webp':'image/webp'};

http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(ROOT, url);

  // Try exact path, then with .html, then index.html in directory
  const candidates = [file];
  if (!path.extname(file)) candidates.push(file + '.html');
  if (url === '/') candidates.push(path.join(ROOT, 'index.html'));

  for (const f of candidates) {
    if (fs.existsSync(f) && fs.statSync(f).isFile()) {
      const ext = path.extname(f).toLowerCase();
      res.writeHead(200, {'Content-Type': MIME[ext] || 'application/octet-stream'});
      fs.createReadStream(f).pipe(res);
      return;
    }
  }
  res.writeHead(404, {'Content-Type':'text/plain'});
  res.end('404 Not Found: ' + url);
}).listen(PORT, '127.0.0.1', () => console.log('Serving ' + ROOT + ' on http://localhost:' + PORT));
