function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const ts = new Date().toISOString();
    const ms = Date.now() - start;
    console.log(`[${ts}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${ms}ms)`);
  });
  next();
}

module.exports = requestLogger;
