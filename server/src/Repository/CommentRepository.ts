import { prisma } from "../prisma";
import { CommentFull, CommentShort, CommentPK, ReviewPK, UserPK } from "../types/Types";

export class CommentRepository {

    /**
     * @description Selects a Comment from the database
     * @param commentPK primary key of Comment
     * @returns a promise of the table entry which contains the given primary key, if nothing is found the promise resolves to null
    */
    public static SelectComment(commentPK: CommentPK): Promise<CommentFull | null> {
        return prisma.comment.findUnique({
            where: { id: commentPK }
        });
    }

    /**
     * @description Inserts a Comment in the database
     * @param comment json with all fields of Comment that need to be manually set
     * @returns a promise of the table entry which contains the full inserted Comment
    */
    public static InsertComment(comment: CommentShort): Promise<CommentFull> {
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
    public static UpdateComment(commentPK: CommentPK, newText: string): Promise<CommentFull> {
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
    public static DeleteComment(commentPK: CommentPK): Promise<CommentFull> {
        return prisma.comment.delete({
            where: { id: commentPK }
        });
    }



    /**
     * @description Selects all Comments of the same Review
     * @param reviewPK primary key of the Review we want the Comments of
     * @returns a promise of the array of Comments of that Review
    */
    public static SelectCommentsOfSameReview(reviewPK: ReviewPK): Promise<CommentFull[]> {
        return prisma.comment.findMany({
            where: { review: reviewPK }
        });
    }

    /**
     * @description Selects all Comments of the same User, may be useful debug info
     * @param userPK primary key of the User we want the Comments of
     * @returns a promise of the array of Comments of that User
    */
    public static SelectCommentsOfSameUser(userPK: UserPK): Promise<CommentFull[]> {
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
    public static SelectCommentsOfSameReviewAndUser(reviewPK: ReviewPK, userPK: UserPK): Promise<CommentFull[]> {
        return prisma.comment.findMany({
            where: {
                review: reviewPK,
                commentator: userPK
            }
        });
    }

}
