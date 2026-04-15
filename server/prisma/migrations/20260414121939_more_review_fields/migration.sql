-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "hoursPlayed" INTEGER,
ADD COLUMN     "platforms" TEXT[] DEFAULT ARRAY[]::TEXT[];
