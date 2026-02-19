import {Request, Response} from "express"
import {AppError, AsyncHandler, MakeSuccess} from "../utils/ErrorHandler"
import * as ErrorMessage from "../utils/ErrorMessage"
import {StatusCodes} from "http-status-codes"

export class CommentController {
    static GetComments = AsyncHandler(async (req: Request, res: Response) => {
    
    });

    static AddComment = AsyncHandler(async (req: Request, res: Response) => {
    
    });

    static EditComment = AsyncHandler(async (req: Request, res: Response) => {
    
    });

    static RemoveComment = AsyncHandler(async (req: Request, res: Response) => {
    
    });
}