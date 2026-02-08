/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - Added the required column `accountName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userData` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
DROP COLUMN "name",
DROP COLUMN "password",
ADD COLUMN     "accountName" TEXT NOT NULL,
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "userData" JSONB NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("accountName");

-- CreateTable
CREATE TABLE "Game" (
    "gameName" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("gameName")
);

-- CreateTable
CREATE TABLE "Review" (
    "reviewer" TEXT NOT NULL,
    "reviewed" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "score" SMALLINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("reviewer","reviewed")
);

-- CreateTable
CREATE TABLE "Follower" (
    "follows" TEXT NOT NULL,
    "followed" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Follower_pkey" PRIMARY KEY ("follows","followed")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" BIGSERIAL NOT NULL,
    "commentator" TEXT NOT NULL,
    "reviewer" TEXT NOT NULL,
    "reviewed" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "liker" TEXT NOT NULL,
    "reviewer" TEXT NOT NULL,
    "reviewed" TEXT NOT NULL,
    "value" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("liker","reviewer","reviewed")
);

-- CreateIndex
CREATE INDEX "Comment_reviewer_reviewed_idx" ON "Comment"("reviewer", "reviewed");

-- CreateIndex
CREATE INDEX "Comment_commentator_idx" ON "Comment"("commentator");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewer_fkey" FOREIGN KEY ("reviewer") REFERENCES "User"("accountName") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewed_fkey" FOREIGN KEY ("reviewed") REFERENCES "Game"("gameName") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follower" ADD CONSTRAINT "Follower_follows_fkey" FOREIGN KEY ("follows") REFERENCES "User"("accountName") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follower" ADD CONSTRAINT "Follower_followed_fkey" FOREIGN KEY ("followed") REFERENCES "User"("accountName") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_reviewer_reviewed_fkey" FOREIGN KEY ("reviewer", "reviewed") REFERENCES "Review"("reviewer", "reviewed") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_commentator_fkey" FOREIGN KEY ("commentator") REFERENCES "User"("accountName") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_reviewer_reviewed_fkey" FOREIGN KEY ("reviewer", "reviewed") REFERENCES "Review"("reviewer", "reviewed") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_liker_fkey" FOREIGN KEY ("liker") REFERENCES "User"("accountName") ON DELETE CASCADE ON UPDATE CASCADE;
