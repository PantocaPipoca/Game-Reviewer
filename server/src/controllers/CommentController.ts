import {Request, Response} from "express"
import {AppError, AsyncHandler, MakeSuccess} from "../utils/ErrorHandler"
import * as ErrorMessage from "../utils/ErrorMessage"
import {StatusCodes} from "http-status-codes"
import { ExtractReviewPK, ReviewPrimaryKey } from "./ReviewController";
import { CommentService } from "../services/CommentService";
import { CommentPK } from '../types/Types';

export class CommentController {
    static GetComments = AsyncHandler(async (req: Request, res: Response) => {
        const {reviewer, reviewed}: ReviewPrimaryKey = ExtractReviewPK(req)
        const result: any = await CommentService.GetComments(reviewer, reviewed)
        return MakeSuccess(res, StatusCodes.OK, result)
    });

    static AddComment = AsyncHandler(async (req: Request, res: Response) => {
        const {reviewer, reviewed}: ReviewPrimaryKey = ExtractReviewPK(req)
        const {commenter, text} = req.body
        if (!commenter || !text)
            throw new AppError(StatusCodes.BAD_REQUEST, "")
        const result: any = await CommentService.PublishComment(commenter, reviewer, reviewed, text)
        return MakeSuccess(res, StatusCodes.CREATED, result)
    });

    static EditComment = AsyncHandler(async (req: Request, res: Response) => {
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

    static RemoveComment = AsyncHandler(async (req: Request, res: Response) => {
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