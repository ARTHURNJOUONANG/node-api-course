const { z } = require('zod');

const createLivreSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis'),
  auteur: z.string().min(1, "L'auteur est requis"),
  annee: z.number().int().optional(),
  genre: z.string().optional(),
});

const updateLivreSchema = z
  .object({
    titre: z.string().min(1).optional(),
    auteur: z.string().min(1).optional(),
    annee: z.number().int().nullable().optional(),
    genre: z.string().nullable().optional(),
    disponible: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'Aucun champ à mettre à jour' });

module.exports = { createLivreSchema, updateLivreSchema };
