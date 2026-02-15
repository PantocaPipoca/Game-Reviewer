import { prisma } from "../prisma";
import type { Like } from "../generated/prisma/client";
import type { reviewPK } from "./ReviewRepository";
export { Like };

export type like = {
    liker: string;
    reviewer: string;
    reviewed: string;
    value: boolean;
}

export type likePK = {
    liker: string;
    reviewer: string;
    reviewed: string;
}

// select like
export function SelectLike(likePK: likePK): Promise<Like | null> {
    return prisma.like.findUnique({
        where: { liker_reviewer_reviewed: likePK }
    });
}

// insert like
export function InsertLike(like: like): Promise<Like> {
    return prisma.like.create({
        data: like
    });
}

// update like (change like/dislike)
export function UpdateLike(like: like): Promise<Like> {
    const likePK: likePK = {
        liker: like.liker,
        reviewer: like.reviewer,
        reviewed: like.reviewed
    }
    return prisma.like.update({
        where: { liker_reviewer_reviewed: likePK },
        data: { value: like.value }
    });
}

// delete like
export function DeleteLike(likePK: likePK): Promise<Like> {
    return prisma.like.delete({
        where: { liker_reviewer_reviewed: likePK }
    });
}



// count all likes or dislikes of a review
// set toCount to true to count likes and to false to count dislikes
export function CountLikesOrDislikesOfReview(reviewPK: reviewPK, toCount: boolean): Promise<Number> {
    return prisma.like.count({
        where: {
            AND: [
                { review: reviewPK },
                { value: toCount }
            ]
        }
    });
}

// select all likes of a user
export function SelectAllLikesOfUser(userPK: string): Promise<Like[]> {
    return prisma.like.findMany({
        where: { liker: userPK }
    });
}
