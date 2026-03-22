const express = require('express');
const authRoutes = require('./routes/auth.routes');
const livresRoutes = require('./routes/livres.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/livres', livresRoutes);

app.use(errorHandler);

module.exports = app;
