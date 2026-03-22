const http = require('http');
const { handleRequest } = require('./modules/router');

const PORT = 3000;

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((err) => {
    console.error(err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Erreur interne' }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
