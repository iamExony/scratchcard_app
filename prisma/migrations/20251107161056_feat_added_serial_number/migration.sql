/*
  Warnings:

  - A unique constraint covering the columns `[serialNumber]` on the table `ScratchCard` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `serialNumber` to the `ScratchCard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ScratchCard" ADD COLUMN     "serialNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ScratchCard_serialNumber_key" ON "public"."ScratchCard"("serialNumber");
