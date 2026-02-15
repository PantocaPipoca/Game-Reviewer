import { prisma } from "../prisma";
import type { Review } from "../generated/prisma/client";
import type { gamePK } from "./GameRepository";
import type { userPK } from "./UserRepository";
export type { Review };

export type reviewPK = {
    reviewer: userPK;
    reviewed: gamePK;
}

export type review = {
    reviewer: userPK;
    reviewed: gamePK;
    text: string;
    score: number;
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
export function SelectAllReviewsOfGame(gamePK: gamePK): Promise<Review[]> {
    return prisma.review.findMany({
        where: { reviewed: gamePK }
    });
}

// select all reviews by a user
export function SelectAllReviewsOfUser(userPK: userPK): Promise<Review[]> {
    return prisma.review.findMany({
        where: { reviewer: userPK }
    });
}
