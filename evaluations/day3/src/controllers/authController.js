const { nodeEnv } = require('../config/env');
const authService = require('../services/authService');

const REFRESH_COOKIE = 'refreshToken';

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'strict',
    secure: nodeEnv === 'production',
    path: '/api/auth',
  };
}

async function register(req, res, next) {
  try {
    const result = await authService.register(req.validatedBody);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.validatedBody);
    res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions());
    return res.status(200).json({ user: result.user, accessToken: result.accessToken });
  } catch (err) {
    return next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    const result = await authService.refresh(token);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    await authService.logout(token);
    res.clearCookie(REFRESH_COOKIE, cookieOptions());
    return res.status(200).json({ success: true, message: 'Déconnecté' });
  } catch (err) {
    return next(err);
  }
}

function me(req, res) {
  return res.status(200).json({ user: req.user });
}

module.exports = { register, login, refresh, logout, me };
