import {Request, Response} from "express"
import {AsyncHandler, MakeSuccess, AppError} from "../utils/ErrorHandler"
import {StatusCodes} from "http-status-codes"
import {ReviewService} from "../services/ReviewService"

// Throws if score is invalid
function CheckScore(score: any): void {
}

export class ReviewController {
    static GetReview = AsyncHandler(async (req: Request, res: Response) => {
        const {reviewer, reviewed} = req.body;
        const result: any = await ReviewService.FindReview(reviewer, reviewed);
        return MakeSuccess(res, StatusCodes.OK, result);
    });

    static PublishReview = AsyncHandler(async (req: Request, res: Response) => {
        const {reviewer, reviewed, text, score} = req.body;
        CheckScore(score);
        const result: any = await ReviewService.PublishReview(reviewer, reviewed, text, score);
        return MakeSuccess(res, StatusCodes.CREATED, result);
    });

    static AlterReview = AsyncHandler(async (req: Request, res: Response) => {
        const {reviewer, reviewed, text, score} = req.body;
        if (score!)     CheckScore(score);
        const result: any = await ReviewService.UpdateReview(reviewer, reviewed, text, score);
        return MakeSuccess(res, StatusCodes.ACCEPTED, result);
    })

    static RemoveReview = AsyncHandler(async (req: Request, res: Response) => {
        const {reviewer, reviewed} = req.body;
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
