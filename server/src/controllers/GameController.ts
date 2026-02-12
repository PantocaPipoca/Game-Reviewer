import {Request, Response} from "express"
import {asyncHandler, makeSuccess} from "../utils/utils"
import {GameService} from "../services/GameService"
import {StatusCodes} from "http-status-codes"

export class GameController {
    static find_game = asyncHandler(async (req: Request, res: Response) => {
        const result = await GameService.find_game(req.body)
        return makeSuccess(res, StatusCodes.OK, result)
    })
}