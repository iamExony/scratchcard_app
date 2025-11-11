-- AlterTable
ALTER TABLE "public"."GuestTransaction" ADD COLUMN     "orderId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."GuestTransaction" ADD CONSTRAINT "GuestTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
