require('dotenv').config();

const required = ['DATABASE_URL', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Variable d'environnement manquante : ${key}`);
  }
}

const app = require('./app');
const port = parseInt(process.env.PORT || '3000', 10);

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
