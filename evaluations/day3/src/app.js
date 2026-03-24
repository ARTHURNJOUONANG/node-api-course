const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const authRoutes = require('./routes/auth');
const livresRoutes = require('./routes/livres');
const swaggerSpec = require('./docs/swagger');
const { nodeEnv, allowedOrigins } = require('./config/env');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());

const corsOptions = nodeEnv === 'production'
  ? {
      origin: allowedOrigins.split(',').map((v) => v.trim()).filter(Boolean),
      credentials: true,
    }
  : { origin: true, credentials: true };
app.use(cors(corsOptions));

app.use(morgan(nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/livres', livresRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
