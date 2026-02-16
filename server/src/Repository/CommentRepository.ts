import { prisma } from "../prisma";
import type { Comment } from "../generated/prisma/client";
import type { reviewPK } from "./ReviewRepository";
import type { userPK } from "./UserRepository";
import type { gamePK } from "./GameRepository";
export type { Comment };

export type commentPK = bigint

export type comment = {
    commentator: userPK;
    reviewer: userPK;
    reviewed: gamePK;
    text: string;
}

// select comment
export function SelectComment(commentPK: commentPK): Promise<Comment | null> {
    return prisma.comment.findUnique({
        where: { id: commentPK }
    });
}

// insert comment
export function InsertComment(comment: comment): Promise<Comment> {
    return prisma.comment.create({
        data: comment
    });
}

// update comment
export function UpdateComment(commentPK: commentPK, newText: string): Promise<Comment> {
    return prisma.comment.update({
        where: { id: commentPK },
        data: { text: newText }
    });
}

// delete comment
export function DeleteComment(commentPK: commentPK): Promise<Comment> {
    return prisma.comment.delete({
        where: { id: commentPK }
    });
}



// select all comments of a review
export function SelectCommentsOfSameReview(reviewPK: reviewPK): Promise<Comment[]> {
    return prisma.comment.findMany({
        where: { review: reviewPK }
    });
}

// select all comments of a user
export function SelectCommentsOfSameUser(userPK: userPK): Promise<Comment[]> {
    return prisma.comment.findMany({
        where: { commentator: userPK }
    });
}

export function SelectCommentsOfSameReviewAndUser(reviewPK: reviewPK, userPK: userPK): Promise<Comment[]> {
    return prisma.comment.findMany({
        where: {
            review: reviewPK,
            commentator: userPK
        }
    });
}
