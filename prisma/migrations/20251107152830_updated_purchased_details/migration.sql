/*
  Warnings:

  - You are about to drop the column `purcharsedAt` on the `ScratchCard` table. All the data in the column will be lost.
  - You are about to drop the column `purcharsedBy` on the `ScratchCard` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ScratchCard" DROP COLUMN "purcharsedAt",
DROP COLUMN "purcharsedBy",
ADD COLUMN     "purchasedAt" TIMESTAMP(3),
ADD COLUMN     "purchasedBy" TEXT;
