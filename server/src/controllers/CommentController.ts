import {Request, Response} from "express"
import {AppError, AsyncHandler, MakeSuccess} from "../utils/ErrorHandler"
import {StatusCodes} from "http-status-codes"
import { ExtractReviewPK, ReviewPrimaryKey } from "./ReviewController";
import { CommentService } from "../services/CommentService";

export class CommentController {

    /**
     * Gets the comments of a review
     * Used by GET /api/reviews/:reviewer/:reviewed/comments
     */
    static GetComments: any = AsyncHandler(async (req: Request, res: Response) => {
        const {reviewer, reviewed}: ReviewPrimaryKey = ExtractReviewPK(req)
        const result: any = await CommentService.GetComments(reviewer, reviewed)
        return MakeSuccess(res, StatusCodes.OK, result)
    });

    /**
     * Adds a comment to a review
     * Used by POST /api/reviews/:reviewer/:reviewed/comments
     */
    static AddComment: any = AsyncHandler(async (req: Request, res: Response) => {
        const {reviewer, reviewed}: ReviewPrimaryKey = ExtractReviewPK(req)
        const {commenter, text} = req.body
        if (!commenter || !text)
            throw new AppError(StatusCodes.BAD_REQUEST, "")
        const result: any = await CommentService.PublishComment(commenter, reviewer, reviewed, text)
        return MakeSuccess(res, StatusCodes.CREATED, result)
    });

    /**
     * Edits a comment to a review
     * Used by PUT /api/reviews/:reviewer/:reviewed/comments/:id
     */
    static EditComment: any = AsyncHandler(async (req: Request, res: Response) => {
        const commentID: string | string[] | undefined = req.params['id']
        if (!commentID || typeof commentID !== 'string')
            throw new AppError(StatusCodes.BAD_REQUEST, "")
        const {commenter, text} = req.body
        if (!text)
            throw new AppError(StatusCodes.BAD_REQUEST, "")
        try {
            const id: bigint = BigInt(commentID)
            const result: any = await CommentService.EditComment(commenter, id, text)
            return MakeSuccess(res, StatusCodes.ACCEPTED, result)
        } catch (_) {
            throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "")
        }
    });

    /**
     * Deletes a comment to a review
     * Used by DELETE /api/reviews/:reviewer/:reviewed/comments/:id
     */
    static RemoveComment: any = AsyncHandler(async (req: Request, res: Response) => {
        const commentID: string | string[] | undefined = req.params['id']
        if (!commentID || typeof commentID !== 'string')
            throw new AppError(StatusCodes.BAD_REQUEST, "")
        const {commenter} = req.body
        try {
            const id: bigint = BigInt(commentID)
            const result: any = await CommentService.RemoveComment(commenter, id)
            return MakeSuccess(res, StatusCodes.ACCEPTED, result)
        } catch (_) {
            throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "")
        }
    });
}