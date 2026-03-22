const livresService = require('../services/livres.service');
const { createLivreSchema, updateLivreSchema } = require('../validation/schemas');
const asyncHandler = require('../utils/asyncHandler');

function parseId(param) {
  const id = Number.parseInt(param, 10);
  if (Number.isNaN(id)) {
    return null;
  }
  return id;
}

const list = asyncHandler(async (req, res) => {
  const livres = await livresService.listLivres();
  res.status(200).json({ success: true, data: livres });
});

const getById = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ success: false, error: 'ID invalide' });
  }
  const livre = await livresService.getLivreById(id);
  res.status(200).json({ success: true, data: livre });
});

const create = asyncHandler(async (req, res) => {
  const body = createLivreSchema.parse(req.body);
  const livre = await livresService.createLivre(body);
  res.status(201).json({ success: true, data: livre });
});

const update = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ success: false, error: 'ID invalide' });
  }
  const body = updateLivreSchema.parse(req.body);
  const livre = await livresService.updateLivre(id, body);
  res.status(200).json({ success: true, data: livre });
});

const remove = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ success: false, error: 'ID invalide' });
  }
  await livresService.deleteLivre(id);
  res.status(204).send();
});

const emprunter = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ success: false, error: 'ID invalide' });
  }
  const result = await livresService.emprunterLivre(id, req.user.id);
  res.status(200).json({ success: true, data: result });
});

const retourner = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ success: false, error: 'ID invalide' });
  }
  const result = await livresService.retournerLivre(id, req.user.id);
  res.status(200).json({ success: true, data: result });
});

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  emprunter,
  retourner,
};
