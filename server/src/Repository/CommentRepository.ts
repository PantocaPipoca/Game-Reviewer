import { prisma } from "../prisma";
import { CommentFull, CommentShort, CommentPK, ReviewPK, UserPK } from "../types/Types";


/**
 * @description Selects a Comment from the database
 * @param commentPK primary key of Comment
 * @returns a promise of the table entry which contains the given primary key, if nothing is found the promise resolves to null
 */
export function SelectComment(commentPK: CommentPK): Promise<CommentFull | null> {
    return prisma.comment.findUnique({
        where: { id: commentPK }
    });
}

/**
 * @description Inserts a Comment in the database
 * @param comment json with all fields of Comment that need to be manually set
 * @returns a promise of the table entry which contains the full inserted Comment
 */
export function InsertComment(comment: CommentShort): Promise<CommentFull> {
    return prisma.comment.create({
        data: comment
    });
}

/**
 * @description Updates a Comment in the database with the primary key given, with the text given
 * @param commentPK primary key of the Comment to update
 * @param newText updated text of Comment
 * @returns a promise of the updated table entry of the Comment with the corresponding primary key
 */
export function UpdateComment(commentPK: CommentPK, newText: string): Promise<CommentFull> {
    return prisma.comment.update({
        where: { id: commentPK },
        data: { text: newText }
    });
}

/**
 * @description Deletes a Comment from the database
 * @param commentPK primary key of Comment
 * @returns a promise of the deleted entry
 */
export function DeleteComment(commentPK: CommentPK): Promise<CommentFull> {
    return prisma.comment.delete({
        where: { id: commentPK }
    });
}



/**
 * @description Selects all Comments of the same Review
 * @param reviewPK primary key of the Review we want the Comments of
 * @returns a promise of the array of Comments of that Review
 */
export function SelectCommentsOfSameReview(reviewPK: ReviewPK): Promise<CommentFull[]> {
    return prisma.comment.findMany({
        where: { review: reviewPK }
    });
}

/**
 * @description Selects all Comments of the same User, may be useful debug info
 * @param userPK primary key of the User we want the Comments of
 * @returns a promise of the array of Comments of that User
 */
export function SelectCommentsOfSameUser(userPK: UserPK): Promise<CommentFull[]> {
    return prisma.comment.findMany({
        where: { commentator: userPK }
    });
}

/**
 * @description Selects all Comments of the same User on the same Review, may be useful debug info
 * @param userPK primary key of the User we want the Comments of
 * @param reviewPK primary key of the Review we want the Comments of
 * @returns a promise of the array of Comments of that User on that Review
 */
export function SelectCommentsOfSameReviewAndUser(reviewPK: ReviewPK, userPK: UserPK): Promise<CommentFull[]> {
    return prisma.comment.findMany({
        where: {
            review: reviewPK,
            commentator: userPK
        }
    });
}
