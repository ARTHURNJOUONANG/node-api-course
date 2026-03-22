const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;

async function main() {
  const adminHash = await bcrypt.hash('Admin1234!', BCRYPT_ROUNDS);

  await prisma.user.upsert({
    where: { email: 'admin@library.local' },
    update: {
      nom: 'Administrateur',
      password: adminHash,
      role: 'admin',
    },
    create: {
      nom: 'Administrateur',
      email: 'admin@library.local',
      password: adminHash,
      role: 'admin',
    },
  });

  const count = await prisma.livre.count();
  if (count === 0) {
    await prisma.livre.createMany({
      data: [
        {
          titre: 'Clean Code',
          auteur: 'Robert C. Martin',
          annee: 2008,
          genre: 'Développement',
          disponible: true,
        },
        {
          titre: 'The Pragmatic Programmer',
          auteur: 'Hunt & Thomas',
          annee: 1999,
          genre: 'Développement',
          disponible: true,
        },
        {
          titre: 'Node.js Design Patterns',
          auteur: 'Mario Casciaro',
          annee: 2020,
          genre: 'Node.js',
          disponible: true,
        },
      ],
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
