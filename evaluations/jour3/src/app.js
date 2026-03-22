const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const requestLogger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/auth');
const livresRoutes = require('./routes/livres');

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

const corsOrigins = process.env.CORS_ORIGINS;
const corsOptions = corsOrigins
  ? { origin: corsOrigins.split(',').map((s) => s.trim()) }
  : {};
app.use(cors(corsOptions));

app.use(requestLogger);
app.use(express.json({ limit: '10kb' }));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Library API — Jour 3',
      version: '1.0.0',
      description: 'API REST bibliothèque avec JWT, rôles et sécurité applicative',
    },
    servers: [{ url: '/', description: 'Serveur local' }],
  },
  apis: [path.join(__dirname, 'routes', 'auth.js'), path.join(__dirname, 'routes', 'livres.js')],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/livres', livresRoutes);

app.use(errorHandler);

module.exports = app;
