import { prisma } from "../prisma";
import type { Review } from "../generated/prisma/client";
export { Review };

export type review = {
    reviewer: string;
    reviewed: string;
    text: string;
    score: number;
}

export type reviewPK = {
    reviewer: string;
    reviewed: string;
}

// select review
export function SelectReview(reviewPK: reviewPK): Promise<Review | null> {
    return prisma.review.findUnique({
        where: { reviewer_reviewed: reviewPK }
    });
}

// insert review
export function InsertReview(review: review): Promise<Review> {
    return prisma.review.create({
        data: review
    });
}

// update review
export function UpdateReview(review: review): Promise<Review> {
    const reviewPK: reviewPK = {
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
export function DeleteReview(reviewPK: reviewPK): Promise<Review> {
    return prisma.review.delete({
        where: { reviewer_reviewed: reviewPK }
    });
}



// select all reviews of a game
export function SelectAllReviewsOfGame(gamePK: string): Promise<Review[]> {
    return prisma.review.findMany({
        where: { reviewed: gamePK }
    });
}

// select all reviews of a user
export function SelectAllReviewsOfUser(userPK: string): Promise<Review[]> {
    return prisma.review.findMany({
        where: { reviewer: userPK }
    });
}
