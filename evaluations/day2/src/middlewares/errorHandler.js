const { ZodError } = require('zod');
const AppError = require('../utils/AppError');

function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Données invalides',
      details: err.flatten(),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    error: 'Erreur interne du serveur',
  });
}

module.exports = errorHandler;
