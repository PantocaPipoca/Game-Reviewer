import {Request, Response} from "express"
import {AsyncHandler, MakeSuccess, AppError} from "../utils/ErrorHandler"
import {StatusCodes} from "http-status-codes"
import {ReviewService} from "../services/ReviewService"
import * as ErrorMessage from "../utils/ErrorMessage"
import {toValidGameID} from "./GameController"
import {AuthRequest, ExtractLoggedUser} from "../utils/auth"
import {ReviewFull} from "../types/Types"

export interface ReviewPrimaryKey {
    reviewer: string;
    reviewed: number;
}

// Extracts reviewer and reviewed fields from Request object
export function ExtractReviewPK(req: Request): ReviewPrimaryKey {
    const reviewer: string | string[] | undefined = req.params['reviewer'];
    if (!reviewer || typeof reviewer !== 'string')
        throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);
    const reviewed: number = toValidGameID(req.params['reviewed'])
    return {reviewer, reviewed} as ReviewPrimaryKey;
}

// Throws if score is invalid
function CheckScore(score?: any): number {
    if (score === undefined || score === null)
        throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.REVIEW_SCORE_REQUIRED)
    if (typeof score !== 'number' || score < 0 || score > 10)
        throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.REVIEW_SCORE_INVALID)
    return score
}

export class ReviewController {
    /**
     * Finds a user's review on a game
     * Usde by GET /api/reviews/:reviewer/:reviewed
     */
    static GetReview: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string | undefined = req.currentUser?.username;
        const {reviewer, reviewed}: ReviewPrimaryKey = ExtractReviewPK(req);
        const result: ReviewFull = await ReviewService.FindReview(reviewer, reviewed, currentUser);
        return MakeSuccess(res, StatusCodes.OK, result);
    });

    /**
     * Publishes a new review
     * Used by POST /api/reviews/:reviewer/:reviewed
     */
    static PublishReview: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string = ExtractLoggedUser(req);

        const gameID: number = toValidGameID(req.params['gameID']);
        const {text, score} = req.body;
        if (!text) throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.REVIEW_TEXT_REQUIRED);

        const result: ReviewFull = await ReviewService.PublishReview(currentUser, gameID, text, CheckScore(score));
        return MakeSuccess(res, StatusCodes.CREATED, result);
    });

    /**
     * Updates a user's review
     * Used by PUT /api/reviews/:reviewer/:reviewed
     */
    static AlterReview: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string = ExtractLoggedUser(req);

        const gameID: number = toValidGameID(req.params['gameID']);
        const {text, score} = req.body;

        const result: ReviewFull = await ReviewService.UpdateReview(currentUser, gameID, text, CheckScore(score));
        return MakeSuccess(res, StatusCodes.ACCEPTED, result);
    })

    /**
     * Removes a user's review
     * Used by DELETE /api/reviews/:reviewer/:reviewed
     */
    static RemoveReview: any = AsyncHandler(async (req: AuthRequest  , res: Response) => {
        const currentUser: string = ExtractLoggedUser(req);

        const gameID: number = toValidGameID(req.params['gameID']);
        const result: ReviewFull = await ReviewService.RemoveReview(currentUser, gameID);
        return MakeSuccess(res, StatusCodes.ACCEPTED, result);
    });

    /**
     * Gets the reviews of a game
     * Used by GET /api/games/:gameID/reviews
     */
    static GetReviewsByGame: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const gameID: number = toValidGameID(req.params['gameID']);
        const currentUser: string | undefined = req.currentUser?.username;
        const result: ReviewFull[] = await ReviewService.GetReviewsByGame(gameID, currentUser);
        return MakeSuccess(res, StatusCodes.OK, result);
    });

    /**
     * Gets the reviews of a user
     * Used by GET /api/users/:username/reviews
     */
    static GetReviewsByUser: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const username: string | string[] | undefined = req.params['username'];
        const currentUser: string | undefined = req.currentUser?.username;
        if (!username || typeof username !== 'string')
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);

        const result: ReviewFull[] = await ReviewService.GetReviewsByUser(username, currentUser);
        return MakeSuccess(res, StatusCodes.OK, result);
    });

    // TODO LATER
    static GetRecentReviews: any = AsyncHandler(async (_: Request, res: Response) => {});
}
