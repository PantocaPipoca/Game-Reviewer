import { prisma } from "../prisma";
import { ReviewFull, ReviewShort, ReviewPK, GamePK, UserPK } from "../types/Types";


// select review
export function SelectReview(reviewPK: ReviewPK): Promise<ReviewFull | null> {
    return prisma.review.findUnique({
        where: { reviewer_reviewed: reviewPK }
    });
}

// insert review
export function InsertReview(review: ReviewShort): Promise<ReviewFull> {
    return prisma.review.create({
        data: review
    });
}

// update review
export function UpdateReview(review: ReviewShort): Promise<ReviewFull> {
    const reviewPK: ReviewPK = {
        reviewer: review.reviewer,
        reviewed: review.reviewed
    }
    return prisma.review.update({
        where: { reviewer_reviewed: reviewPK },
        data: {
            text: review.text,
            score: review.score
        }
    });
}

// delete review
export function DeleteReview(reviewPK: ReviewPK): Promise<ReviewFull> {
    return prisma.review.delete({
        where: { reviewer_reviewed: reviewPK }
    });
}



// select all reviews of a game
export function SelectAllReviewsOfGame(gamePK: GamePK): Promise<ReviewFull[]> {
    return prisma.review.findMany({
        where: { reviewed: gamePK }
    });
}

// select all reviews by a user
export function SelectAllReviewsOfUser(userPK: UserPK): Promise<ReviewFull[]> {
    return prisma.review.findMany({
        where: { reviewer: userPK }
    });
}
