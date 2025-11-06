import { PrismaClient } from '@prisma/client'
import crypto from 'crypto';

const prisma = new PrismaClient()

function generatePin() {
  const nums = crypto.randomBytes(8).readUIntBE(0, 8) % 100000000;
  return nums.toString().padStart(8, '0');
}

async function main() {
  try {
    const count = 20;
    const type = 'WAEC';

    const cardsToCreate = Array(count).fill(null).map(() => ({
      type,
      pin: generatePin(),
      value: "1000",
      isImage: false,
      price: 1000.00,
      isUsed: false,
    }));

    const result = await prisma.scratchCard.createMany({
      data: cardsToCreate
    });

    console.log('✅ Created cards:', result);

    // Verify cards were created
    const cardCount = await prisma.scratchCard.count({
      where: {
        type,
        isUsed: false
      }
    });

    console.log('📊 Total available cards:', cardCount);

  } catch (error) {
    console.error('Failed to create cards:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();