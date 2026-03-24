const { ZodError } = require('zod');
const { nodeEnv } = require('../config/env');

function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({ success: false, error: 'Données invalides', details: err.flatten() });
  }

  const status = err.statusCode || 500;

  // Avoid sensitive request data in logs
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err.message);

  if (nodeEnv === 'production' && status >= 500) {
    return res.status(status).json({ success: false, error: 'Erreur interne' });
  }

  return res.status(status).json({
    success: false,
    error: err.message || 'Erreur interne',
  });
}

function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    error: 'Route non trouvée',
    path: req.originalUrl,
  });
}

module.exports = { errorHandler, notFound };
