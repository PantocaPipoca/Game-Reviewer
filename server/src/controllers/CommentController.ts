import { Response } from "express";
import { AppError, asyncHandler, makeSuccess } from "../utils/ErrorHandler";
import { StatusCodes } from "http-status-codes";
import * as ErrorMessage from "../utils/ErrorMessage";
import { extractReviewPK, ReviewPrimaryKey } from "./ReviewController";
import { CommentService } from "../services/CommentService";
import { AuthRequest, extractLoggedUser } from "../utils/Auth";

export const COMMENT_MAX_LEN: number = 1000;

export class CommentController {
    /**
     * Gets the comments of a review
     * Used by GET /api/reviews/:reviewer/:reviewed/comments
     */
    static getComments: any = asyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string | undefined = req.currentUser?.username;
        const { reviewer, reviewed }: ReviewPrimaryKey = extractReviewPK(req);

        const result = await CommentService.getComments(reviewer, reviewed, currentUser);
        return makeSuccess(
            res,
            StatusCodes.OK,
            result.map((c) => ({ ...c, id: c.id.toString() }))
        );
    });

    /**
     * Adds a comment to a review
     * Used by POST /api/reviews/:reviewer/:reviewed/comments
     */
    static addComment: any = asyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string = extractLoggedUser(req);

        const { reviewer, reviewed }: ReviewPrimaryKey = extractReviewPK(req);
        const { text } = req.body;
        if (!text) throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.COMMENT_TEXT_REQUIRED);
        if (text.length >= COMMENT_MAX_LEN)
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.COMMENT_TEXT_TOO_LONG);

        const result = await CommentService.publishComment(currentUser, reviewer, reviewed, text);
        return makeSuccess(res, StatusCodes.CREATED, { ...result, id: result.id.toString() });
    });

    /**
     * Edits a comment to a review
     * Used by PUT /api/reviews/:reviewer/:reviewed/comments/:id
     */
    static editComment: any = asyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string = extractLoggedUser(req);

        const commentID: string | string[] | undefined = req.params["id"];
        if (!commentID || typeof commentID !== "string")
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.COMMENT_ID_REQUIRED);

        const { text } = req.body;
        if (!text) throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.COMMENT_TEXT_REQUIRED);
        if (text.length >= COMMENT_MAX_LEN)
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.COMMENT_TEXT_TOO_LONG);

        let id: bigint;
        try {
            id = BigInt(commentID);
        } catch (_) {
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.COMMENT_ID_INVALID);
        }
        const result = await CommentService.editComment(currentUser, id, text);
        return makeSuccess(res, StatusCodes.ACCEPTED, { ...result, id: result.id.toString() });
    });

    /**
     * Deletes a comment to a review
     * Used by DELETE /api/reviews/:reviewer/:reviewed/comments/:id
     */
    static removeComment: any = asyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string = extractLoggedUser(req);

        const commentID: string | string[] | undefined = req.params["id"];
        if (!commentID || typeof commentID !== "string")
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.COMMENT_ID_REQUIRED);

        let id: bigint;
        try {
            id = BigInt(commentID);
        } catch (_) {
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.COMMENT_ID_INVALID);
        }

        const result = await CommentService.removeComment(currentUser, id);
        return makeSuccess(res, StatusCodes.ACCEPTED, { ...result, id: result.id.toString() });
    });
}
