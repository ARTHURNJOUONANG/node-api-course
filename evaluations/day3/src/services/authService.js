const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Prisma } = require('@prisma/client');
const prisma = require('../db/prisma');
const { jwtSecret, jwtRefreshSecret, jwtExpiresIn, jwtRefreshExpiresIn } = require('../config/env');

const BCRYPT_ROUNDS = 12;
const AUTH_ERROR = 'Identifiants incorrects';

function makeError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function toPublicUser(user) {
  const { password: _p, ...publicUser } = user;
  return publicUser;
}

function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email }, jwtSecret, { expiresIn: jwtExpiresIn });
}

function signRefreshToken(user) {
  return jwt.sign({ sub: user.id }, jwtRefreshSecret, { expiresIn: jwtRefreshExpiresIn });
}

function refreshExpiresAt() {
  const now = Date.now();
  return new Date(now + 7 * 24 * 60 * 60 * 1000);
}

async function register({ nom, email, password }) {
  const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
  try {
    const user = await prisma.user.create({
      data: { nom, email, password: hashed, role: 'user' },
    });
    const accessToken = signAccessToken(user);
    return { user: toPublicUser(user), accessToken };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw makeError(409, 'Cet email est déjà utilisé');
    }
    throw err;
  }
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw makeError(401, AUTH_ERROR);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw makeError(401, AUTH_ERROR);

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: refreshExpiresAt(),
    },
  });

  return { user: toPublicUser(user), accessToken, refreshToken };
}

async function refresh(refreshToken) {
  if (!refreshToken) throw makeError(401, 'Refresh token manquant');

  try {
    jwt.verify(refreshToken, jwtRefreshSecret);
  } catch (_err) {
    throw makeError(401, 'Refresh token invalide');
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });
  if (!stored || stored.expiresAt < new Date()) {
    throw makeError(401, 'Refresh token invalide');
  }

  const accessToken = signAccessToken(stored.user);
  return { accessToken };
}

async function logout(refreshToken) {
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }
}

module.exports = { register, login, refresh, logout };
