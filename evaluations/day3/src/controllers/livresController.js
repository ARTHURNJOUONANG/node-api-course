const livreService = require('../services/livreService');

function parseId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isNaN(id) ? null : id;
}

async function list(req, res, next) {
  try {
    const data = await livreService.listLivres();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function getById(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      const e = new Error('ID invalide');
      e.statusCode = 400;
      throw e;
    }
    const data = await livreService.getLivreById(id);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await livreService.createLivre(req.validatedBody);
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      const e = new Error('ID invalide');
      e.statusCode = 400;
      throw e;
    }
    const data = await livreService.updateLivre(id, req.validatedBody);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      const e = new Error('ID invalide');
      e.statusCode = 400;
      throw e;
    }
    await livreService.deleteLivre(id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, getById, create, update, remove };
