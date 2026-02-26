import {Request, Response} from "express"
import {AsyncHandler, MakeSuccess} from "../utils/ErrorHandler"
import { LikeShort, ReviewPK } from "../types/Types";
import { LikeService, ReactionResponse } from "../services/LikeService";
import { ExtractReviewPK } from "./ReviewController";
import { StatusCodes } from "http-status-codes";
import { AuthRequest, JwtPayload } from "../utils/auth";
import { AppError } from "../utils/ErrorHandler";
import * as ErrorMessage from "../utils/ErrorMessage";

/**
 * Counts the amount of likes or dislikes of a review
 * @param req the Request object for utility
 * @param res the Response object for utility
 * @param reaction if true, will count the amount of likes, otherwise the amount of dislikes
 * @returns the amount of likes/dislikes of a review
 * @throws AppError if there is no such game, user or review
 */
async function CountReactions(req: Request, res: Response, reaction: boolean): Promise<Response> {
    const {reviewer, reviewed}: ReviewPK = ExtractReviewPK(req);
    const result: ReactionResponse = await LikeService.GetReactionsByReview(reviewer, reviewed);
    return MakeSuccess(res, StatusCodes.OK, reaction ? result.likes : result.dislikes);
}

/**
 * Adds a new reaction to a review
 * @param req the Request object for utility
 * @param res the Response object for utility
 * @param reaction if true, will add a like, otherwise a dislike
 * @returns a Response object with the result of the instruction
 * @throws AppError if there is no such game, user or review
 */
async function PushReaction(req: AuthRequest, res: Response, reaction: boolean): Promise<Response> {
    const user: JwtPayload | undefined = req.currentUser;
    if (!user)
        throw new AppError(StatusCodes.UNAUTHORIZED, ErrorMessage.UNAUTHORIZED_ACTION);
    const {reviewer, reviewed}: ReviewPK = ExtractReviewPK(req);
    const result: LikeShort = await LikeService.ReactReview(user.username, reviewer, reviewed, reaction);
    return MakeSuccess(res, StatusCodes.ACCEPTED, result);
}

export class LikeController {
    // ===================== LIKES =====================

    /**
     * Gets the likes of a review
     * Used by GET /api/reviews/:reviewer/:reviewed/likes
     */
    static GetLikes: any = AsyncHandler(async (req: Request, res: Response) => {
        return await CountReactions(req, res, true);
    });

    /**
     * Adds a like to a review
     * Used by POST /api/reviews/:reviewer/:reviewed/likes
     */
    static AddLike: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        return await PushReaction(req, res, true);
    });

    // TODO LATER
    static GetLikesByUser: any = AsyncHandler(async (req: Request, res: Response) => {});

    // ===================== DISLIKES =====================

    /**
     * Gets the dislikes of a review
     * Used by GET /api/reviews/:reviewer/:reviewed/dislikes
     */
    static GetDislikes: any = AsyncHandler(async (req: Request, res: Response) => {
        return await CountReactions(req, res, false);
    });

    /**
     * Adds a dislike to a review
     * Used by POST /api/reviews/:reviewer/:reviewed/dislikes
     */
    static AddDislike: any = AsyncHandler(async (req: Request, res: Response) => {
        return await PushReaction(req, res, false);
    });

    // TODO LATER
    static GetDislikesByUser: any = AsyncHandler(async (req: Request, res: Response) => {});

    // ===================== INDEPENDENT =====================

    /**
     * Deletes likes and dislikes to a review
     * Used by DELETE /api/reviews/:reviewer/:reviewed/reacts
     */
    static RemoveReactions: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const user: JwtPayload | undefined = req.currentUser;
        if (!user)
            throw new AppError(StatusCodes.UNAUTHORIZED, ErrorMessage.UNAUTHORIZED_ACTION);
        const {reviewer, reviewed}: ReviewPK = ExtractReviewPK(req);
        const result: LikeShort = await LikeService.RemoveReactionFromReview(user.username, reviewer, reviewed);
        return MakeSuccess(res, StatusCodes.ACCEPTED, result);
    });
}