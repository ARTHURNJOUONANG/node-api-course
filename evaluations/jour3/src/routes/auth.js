const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Trop de tentatives de connexion, réessayez plus tard.' },
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion et obtention d'un JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: motdepasse12
 *     responses:
 *       200:
 *         description: Token émis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 token:
 *                   type: string
 *       400:
 *         description: Données invalides (validation)
 *       401:
 *         description: Identifiants incorrects
 */
router.post('/login', loginLimiter, authController.login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Création de compte
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom, email, password]
 *             properties:
 *               nom:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: Compte créé
 *       409:
 *         description: Email déjà utilisé
 */
router.post('/register', authController.register);

router.get('/me', authenticate, authController.me);

module.exports = router;
