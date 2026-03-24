const prisma = require('../db/prisma');

function makeError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function listLivres() {
  return prisma.livre.findMany({ orderBy: { id: 'asc' } });
}

async function getLivreById(id) {
  const livre = await prisma.livre.findUnique({ where: { id } });
  if (!livre) throw makeError(404, 'Livre introuvable');
  return livre;
}

async function createLivre({ titre, auteur, annee, genre }) {
  return prisma.livre.create({
    data: {
      titre,
      auteur,
      annee: annee ?? null,
      genre: genre ?? null,
    },
  });
}

async function updateLivre(id, { titre, auteur, annee, genre, disponible }) {
  await getLivreById(id);
  return prisma.livre.update({
    where: { id },
    data: {
      ...(titre !== undefined ? { titre } : {}),
      ...(auteur !== undefined ? { auteur } : {}),
      ...(annee !== undefined ? { annee } : {}),
      ...(genre !== undefined ? { genre } : {}),
      ...(disponible !== undefined ? { disponible } : {}),
    },
  });
}

async function deleteLivre(id) {
  await getLivreById(id);
  await prisma.livre.delete({ where: { id } });
}

module.exports = { listLivres, getLivreById, createLivre, updateLivre, deleteLivre };
