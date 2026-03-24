const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const authenticate = require('../middlewares/authenticate');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../validators/authValidator');

const router = Router();

const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Trop de tentatives, réessayez plus tard.' },
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Creer un compte utilisateur
 *     tags: [Auth]
 *     responses:
 *       201: { description: Compte cree }
 *       409: { description: Email deja utilise }
 */
router.post('/register', strictAuthLimiter, validate(registerSchema), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     responses:
 *       200: { description: Connecte }
 *       401: { description: Identifiants incorrects }
 */
router.post('/login', strictAuthLimiter, validate(loginSchema), authController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renouvelle le token d'acces via cookie refresh
 *     tags: [Auth]
 *     responses:
 *       200: { description: Nouveau access token }
 *       401: { description: Refresh token invalide }
 */
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

module.exports = router;
