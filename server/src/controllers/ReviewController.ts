import {Request, Response} from "express";
import {asyncHandler, makeSuccess} from "../utils/utils"
import {ReviewService} from "../services/ReviewService";
import {StatusCodes} from "http-status-codes";

export class ReviewController {
    static find_review = asyncHandler(async (req: Request, res: Response) => {
        const result = await ReviewService.find_review(req.body)
        return makeSuccess(res, StatusCodes.OK, result)
    })

    static publish_review = asyncHandler(async (req: Request, res: Response) => {
        const result = await ReviewService.publish_review(req.body)
        return makeSuccess(res, StatusCodes.CREATED, result)
    })

    static alter_review = asyncHandler(async (req: Request, res: Response) => {
        const result = await ReviewService.alter_review(req.body)
        return makeSuccess(res, StatusCodes.ACCEPTED, result)
    })

    static remove_review = asyncHandler(async (req: Request, res: Response) => {
        const result = await ReviewService.remove_review(req.body)
        return makeSuccess(res, StatusCodes.ACCEPTED, result)
    })
}