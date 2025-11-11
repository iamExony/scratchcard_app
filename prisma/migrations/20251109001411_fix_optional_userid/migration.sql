-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Order" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
