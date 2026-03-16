-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_commentator_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_reviewer_reviewed_fkey";

-- DropForeignKey
ALTER TABLE "Follower" DROP CONSTRAINT "Follower_followed_fkey";

-- DropForeignKey
ALTER TABLE "Follower" DROP CONSTRAINT "Follower_follows_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_liker_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_reviewer_reviewed_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_reviewed_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_reviewer_fkey";

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewer_fkey" FOREIGN KEY ("reviewer") REFERENCES "User"("accountName") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewed_fkey" FOREIGN KEY ("reviewed") REFERENCES "Game"("gameID") ON DELETE CASCADE ON UPDATE CASCADE;

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
