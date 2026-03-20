import {Response} from "express"
import {AppError, AsyncHandler, MakeSuccess} from "../utils/ErrorHandler"
import {StatusCodes} from "http-status-codes"
import * as ErrorMessage from "../utils/ErrorMessage"
import {ExtractReviewPK, ReviewPrimaryKey} from "./ReviewController";
import {CommentService} from "../services/CommentService";
import {AuthRequest, ExtractLoggedUser} from "../utils/auth";

export class CommentController {

    /**
     * Gets the comments of a review
     * Used by GET /api/reviews/:reviewer/:reviewed/comments
     */
    static GetComments: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string | undefined = req.currentUser?.username;
        const { reviewer, reviewed }: ReviewPrimaryKey = ExtractReviewPK(req);

        const result = await CommentService.GetComments(reviewer, reviewed, currentUser);
        return MakeSuccess(res, StatusCodes.OK, result);
  });
    /**
     * Adds a comment to a review
     * Used by POST /api/reviews/:reviewer/:reviewed/comments
     */
    static AddComment: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string = ExtractLoggedUser(req);

        const {reviewer, reviewed}: ReviewPrimaryKey = ExtractReviewPK(req)
        const {text} = req.body
        if (!text)
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.COMMENT_TEXT_REQUIRED)
        const result: any = await CommentService.PublishComment(currentUser, reviewer, reviewed, text)
        return MakeSuccess(res, StatusCodes.CREATED, result)
    });

    /**
     * Edits a comment to a review
     * Used by PUT /api/reviews/:reviewer/:reviewed/comments/:id
     */
    static EditComment: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string = ExtractLoggedUser(req);

        const commentID: string | string[] | undefined = req.params['id']
        if (!commentID || typeof commentID !== 'string')
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.COMMENT_ID_REQUIRED)

        const { text} = req.body
        if (!text)
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.COMMENT_TEXT_REQUIRED)

        let id: bigint
        try {
            id = BigInt(commentID)
        } catch (_) {
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.COMMENT_ID_INVALID)
        }
        const result: any = await CommentService.EditComment(currentUser, id, text)
        return MakeSuccess(res, StatusCodes.ACCEPTED, result)
    });

    /**
     * Deletes a comment to a review
     * Used by DELETE /api/reviews/:reviewer/:reviewed/comments/:id
     */
    static RemoveComment: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string = ExtractLoggedUser(req);

        const commentID: string | string[] | undefined = req.params['id']
        if (!commentID || typeof commentID !== 'string')
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.COMMENT_ID_REQUIRED)
        
        let id: bigint
        try {
            id = BigInt(commentID)
        } catch (_) {
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.COMMENT_ID_INVALID)
        }

        const result: any = await CommentService.RemoveComment(currentUser, id)
        return MakeSuccess(res, StatusCodes.ACCEPTED, result)
    });
}