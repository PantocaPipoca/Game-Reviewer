import { prisma } from "../prisma";
import { LikeFull, LikeShort, LikePK, ReviewPK, UserPK } from "../types/Types";


// select like
export function SelectLike(likePK: LikePK): Promise<LikeFull | null> {
    return prisma.like.findUnique({
        where: { liker_reviewer_reviewed: likePK }
    });
}

// insert like
export function InsertLike(like: LikeShort): Promise<LikeFull> {
    return prisma.like.create({
        data: like
    });
}

// update like (change like/dislike)
export function UpdateLike(like: LikeShort): Promise<LikeFull> {
    const likePK: LikePK = {
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
export function DeleteLike(likePK: LikePK): Promise<LikeFull> {
    return prisma.like.delete({
        where: { liker_reviewer_reviewed: likePK }
    });
}



// count all likes or dislikes of a review
// set toCount to true to count likes and to false to count dislikes
export function CountLikesOrDislikesOfReview(reviewPK: ReviewPK, toCount: boolean): Promise<Number> {
    return prisma.like.count({
        where: {
            review: reviewPK,
            value: toCount
        }
    });
}

// select all likes of a user
export function SelectAllLikesOfUser(userPK: UserPK): Promise<LikeFull[]> {
    return prisma.like.findMany({
        where: { liker: userPK }
    });
}
