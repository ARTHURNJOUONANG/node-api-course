const jwt = require('jsonwebtoken');
const prisma = require('../db/prisma');

function getJwtSecret() {
  return process.env.JWT_SECRET;
}

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentification requise : token Bearer manquant',
    });
  }

  const token = header.slice(7).trim();
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentification requise : token Bearer manquant',
    });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    const userId = payload.sub ?? payload.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nom: true, email: true, role: true, createdAt: true },
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Token invalide : utilisateur introuvable',
      });
    }
    req.user = user;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token JWT expiré ou invalide',
      });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token JWT expiré ou invalide',
      });
    }
    return next(err);
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Non authentifié' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Accès refusé' });
    }
    return next();
  };
}

async function canUpdateOwnLivreOrAdmin(req, res, next) {
  if (req.user.role === 'admin') {
    return next();
  }

  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ success: false, error: 'ID invalide' });
  }

  try {
    const livre = await prisma.livre.findUnique({ where: { id } });
    if (!livre) {
      return res.status(404).json({ success: false, error: 'Livre introuvable' });
    }
    if (livre.userId == null || livre.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Accès refusé' });
    }
    return next();
  } catch (e) {
    return next(e);
  }
}

module.exports = {
  authenticate,
  authorize,
  canUpdateOwnLivreOrAdmin,
};
