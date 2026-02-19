import {Request, Response} from "express"
import {AppError, AsyncHandler, MakeSuccess} from "../utils/ErrorHandler"
import * as ErrorMessage from "../utils/ErrorMessage"
import {StatusCodes} from "http-status-codes"

export class LikeController {
    // ===================== LIKES =====================

    static GetLikes = AsyncHandler(async (req: Request, res: Response) => {
    
    });

    static AddLike = AsyncHandler(async (req: Request, res: Response) => {
    
    });

    static RemoveLike = AsyncHandler(async (req: Request, res: Response) => {
    
    });

    // TODO LATER
    static GetLikesByUser = AsyncHandler(async (req: Request, res: Response) => {
    
    });

    // ===================== DISLIKES =====================

    static GetDislikes = AsyncHandler(async (req: Request, res: Response) => {
    
    });

    static AddDislike = AsyncHandler(async (req: Request, res: Response) => {
    
    });

    static RemoveDislike = AsyncHandler(async (req: Request, res: Response) => {
    
    });

    // TODO LATER
    static GetDislikesByUser = AsyncHandler(async (req: Request, res: Response) => {
    
    });
}