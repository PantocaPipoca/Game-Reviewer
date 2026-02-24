/*
  Warnings:

  - The primary key for the `Game` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Like` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Review` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `reviewed` on the `Comment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `accepted` to the `Follower` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gameID` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `reviewed` on the `Like` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `reviewed` on the `Review` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_reviewer_reviewed_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_reviewer_reviewed_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_reviewed_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "reviewed",
ADD COLUMN     "reviewed" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Follower" ADD COLUMN     "accepted" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Game" DROP CONSTRAINT "Game_pkey",
ADD COLUMN     "gameID" INTEGER NOT NULL,
ADD CONSTRAINT "Game_pkey" PRIMARY KEY ("gameID");

-- AlterTable
ALTER TABLE "Like" DROP CONSTRAINT "Like_pkey",
DROP COLUMN "reviewed",
ADD COLUMN     "reviewed" INTEGER NOT NULL,
ADD CONSTRAINT "Like_pkey" PRIMARY KEY ("liker", "reviewer", "reviewed");

-- AlterTable
ALTER TABLE "Review" DROP CONSTRAINT "Review_pkey",
DROP COLUMN "reviewed",
ADD COLUMN     "reviewed" INTEGER NOT NULL,
ADD CONSTRAINT "Review_pkey" PRIMARY KEY ("reviewer", "reviewed");

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Comment_reviewer_reviewed_idx" ON "Comment"("reviewer", "reviewed");

-- CreateIndex
CREATE INDEX "Like_reviewer_reviewed_idx" ON "Like"("reviewer", "reviewed");

-- CreateIndex
CREATE INDEX "Review_reviewed_idx" ON "Review"("reviewed");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewed_fkey" FOREIGN KEY ("reviewed") REFERENCES "Game"("gameID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_reviewer_reviewed_fkey" FOREIGN KEY ("reviewer", "reviewed") REFERENCES "Review"("reviewer", "reviewed") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_reviewer_reviewed_fkey" FOREIGN KEY ("reviewer", "reviewed") REFERENCES "Review"("reviewer", "reviewed") ON DELETE RESTRICT ON UPDATE CASCADE;
