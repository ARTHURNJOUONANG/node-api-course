const { Router } = require('express');
const livresController = require('../controllers/livresController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { createLivreSchema, updateLivreSchema } = require('../validators/livreValidator');

const router = Router();

/**
 * @swagger
 * /api/livres:
 *   get:
 *     summary: Liste des livres
 *     tags: [Livres]
 *     responses:
 *       200: { description: OK }
 */
router.get('/', livresController.list);
router.get('/:id', livresController.getById);
router.post('/', authenticate, validate(createLivreSchema), livresController.create);
router.put('/:id', authenticate, validate(updateLivreSchema), livresController.update);
router.delete('/:id', authenticate, authorize('admin'), livresController.remove);

module.exports = router;
