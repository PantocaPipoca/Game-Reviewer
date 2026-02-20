import {Request, Response} from "express"
import {AsyncHandler, MakeSuccess, AppError} from "../utils/ErrorHandler"
import {StatusCodes} from "http-status-codes"
import {ReviewService} from "../services/ReviewService"
import * as ErrorMessage from "../utils/ErrorMessage"
import { toValidGameID } from "./GameController"

export interface ReviewPrimaryKey {
    reviewer: string;
    reviewed: number;
}

export function ExtractReviewPK(req: Request): ReviewPrimaryKey {
    const reviewer: string | string[] | undefined = req.params['reviewer'];
    if (!reviewer || typeof reviewer !== 'string')
        throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);
    const reviewed: number = toValidGameID(req.params['reviewed'])
    return {reviewer, reviewed} as ReviewPrimaryKey;
}

// Throws if score is invalid
function CheckScore(score?: any): number {
    if (!score)
        throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.REVIEW_SCORE_REQUIRED)
    if (typeof score !== 'number' || score < 0 || score > 10)
        throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.REVIEW_SCORE_INVALID)
    return score
}

export class ReviewController {
    static GetReview = AsyncHandler(async (req: Request, res: Response) => {
        const {reviewer, reviewed}: ReviewPrimaryKey = ExtractReviewPK(req);
        const result: any = await ReviewService.FindReview(reviewer, reviewed);
        return MakeSuccess(res, StatusCodes.OK, result);
    });

    static PublishReview = AsyncHandler(async (req: Request, res: Response) => {
        const {reviewer, reviewed}: ReviewPrimaryKey = ExtractReviewPK(req);
        const {text, score} = req.body;
        if (!text) throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.REVIEW_TEXT_REQUIRED);

        const result: any = await ReviewService.PublishReview(reviewer, reviewed, text, CheckScore(score));
        return MakeSuccess(res, StatusCodes.CREATED, result);
    });

    static AlterReview = AsyncHandler(async (req: Request, res: Response) => {
        const {reviewer, reviewed}: ReviewPrimaryKey = ExtractReviewPK(req);
        const {text, score} = req.body;
        let _score: number = score
        if (score!) _score = CheckScore(score);

        const result: any = await ReviewService.UpdateReview(reviewer, reviewed, text, _score);
        return MakeSuccess(res, StatusCodes.ACCEPTED, result);
    })

    static RemoveReview = AsyncHandler(async (req: Request, res: Response) => {
        const {reviewer, reviewed}: ReviewPrimaryKey = ExtractReviewPK(req);
        const result: any = await ReviewService.RemoveReview(reviewer, reviewed);
        return MakeSuccess(res, StatusCodes.ACCEPTED, result);
    });

    static GetReviewsByGame = AsyncHandler(async (req: Request, res: Response) => {
        
    });

    static GetReviewsByUser = AsyncHandler(async (req: Request, res: Response) => {
            
    });

    // TODO LATER
    static GetRecentReviews = AsyncHandler(async (req: Request, res: Response) => {
        
    });
}
