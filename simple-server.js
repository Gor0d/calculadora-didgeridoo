const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;

// MIME types mapping
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, 'build5', req.url === '/' ? 'index.html' : req.url);
  
  // Remove query parameters
  const urlWithoutQuery = req.url.split('?')[0];
  if (urlWithoutQuery !== '/') {
    filePath = path.join(__dirname, 'build5', urlWithoutQuery);
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // For client-side routing, serve index.html for non-existent routes
      filePath = path.join(__dirname, 'build5', 'index.html');
    }

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - Not Found</h1><p>Build not found. Please run "npm run build:web" first.</p>');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Calculadora Didgeridoo rodando em http://localhost:${port}`);
  console.log(`📱 Acesse no seu celular usando o IP da rede local na porta ${port}`);
  console.log(`💻 Para parar o servidor, pressione Ctrl+C`);
});