import { prisma } from "../prisma";
import { CommentFull, CommentShort, CommentPK, ReviewPK, UserPK } from "../types/Types";


// select comment
export function SelectComment(commentPK: CommentPK): Promise<CommentFull | null> {
    return prisma.comment.findUnique({
        where: { id: commentPK }
    });
}

// insert comment
export function InsertComment(comment: CommentShort): Promise<CommentFull> {
    return prisma.comment.create({
        data: comment
    });
}

// update comment
export function UpdateComment(commentPK: CommentPK, newText: string): Promise<CommentFull> {
    return prisma.comment.update({
        where: { id: commentPK },
        data: { text: newText }
    });
}

// delete comment
export function DeleteComment(commentPK: CommentPK): Promise<CommentFull> {
    return prisma.comment.delete({
        where: { id: commentPK }
    });
}



// select all comments of a review
export function SelectCommentsOfSameReview(reviewPK: ReviewPK): Promise<CommentFull[]> {
    return prisma.comment.findMany({
        where: { review: reviewPK }
    });
}

// select all comments of a user
export function SelectCommentsOfSameUser(userPK: UserPK): Promise<CommentFull[]> {
    return prisma.comment.findMany({
        where: { commentator: userPK }
    });
}

export function SelectCommentsOfSameReviewAndUser(reviewPK: ReviewPK, userPK: UserPK): Promise<CommentFull[]> {
    return prisma.comment.findMany({
        where: {
            review: reviewPK,
            commentator: userPK
        }
    });
}
