const { port } = require('./config/env');
const app = require('./app');

app.listen(port, () => {
  console.log(`Serveur demarre sur http://localhost:${port}`);
});
