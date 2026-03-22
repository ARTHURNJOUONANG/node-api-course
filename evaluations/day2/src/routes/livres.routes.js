const { Router } = require('express');
const livresController = require('../controllers/livres.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = Router();

router.get('/', livresController.list);
router.get('/:id', livresController.getById);

router.post('/', authenticate, livresController.create);
router.put('/:id', authenticate, livresController.update);
router.delete('/:id', authenticate, authorize('admin'), livresController.remove);

router.post('/:id/emprunter', authenticate, livresController.emprunter);
router.post('/:id/retourner', authenticate, livresController.retourner);

module.exports = router;
