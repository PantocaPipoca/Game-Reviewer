import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/ErrorHandler";
import * as ErrorMessage from "../utils/ErrorMessage";
import { ReviewRepository } from "../Repository/ReviewRepository";
import { CommentRepository } from "../Repository/CommentRepository";
import { CommentFull, CommentPK, GamePK, ReviewFull, UserPK } from "../types/Types";
import { canViewUser, fetchPublicUser } from "./UserService";

export class CommentService {
    /**
     * Returns all comments of a review
     * @param reviewer - the reviewer of the game
     * @param gameID - the game id of the review
     * @returns a promise that resolves to an array of comments
     */
    static async getComments(reviewer: UserPK, gameID: GamePK, currentUser?: UserPK): Promise<CommentFull[]> {
        const review: ReviewFull | null = await ReviewRepository.selectReview({ reviewer, reviewed: gameID });
        if (!review) throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

        const reviewerUser = await fetchPublicUser(reviewer);
        const canView = await canViewUser(reviewerUser, currentUser);
        if (!canView) throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.UNAUTHORIZED_ACTION);

        return await CommentRepository.selectCommentsOfSameReview({ reviewer, reviewed: gameID });
    }

    /**
     * Creates a new comment to a review
     * @param currentUser - the current user
     * @param reviewer - the reviewer of the game
     * @param gameID - the game id of the review
     * @param text - the text of the comment
     * @returns a promise that resolves to the created comment
     */
    static async publishComment(
        currentUser: UserPK,
        reviewer: UserPK,
        gameID: GamePK,
        text: string
    ): Promise<CommentFull> {
        // check if review exists
        const review: ReviewFull | null = await ReviewRepository.selectReview({ reviewer, reviewed: gameID });
        if (!review) throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

        const comment: CommentFull = await CommentRepository.insertComment({
            commentator: currentUser,
            reviewer,
            reviewed: gameID,
            text,
        });

        return comment;
    }

    /**
     * EditComment edits an existing comment.
     * @param currentUser - the current user
     * @param commentID - the id of the comment
     * @param text - the new text of the comment
     * @returns a promise that resolves to the updated comment
     */
    static async editComment(currentUser: UserPK, commentID: CommentPK, text: string): Promise<CommentFull> {
        const comment: CommentFull | null = await CommentRepository.selectComment(commentID);
        if (!comment) throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.COMMENT_NOT_FOUND);

        if (comment.commentator !== currentUser)
            throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.UNAUTHORIZED_ACTION);

        const updated: CommentFull = await CommentRepository.updateComment(commentID, text);

        return updated;
    }

    /**
     * RemoveComment deletes a comment.
     * @param currentUser - the current user
     * @param commentID - the id of the comment
     * @returns a promise that resolves to the deleted comment
     */
    static async removeComment(currentUser: UserPK, commentID: CommentPK): Promise<CommentFull> {
        const comment: CommentFull | null = await CommentRepository.selectComment(commentID);
        if (!comment) throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.COMMENT_NOT_FOUND);

        // only comment author can delete
        if (comment.commentator !== currentUser)
            throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.UNAUTHORIZED_ACTION);

        const deleted: CommentFull = await CommentRepository.deleteComment(commentID);

        return deleted;
    }
}
