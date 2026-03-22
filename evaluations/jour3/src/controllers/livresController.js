const prisma = require('../db/prisma');
const { createLivreSchema, updateLivreSchema } = require('../validators/livreValidator');

function httpError(statusCode, message) {
  const e = new Error(message);
  e.statusCode = statusCode;
  return e;
}

function parseId(param) {
  const id = Number.parseInt(param, 10);
  return Number.isNaN(id) ? null : id;
}

async function list(req, res, next) {
  try {
    const livres = await prisma.livre.findMany({ orderBy: { id: 'asc' } });
    return res.status(200).json({ success: true, data: livres });
  } catch (err) {
    return next(err);
  }
}

async function getById(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return next(httpError(400, 'ID invalide'));
    const livre = await prisma.livre.findUnique({ where: { id } });
    if (!livre) return next(httpError(404, 'Livre introuvable'));
    return res.status(200).json({ success: true, data: livre });
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const body = createLivreSchema.parse(req.body);
    const livre = await prisma.livre.create({
      data: {
        titre: body.titre,
        auteur: body.auteur,
        annee: body.annee ?? null,
        genre: body.genre ?? null,
        userId: req.user.id,
      },
    });
    return res.status(201).json({ success: true, data: livre });
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return next(httpError(400, 'ID invalide'));
    const body = updateLivreSchema.parse(req.body);
    const existing = await prisma.livre.findUnique({ where: { id } });
    if (!existing) return next(httpError(404, 'Livre introuvable'));

    const livre = await prisma.livre.update({
      where: { id },
      data: body,
    });
    return res.status(200).json({ success: true, data: livre });
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) return next(httpError(400, 'ID invalide'));
    const existing = await prisma.livre.findUnique({ where: { id } });
    if (!existing) return next(httpError(404, 'Livre introuvable'));
    await prisma.livre.delete({ where: { id } });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
