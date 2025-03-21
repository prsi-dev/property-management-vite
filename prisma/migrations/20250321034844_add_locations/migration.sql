/*
  Warnings:

  - You are about to drop the column `postalCode` on the `Resource` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "postalCode",
ADD COLUMN     "locationId" TEXT;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
