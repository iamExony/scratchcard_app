-- CreateEnum
CREATE TYPE "public"."CardStatus" AS ENUM ('AVAILABLE', 'SOLD');

-- AlterTable
ALTER TABLE "public"."ScratchCard" ADD COLUMN     "purcharsedAt" TIMESTAMP(3),
ADD COLUMN     "purcharsedBy" TEXT,
ADD COLUMN     "status" "public"."CardStatus" NOT NULL DEFAULT 'AVAILABLE';
