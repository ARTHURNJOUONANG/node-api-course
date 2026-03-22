const authService = require('../services/auth.service');
const { registerSchema, loginSchema } = require('../validation/schemas');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const body = registerSchema.parse(req.body);
  const result = await authService.register(body);
  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const body = loginSchema.parse(req.body);
  const result = await authService.login(body.email, body.password);
  res.status(200).json(result);
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  res.status(200).json({ user });
});

module.exports = {
  register,
  login,
  me,
};
