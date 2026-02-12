import {Request, Response} from "express"
import {asyncHandler, makeSuccess} from "../utils/utils"
import {FollowerService} from "../services/FollowerService"
import {StatusCodes} from "http-status-codes"

export class FollowerController {
    static request_follower = asyncHandler(async (req: Request, res: Response) => {
        const result = await FollowerService.request_follower(req.body)
        return makeSuccess(res, StatusCodes.CREATED, result)
    })

    static accept_follower = asyncHandler(async (req: Request, res: Response) => {
        const result = await FollowerService.accept_follower(req.body)
        return makeSuccess(res, StatusCodes.ACCEPTED, result)
    })

    static remove_follower = asyncHandler(async (req: Request, res: Response) => {
        const result = await FollowerService.remove_follower(req.body)
        return makeSuccess(res, StatusCodes.ACCEPTED, result)
    })
}