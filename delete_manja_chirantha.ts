import { prisma } from './lib/db';

async function main() {
  console.log('Searching for accounts with name or email containing manja or chirantha...');

  try {
    const targetUsers = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: 'manja', mode: 'insensitive' } },
          { email: { contains: 'manja', mode: 'insensitive' } },
          { name: { contains: 'chirantha', mode: 'insensitive' } },
          { email: { contains: 'chirantha', mode: 'insensitive' } },
        ],
      },
    });

    console.log('Found matching accounts:', targetUsers);

    if (targetUsers.length > 0) {
      const ids = targetUsers.map((u) => u.id);
      const deleted = await prisma.user.deleteMany({
        where: { id: { in: ids } },
      });
      console.log(`SUCCESS: Removed ${deleted.count} member account(s) (manja / chirantha) from database.`);
    } else {
      console.log('No accounts matching manja or chirantha found in database.');
    }
  } catch (e) {
    console.error('Error deleting users:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
