/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `accountName` on the `User` table. All the data in the column will be lost.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_commentator_fkey";

-- DropForeignKey
ALTER TABLE "Follower" DROP CONSTRAINT "Follower_followed_fkey";

-- DropForeignKey
ALTER TABLE "Follower" DROP CONSTRAINT "Follower_follows_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_liker_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_reviewer_fkey";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "accountName",
ADD COLUMN     "username" TEXT NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("username");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewer_fkey" FOREIGN KEY ("reviewer") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follower" ADD CONSTRAINT "Follower_follows_fkey" FOREIGN KEY ("follows") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follower" ADD CONSTRAINT "Follower_followed_fkey" FOREIGN KEY ("followed") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_commentator_fkey" FOREIGN KEY ("commentator") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_liker_fkey" FOREIGN KEY ("liker") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;
