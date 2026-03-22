const express = require('express');
const livresController = require('../controllers/livresController');
const { authenticate, authorize, canUpdateOwnLivreOrAdmin } = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * /api/livres:
 *   get:
 *     summary: Liste tous les livres (public)
 *     tags: [Livres]
 *     responses:
 *       200:
 *         description: Liste des livres
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       titre:
 *                         type: string
 *                       auteur:
 *                         type: string
 */
router.get('/', livresController.list);

router.get('/:id', livresController.getById);

router.post('/', authenticate, livresController.create);

router.put('/:id', authenticate, canUpdateOwnLivreOrAdmin, livresController.update);

router.delete('/:id', authenticate, authorize('admin'), livresController.remove);

module.exports = router;
