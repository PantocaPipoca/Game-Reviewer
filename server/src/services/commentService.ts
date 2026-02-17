import {StatusCodes} from "http-status-codes"
import {AppError} from "../utils/ErrorHandler"
import * as ErrorMessage from "../utils/ErrorMessage"
import { SelectReview } from "../Repository/ReviewRepository"
import { Comment, DeleteComment, InsertComment, SelectComment, SelectCommentsOfSameReview, UpdateComment } from "../Repository/CommentRepository"
import { CommentResponse } from "../types/Types"

export class CommentService {
    static async GetComments(reviewer: string, gameID: number): Promise<CommentResponse[]> {
        const review = await SelectReview({reviewer, reviewed: gameID})
        if (!review)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND)

        const comments = await SelectCommentsOfSameReview({reviewer, reviewed: gameID})

        return comments.map(comment => ({
            id: comment.id,
            commentator: comment.commentator,
            reviewer: comment.reviewer,
            reviewed: comment.reviewed,
            text: comment.text,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt
        }))
    }

    static async PublishComment(currentUser: string, reviewer: string, gameID: number, text: string): Promise<CommentResponse> {
        // check if review exists
        const review = await SelectReview({reviewer, reviewed: gameID});
        if (!review)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

        const comment = await InsertComment({
            commentator: currentUser,
            reviewer,
            reviewed: gameID,
            text
        });

        return {
            id: comment.id,
            commentator: comment.commentator,
            reviewer: comment.reviewer,
            reviewed: comment.reviewed,
            text: comment.text,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt
        };
    }

    static async EditComment(currentUser: string, commentID: bigint, text: string): Promise<CommentResponse> {
        const comment = await SelectComment(commentID);
        if (!comment)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.COMMENT_NOT_FOUND);

        if (comment.commentator !== currentUser)
            throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.UNAUTHORIZED_ACTION);

        const updated = await UpdateComment(commentID, text);

        return {
            id: updated.id,
            commentator: updated.commentator,
            reviewer: updated.reviewer,
            reviewed: updated.reviewed,
            text: updated.text,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt
        }
    }

    static async RemoveComment(currentUser: string, commentID: bigint): Promise<CommentResponse> {
        const comment = await SelectComment(commentID);
        if (!comment)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.COMMENT_NOT_FOUND);

        // Authorization: only comment author can delete
        if (comment.commentator !== currentUser)
            throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.UNAUTHORIZED_ACTION);

        const deleted = await DeleteComment(commentID)

        return {
            id: deleted.id,
            commentator: deleted.commentator,
            reviewer: deleted.reviewer,
            reviewed: deleted.reviewed,
            text: deleted.text,
            createdAt: deleted.createdAt,
            updatedAt: deleted.updatedAt
        }
    }

    // shoule we create a get comment by user ?
}