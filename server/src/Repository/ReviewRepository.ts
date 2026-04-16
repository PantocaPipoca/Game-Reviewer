import { PRISMA } from "../Prisma";
import { ReviewFull, ReviewShort, ReviewPK, GamePK, UserPK } from "../types/Types";

export class ReviewRepository {
    /**
     * @description Selects a Review from the database
     * @param reviewPK primary key of Review
     * @returns a promise of the table entry which contains the given primary key, if nothing is found the promise resolves to null
     */
    public static selectReview(reviewPK: ReviewPK): Promise<ReviewFull | null> {
        return PRISMA.review.findUnique({
            where: { reviewer_reviewed: reviewPK },
        });
    }

    /**
     * @description Inserts a Review in the database
     * @param review json with all fields of Review that need to be manually set
     * @returns a promise of the table entry which contains the full inserted Review
     */
    public static insertReview(review: ReviewShort): Promise<ReviewFull> {
        return PRISMA.review.create({
            data: review,
        });
    }

    /**
     * @description Updates a Review in the database with the primary key given in game, with the rest of the values given
     * @param review json with all fields of Review that need to be manually set
     * @returns a promise of the updated table entry of the Review with the corresponding primary key
     */
    public static updateReview(review: ReviewShort): Promise<ReviewFull> {
        const reviewPK: ReviewPK = {
            reviewer: review.reviewer,
            reviewed: review.reviewed,
        };
        return PRISMA.review.update({
            where: { reviewer_reviewed: reviewPK },
            data: {
                text: review.text,
                score: review.score,
                hoursPlayed: review.hoursPlayed,
                platforms: review.platforms,
            },
        });
    }

    /**
     * @description Deletes a Review from the database
     * @param reviewPK primary key of Review
     * @returns a promise of the deleted entry
     */
    public static deleteReview(reviewPK: ReviewPK): Promise<ReviewFull> {
        return PRISMA.review.delete({
            where: { reviewer_reviewed: reviewPK },
        });
    }

    /**
     * @description Selects all Reviews of a given Game
     * @param gamePK primary key of the Game which we want the Reviews of
     * @returns a promise of the Array of Reviews
     */
    public static selectAllReviewsOfGame(gamePK: GamePK): Promise<ReviewFull[]> {
        return PRISMA.review.findMany({
            where: { reviewed: gamePK },
        });
    }

    /**
     * @description Selects all Reviews of a given User
     * @param userPK primary key of the User which we want the Reviews of
     * @returns a promise of the Array of Reviews
     */
    public static selectAllReviewsOfUser(userPK: UserPK): Promise<ReviewFull[]> {
        return PRISMA.review.findMany({
            where: { reviewer: userPK },
        });
    }
}
