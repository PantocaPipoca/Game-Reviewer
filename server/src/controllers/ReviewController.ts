import {Request, Response} from "express"
import {AsyncHandler, MakeSuccess} from "../utils/utils"
import {StatusCodes} from "http-status-codes"
import {ERR_ACC_MISSING_NAME, ERR_GAME_MISSING_NAME, ERR_REV_BAD_SCORE, ERR_REV_MISSING_SCORE, ERR_REV_MISSING_TEXT} from "../utils/UsualErrorMessage"
import {ReviewService} from "../services/ReviewService"

// Throws if score is invalid
function CheckScore(score: any): void {
    if (typeof score !== 'number' || score < 0 || score > 10)
        ERR_REV_BAD_SCORE.Throw();
}

export class ReviewController {
    static FindReview = AsyncHandler(async (req: Request, res: Response) => {
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

    static getReviewsByGame = AsyncHandler(async (req: Request, res: Response) => {
    
    });

    static getReviewsByUser = AsyncHandler(async (req: Request, res: Response) => {
            
    });


    // ===================== COMMENTS =====================

    static GetComments = AsyncHandler(async (req: Request, res: Response) => {
    
    });

    static AddComment = AsyncHandler(async (req: Request, res: Response) => {
    
    });

    static EditComment = AsyncHandler(async (req: Request, res: Response) => {
    
    });

    static RemoveComment = AsyncHandler(async (req: Request, res: Response) => {
    
    });


    // ===================== LIKES =====================

    static GetLikes = AsyncHandler(async (req: Request, res: Response) => {
    
    });

    static AddLike = AsyncHandler(async (req: Request, res: Response) => {
    
    });

    static RemoveLike = AsyncHandler(async (req: Request, res: Response) => {
    
    });


    // ===================== DISLIKES =====================

    static GetDislikes = AsyncHandler(async (req: Request, res: Response) => {
    
    });

    static AddDislike = AsyncHandler(async (req: Request, res: Response) => {
    
    });

    static RemoveDislike = AsyncHandler(async (req: Request, res: Response) => {
    
    });
}
