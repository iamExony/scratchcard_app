import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function checkCardAvailability(cardType: string, quantity: number) {
  const availableCount = await prisma.scratchCard.count({
    where: {
      type: cardType,
      isUsed: false,
      orderId: null,
    },
  });

  return {
    available: availableCount >= quantity,
    availableCount,
    required: quantity,
    insufficient: availableCount < quantity,
  };
}

export async function getCardStats() {
  const [
    totalCards,
    usedCards,
    availableCards,
    cardsByType,
  ] = await Promise.all([
    prisma.scratchCard.count(),
    prisma.scratchCard.count({ where: { isUsed: true } }),
    prisma.scratchCard.count({ where: { isUsed: false } }),
    prisma.scratchCard.groupBy({
      by: ['type'],
      _count: { id: true },
      where: { isUsed: false },
    }),
  ]);

  const availableByType = cardsByType.reduce((acc, item) => {
    acc[item.type] = item._count.id;
    return acc;
  }, {} as any);

  return {
    totalCards,
    usedCards,
    availableCards,
    availableByType,
  };
}