import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding local PostgreSQL default developer profile...");
  const user = await prisma.user.upsert({
    where: { email: 'local-user@sanzzdream.com' },
    update: {},
    create: {
      id: 'local-user',
      name: 'Sanju',
      email: 'local-user@sanzzdream.com',
      college: 'RMD Engineering College',
      roleGoal: 'SWE / AI / ML Engineer'
    }
  });

  console.log("Seeded user:", user);

  // Load high-density stress seed data
  const seedPath = path.resolve(__dirname, '../../docs/stress_seed.json');
  if (fs.existsSync(seedPath)) {
    console.log("Found stress_seed.json. Seeding database snapshot...");
    const rawData = fs.readFileSync(seedPath, 'utf8');
    const seedData = JSON.parse(rawData);

    await prisma.appSnapshot.upsert({
      where: { userId: 'local-user' },
      update: {
        data: seedData
      },
      create: {
        userId: 'local-user',
        data: seedData
      }
    });
    console.log("Seeded AppSnapshot database backups successfully!");
  } else {
    console.log("stress_seed.json not found at:", seedPath);
  }
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
