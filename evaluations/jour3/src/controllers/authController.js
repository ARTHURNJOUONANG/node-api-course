const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Prisma } = require('@prisma/client');
const prisma = require('../db/prisma');
const { registerSchema, loginSchema } = require('../validators/authValidator');

const BCRYPT_ROUNDS = 12;

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
  );
}

function httpError(statusCode, message) {
  const e = new Error(message);
  e.statusCode = statusCode;
  return e;
}

async function register(req, res, next) {
  try {
    const body = registerSchema.parse(req.body);
    const hashed = await bcrypt.hash(body.password, BCRYPT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        nom: body.nom,
        email: body.email,
        password: hashed,
        role: 'user',
      },
    });
    const { password: _p, ...publicUser } = user;
    const token = signToken(user);
    return res.status(201).json({ user: publicUser, token });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return next(httpError(409, 'Cet email est déjà utilisé'));
    }
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) {
      return next(httpError(401, 'Identifiants incorrects'));
    }
    const ok = await bcrypt.compare(body.password, user.password);
    if (!ok) {
      return next(httpError(401, 'Identifiants incorrects'));
    }
    const { password: _p, ...publicUser } = user;
    const token = signToken(user);
    return res.status(200).json({ user: publicUser, token });
  } catch (err) {
    return next(err);
  }
}

function me(req, res) {
  return res.status(200).json({ user: req.user });
}

module.exports = {
  register,
  login,
  me,
};
