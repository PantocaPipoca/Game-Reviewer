import {Request, Response} from "express"
import {AsyncHandler, MakeSuccess, AppError} from "../utils/ErrorHandler"
import {StatusCodes} from "http-status-codes"
import {ReviewService} from "../services/ReviewService"

// Throws if score is invalid
function CheckScore(score: any): void {
    if (typeof score !== 'number' || score < 0 || score > 10)
        ERR_REV_BAD_SCORE.Throw();
}

export class ReviewController {
    static GetReview = AsyncHandler(async (req: Request, res: Response) => {
        const {reviewer, reviewed} = req.body;
        if (!reviewer)  ERR_ACC_MISSING_NAME.Throw();
        if (!reviewed)  ERR_GAME_MISSING_NAME.Throw();
        const result: any = await ReviewService.FindReview(reviewer, reviewed);
        return MakeSuccess(res, StatusCodes.OK, result);
    });

    static PublishReview = AsyncHandler(async (req: Request, res: Response) => {
        const {reviewer, reviewed, text, score} = req.body;
        if (!reviewer)  ERR_ACC_MISSING_NAME.Throw();
        if (!reviewed)  ERR_GAME_MISSING_NAME.Throw();
        if (!text)      ERR_REV_MISSING_TEXT.Throw();
        if (!score)     ERR_REV_MISSING_SCORE.Throw();
        CheckScore(score);
        const result: any = await ReviewService.PublishReview(reviewer, reviewed, text, score);
        return MakeSuccess(res, StatusCodes.CREATED, result);
    });

    static AlterReview = AsyncHandler(async (req: Request, res: Response) => {
        const {reviewer, reviewed, text, score} = req.body;
        if (!reviewer)  ERR_ACC_MISSING_NAME.Throw();
        if (!reviewed)  ERR_GAME_MISSING_NAME.Throw();
        if (score!)     CheckScore(score);
        const result: any = await ReviewService.AlterReview(reviewer, reviewed, text, score);
        return MakeSuccess(res, StatusCodes.ACCEPTED, result);
    })

    static RemoveReview = AsyncHandler(async (req: Request, res: Response) => {
        const {reviewer, reviewed} = req.body;
        if (!reviewer)  ERR_ACC_MISSING_NAME.Throw();
        if (!reviewed)  ERR_GAME_MISSING_NAME.Throw();
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
