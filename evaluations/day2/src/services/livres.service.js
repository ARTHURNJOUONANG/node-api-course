const prisma = require('../db/prisma');
const AppError = require('../utils/AppError');

async function listLivres() {
  return prisma.livre.findMany({ orderBy: { id: 'asc' } });
}

async function getLivreById(id) {
  const livre = await prisma.livre.findUnique({ where: { id } });
  if (!livre) {
    throw new AppError(404, 'Livre introuvable');
  }
  return livre;
}

async function createLivre(data) {
  return prisma.livre.create({
    data: {
      titre: data.titre,
      auteur: data.auteur,
      annee: data.annee ?? null,
      genre: data.genre ?? null,
    },
  });
}

async function updateLivre(id, data) {
  await getLivreById(id);
  return prisma.livre.update({
    where: { id },
    data,
  });
}

async function deleteLivre(id) {
  await getLivreById(id);
  await prisma.livre.delete({ where: { id } });
}

async function emprunterLivre(livreId, userId) {
  return prisma.$transaction(async (tx) => {
    const livre = await tx.livre.findUnique({ where: { id: livreId } });
    if (!livre) {
      throw new AppError(404, 'Livre introuvable');
    }
    if (!livre.disponible) {
      throw new AppError(409, "Ce livre n'est pas disponible");
    }

    const updated = await tx.livre.update({
      where: { id: livreId },
      data: { disponible: false },
    });

    const emprunt = await tx.emprunt.create({
      data: {
        livreId,
        userId,
      },
    });

    return { livre: updated, emprunt };
  });
}

async function retournerLivre(livreId, userId) {
  return prisma.$transaction(async (tx) => {
    const livre = await tx.livre.findUnique({ where: { id: livreId } });
    if (!livre) {
      throw new AppError(404, 'Livre introuvable');
    }

    const emprunt = await tx.emprunt.findFirst({
      where: {
        livreId,
        userId,
        dateRetour: null,
      },
      orderBy: { dateEmprunt: 'desc' },
    });

    if (!emprunt) {
      throw new AppError(400, 'Aucun emprunt actif pour ce livre');
    }

    const now = new Date();
    const updatedLivre = await tx.livre.update({
      where: { id: livreId },
      data: { disponible: true },
    });

    const updatedEmprunt = await tx.emprunt.update({
      where: { id: emprunt.id },
      data: { dateRetour: now },
    });

    return { livre: updatedLivre, emprunt: updatedEmprunt };
  });
}

module.exports = {
  listLivres,
  getLivreById,
  createLivre,
  updateLivre,
  deleteLivre,
  emprunterLivre,
  retournerLivre,
};
