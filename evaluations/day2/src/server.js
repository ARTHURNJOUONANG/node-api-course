require('./config/env');
const app = require('./app');
const { port } = require('./config/env');

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
