import {StatusCodes} from "http-status-codes"
import {AppError} from "../utils/ErrorHandler"
import * as ErrorMessage from "../utils/ErrorMessage"
import { SelectReview } from "../Repository/ReviewRepository"
import { DeleteComment, InsertComment, SelectComment, SelectCommentsOfSameReview, UpdateComment } from "../Repository/CommentRepository"
import { CommentFull, CommentPK, ReviewFull } from "../types/Types"

export class CommentService {
    static async GetComments(reviewer: string, gameID: number): Promise<CommentFull[]> {
        const review: ReviewFull | null = await SelectReview({reviewer, reviewed: gameID});
        if (!review)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

        const comments: CommentFull[] = await SelectCommentsOfSameReview({reviewer, reviewed: gameID});

        return comments.map(comment => ({
            id: comment.id,
            commentator: comment.commentator,
            reviewer: comment.reviewer,
            reviewed: comment.reviewed,
            text: comment.text,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt
        })) as CommentFull[];
    }

    static async PublishComment(currentUser: string, reviewer: string, gameID: number, text: string): Promise<CommentFull> {
        // check if review exists
        const review: ReviewFull | null = await SelectReview({reviewer, reviewed: gameID});
        if (!review)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

        const comment: CommentFull = await InsertComment({
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
        } as CommentFull;
    }

    static async EditComment(currentUser: string, commentID: CommentPK, text: string): Promise<CommentFull> {
        const comment: CommentFull | null = await SelectComment(commentID);
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
        } as CommentFull;
    }

    static async RemoveComment(currentUser: string, commentID: CommentPK): Promise<CommentFull> {
        const comment: CommentFull | null = await SelectComment(commentID);
        if (!comment)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.COMMENT_NOT_FOUND);

        // only comment author can delete
        if (comment.commentator !== currentUser)
            throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.UNAUTHORIZED_ACTION);

        const deleted: CommentFull = await DeleteComment(commentID);

        return {
            id: deleted.id,
            commentator: deleted.commentator,
            reviewer: deleted.reviewer,
            reviewed: deleted.reviewed,
            text: deleted.text,
            createdAt: deleted.createdAt,
            updatedAt: deleted.updatedAt
        } as CommentFull;
    }
}