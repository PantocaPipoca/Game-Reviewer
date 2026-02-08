-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "score" SET DATA TYPE INTEGER;

-- CreateIndex
CREATE INDEX "Follower_followed_idx" ON "Follower"("followed");

-- CreateIndex
CREATE INDEX "Like_reviewer_reviewed_idx" ON "Like"("reviewer", "reviewed");

-- CreateIndex
CREATE INDEX "Review_reviewer_idx" ON "Review"("reviewer");

-- CreateIndex
CREATE INDEX "Review_reviewed_idx" ON "Review"("reviewed");

-- CreateIndex
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");
