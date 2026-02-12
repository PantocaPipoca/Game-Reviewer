import {Request, Response} from "express"
import {asyncHandler, makeSuccess} from "../utils/utils"
import {AccountService} from "../services/AccountService"
import {StatusCodes} from "http-status-codes"

export class AccountController {
    static register = asyncHandler(async (req: Request, res: Response) => {
        const result = await AccountService.register(req.body)
        return makeSuccess(res, StatusCodes.CREATED, result)
    })

    static login = asyncHandler(async (req: Request, res: Response) => {
        const result = await AccountService.login(req.body)
        return makeSuccess(res, StatusCodes.OK, result)
    })

    static alter = asyncHandler(async (req: Request, res: Response) => {
        const result = await AccountService.alter(req.body)
        return makeSuccess(res, StatusCodes.ACCEPTED, result)
    })

    static remove = asyncHandler(async (req: Request, res: Response) => {
        const result = await AccountService.remove(req.body)
        return makeSuccess(res, StatusCodes.ACCEPTED, result)
    })

    // Requires auth: TODO
    static getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
        return makeSuccess(res, StatusCodes.OK, {user: req.body.username})
    })
}