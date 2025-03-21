-- AlterTable
ALTER TABLE "JoinRequest" ADD COLUMN     "employmentDetails" TEXT,
ADD COLUMN     "familyIncome" DOUBLE PRECISION,
ADD COLUMN     "familySize" INTEGER,
ADD COLUMN     "hasPets" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isHeadOfFamily" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "leaseLength" INTEGER,
ADD COLUMN     "petDetails" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "preferredLocation" TEXT,
ADD COLUMN     "preferredRent" DOUBLE PRECISION;
