-- CreateTable
CREATE TABLE "User" (
    "accountName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "userData" JSONB NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("accountName")
);

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
    "score" INTEGER NOT NULL,
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
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Review_reviewer_idx" ON "Review"("reviewer");

-- CreateIndex
CREATE INDEX "Review_reviewed_idx" ON "Review"("reviewed");

-- CreateIndex
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");

-- CreateIndex
CREATE INDEX "Follower_followed_idx" ON "Follower"("followed");

-- CreateIndex
CREATE INDEX "Comment_reviewer_reviewed_idx" ON "Comment"("reviewer", "reviewed");

-- CreateIndex
CREATE INDEX "Comment_commentator_idx" ON "Comment"("commentator");

-- CreateIndex
CREATE INDEX "Like_reviewer_reviewed_idx" ON "Like"("reviewer", "reviewed");

-- CreateIndex
CREATE INDEX "Like_liker_idx" ON "Like"("liker");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewer_fkey" FOREIGN KEY ("reviewer") REFERENCES "User"("accountName") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewed_fkey" FOREIGN KEY ("reviewed") REFERENCES "Game"("gameName") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follower" ADD CONSTRAINT "Follower_follows_fkey" FOREIGN KEY ("follows") REFERENCES "User"("accountName") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follower" ADD CONSTRAINT "Follower_followed_fkey" FOREIGN KEY ("followed") REFERENCES "User"("accountName") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_reviewer_reviewed_fkey" FOREIGN KEY ("reviewer", "reviewed") REFERENCES "Review"("reviewer", "reviewed") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_commentator_fkey" FOREIGN KEY ("commentator") REFERENCES "User"("accountName") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_reviewer_reviewed_fkey" FOREIGN KEY ("reviewer", "reviewed") REFERENCES "Review"("reviewer", "reviewed") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_liker_fkey" FOREIGN KEY ("liker") REFERENCES "User"("accountName") ON DELETE RESTRICT ON UPDATE CASCADE;
