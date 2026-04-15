import { Request, Response } from "express";
import { asyncHandler, makeSuccess, AppError } from "../utils/ErrorHandler";
import { StatusCodes } from "http-status-codes";
import { ReviewService } from "../services/ReviewService";
import * as ErrorMessage from "../utils/ErrorMessage";
import { toValidGameID } from "./GameController";
import { AuthRequest, extractLoggedUser } from "../utils/Auth";
import { ReviewFull } from "../types/Types";

export interface ReviewPrimaryKey {
    reviewer: string;
    reviewed: number;
}

// Extracts reviewer and reviewed fields from Request object
export function extractReviewPK(req: Request): ReviewPrimaryKey {
    const reviewer: string | string[] | undefined = req.params["reviewer"];
    if (!reviewer || typeof reviewer !== "string")
        throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);
    const reviewed: number = toValidGameID(req.params["reviewed"]);
    return { reviewer, reviewed } as ReviewPrimaryKey;
}

// Throws if score is invalid
function checkScore(score?: any, required: boolean = true): number | undefined {
    if (score === undefined || score === null) {
        if (required) throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.REVIEW_SCORE_REQUIRED);
        return undefined;
    }
    if (typeof score !== "number" || score < 0 || score > 10)
        throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.REVIEW_SCORE_INVALID);
    return score;
}

// Throws if hoursPlayed is invalid
function checkHoursPlayed(hoursPlayed?: any): number | undefined {
    if (hoursPlayed === undefined || hoursPlayed === null) return undefined;
    if (!Number.isInteger(hoursPlayed) || hoursPlayed < 0)
        throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.REVIEW_HOURS_PLAYED_INVALID);
    return hoursPlayed;
}

// Throws if platforms is invalid
function checkPlatforms(platforms?: any): string[] | undefined {
    if (platforms === undefined || platforms === null) return undefined;
    if (!Array.isArray(platforms) || !platforms.every((entry) => typeof entry === "string" && entry.trim() !== ""))
        throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.REVIEW_PLATFORMS_INVALID);
    return platforms;
}

export class ReviewController {
    /**
     * Finds a user's review on a game
     * Used by GET /api/reviews/:reviewer/:reviewed
     */
    static getReview: any = asyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string | undefined = req.currentUser?.username;
        const { reviewer, reviewed }: ReviewPrimaryKey = extractReviewPK(req);
        const result: ReviewFull = await ReviewService.findReview(reviewer, reviewed, currentUser);
        return makeSuccess(res, StatusCodes.OK, result);
    });

    /**
     * Publishes a new review
     * Used by POST /api/reviews/:reviewer/:reviewed
     */
    static publishReview: any = asyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string = extractLoggedUser(req);

        const gameID: number = toValidGameID(req.params["gameID"]);
        const { text, score, hoursPlayed, platforms } = req.body;
        if (!text) throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.REVIEW_TEXT_REQUIRED);

        const result: ReviewFull = await ReviewService.publishReview(
            currentUser,
            gameID,
            text,
            checkScore(score) as number,
            checkHoursPlayed(hoursPlayed),
            checkPlatforms(platforms)
        );
        return makeSuccess(res, StatusCodes.CREATED, result);
    });

    /**
     * Updates a user's review
     * Used by PUT /api/reviews/:reviewer/:reviewed
     */
    static alterReview: any = asyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string = extractLoggedUser(req);

        const gameID: number = toValidGameID(req.params["gameID"]);
        const { text, score, hoursPlayed, platforms } = req.body;

        const result: ReviewFull = await ReviewService.updateReview(
            currentUser,
            gameID,
            text,
            checkScore(score) as number,
            checkHoursPlayed(hoursPlayed),
            checkPlatforms(platforms)
        );
        return makeSuccess(res, StatusCodes.ACCEPTED, result);
    });

    /**
     * Removes a user's review
     * Used by DELETE /api/reviews/:reviewer/:reviewed
     */
    static removeReview: any = asyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string = extractLoggedUser(req);

        const gameID: number = toValidGameID(req.params["gameID"]);
        const result: ReviewFull = await ReviewService.removeReview(currentUser, gameID);
        return makeSuccess(res, StatusCodes.ACCEPTED, result);
    });

    /**
     * Gets the reviews of a game
     * Used by GET /api/games/:gameID/reviews
     */
    static getReviewsByGame: any = asyncHandler(async (req: AuthRequest, res: Response) => {
        const gameID: number = toValidGameID(req.params["gameID"]);
        const currentUser: string | undefined = req.currentUser?.username;
        const result: ReviewFull[] = await ReviewService.getReviewsByGame(gameID, currentUser);
        return makeSuccess(res, StatusCodes.OK, result);
    });

    /**
     * Gets the reviews of a user
     * Used by GET /api/users/:username/reviews
     */
    static getReviewsByUser: any = asyncHandler(async (req: AuthRequest, res: Response) => {
        const username: string | string[] | undefined = req.params["username"];
        const currentUser: string | undefined = req.currentUser?.username;
        if (!username || typeof username !== "string")
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);

        const result: ReviewFull[] = await ReviewService.getReviewsByUser(username, currentUser);
        return makeSuccess(res, StatusCodes.OK, result);
    });

    // TODO LATER
    static getRecentReviews: any = asyncHandler(async (_: Request, res: Response) => {});
}
