import { Request, Response } from "express";
import { asyncHandler, makeSuccess } from "../utils/ErrorHandler";
import { LikeShort, ReviewPK, ReactionResponse } from "../types/Types";
import { LikeService } from "../services/LikeService";
import { extractReviewPK } from "./ReviewController";
import { StatusCodes } from "http-status-codes";
import { AuthRequest, extractLoggedUser } from "../utils/Auth";

/**
 * Counts the amount of likes or dislikes of a review
 * @param req the Request object for utility
 * @param res the Response object for utility
 * @param reaction if true, will count the amount of likes, otherwise the amount of dislikes
 * @returns the amount of likes/dislikes of a review
 * @throws AppError if there is no such game, user or review
 */
async function countReactions(req: Request, res: Response, reaction: boolean): Promise<Response> {
    const { reviewer, reviewed }: ReviewPK = extractReviewPK(req);
    const result: ReactionResponse = await LikeService.getReactionsByReview(reviewer, reviewed);
    return makeSuccess(res, StatusCodes.OK, reaction ? result.likes : result.dislikes);
}

/**
 * Adds a new reaction to a review
 * @param req the Request object for utility
 * @param res the Response object for utility
 * @param reaction if true, will add a like, otherwise a dislike
 * @returns a Response object with the result of the instruction
 * @throws AppError if there is no such game, user or review
 */
async function pushReaction(req: AuthRequest, res: Response, reaction: boolean): Promise<Response> {
    const currentUser: string = extractLoggedUser(req);

    const { reviewer, reviewed }: ReviewPK = extractReviewPK(req);
    const result: LikeShort = await LikeService.reactReview(currentUser, reviewer, reviewed, reaction);
    return makeSuccess(res, StatusCodes.ACCEPTED, result);
}

export class LikeController {
    // ===================== LIKES =====================

    /**
     * Gets the likes of a review
     * Used by GET /api/reviews/:reviewer/:reviewed/likes
     */
    static getLikes: any = asyncHandler(async (req: Request, res: Response) => {
        return await countReactions(req, res, true);
    });

    /**
     * Adds a like to a review
     * Used by POST /api/reviews/:reviewer/:reviewed/likes
     */
    static addLike: any = asyncHandler(async (req: AuthRequest, res: Response) => {
        return await pushReaction(req, res, true);
    });

    // TODO LATER
    static getLikesByUser: any = asyncHandler(async (req: Request, res: Response) => {});

    // ===================== DISLIKES =====================

    /**
     * Gets the dislikes of a review
     * Used by GET /api/reviews/:reviewer/:reviewed/dislikes
     */
    static getDislikes: any = asyncHandler(async (req: Request, res: Response) => {
        return await countReactions(req, res, false);
    });

    /**
     * Adds a dislike to a review
     * Used by POST /api/reviews/:reviewer/:reviewed/dislikes
     */
    static addDislike: any = asyncHandler(async (req: AuthRequest, res: Response) => {
        return await pushReaction(req, res, false);
    });

    // TODO LATER
    static getDislikesByUser: any = asyncHandler(async (req: Request, res: Response) => {});

    // ===================== INDEPENDENT =====================

    /**
     * Deletes likes and dislikes to a review
     * Used by DELETE /api/reviews/:reviewer/:reviewed/reacts
     */
    static removeReactions: any = asyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string = extractLoggedUser(req);
        const { reviewer, reviewed }: ReviewPK = extractReviewPK(req);
        const result: LikeShort = await LikeService.removeReactionFromReview(currentUser, reviewer, reviewed);
        return makeSuccess(res, StatusCodes.ACCEPTED, result);
    });
}
