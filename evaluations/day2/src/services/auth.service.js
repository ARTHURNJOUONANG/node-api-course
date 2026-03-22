const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Prisma } = require('@prisma/client');
const prisma = require('../db/prisma');
const { jwtSecret, jwtExpiresIn } = require('../config/env');
const AppError = require('../utils/AppError');

const BCRYPT_ROUNDS = 12;

function toPublicUser(user) {
  const { password: _p, ...rest } = user;
  return rest;
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: jwtExpiresIn },
  );
}

async function register(data) {
  const hashed = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
  try {
    const user = await prisma.user.create({
      data: {
        nom: data.nom,
        email: data.email,
        password: hashed,
        role: 'user',
      },
    });
    const publicUser = toPublicUser(user);
    const token = signToken(user);
    return { user: publicUser, token };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new AppError(409, 'Cet email est déjà utilisé');
    }
    throw err;
  }
}

async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(401, 'Identifiants incorrects');
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    throw new AppError(401, 'Identifiants incorrects');
  }
  const publicUser = toPublicUser(user);
  const token = signToken(user);
  return { user: publicUser, token };
}

async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, nom: true, email: true, role: true, createdAt: true },
  });
  if (!user) {
    throw new AppError(401, 'Utilisateur introuvable');
  }
  return user;
}

module.exports = {
  register,
  login,
  getProfile,
};
