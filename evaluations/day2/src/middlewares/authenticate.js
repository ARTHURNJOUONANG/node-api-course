const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const prisma = require('../db/prisma');

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Token manquant ou invalide' });
  }

  const token = header.slice(7).trim();
  if (!token) {
    return res.status(401).json({ success: false, error: 'Token manquant ou invalide' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, nom: true, email: true, role: true, createdAt: true },
    });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Token manquant ou invalide' });
    }
    req.user = user;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expiré' });
    }
    return res.status(401).json({ success: false, error: 'Token manquant ou invalide' });
  }
}

module.exports = authenticate;
