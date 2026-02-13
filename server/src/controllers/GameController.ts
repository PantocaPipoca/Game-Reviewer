import {Request, Response} from "express"
import {AsyncHandler, MakeSuccess} from "../utils/utils"
import {StatusCodes} from "http-status-codes"
import {ERR_GAME_MISSING_NAME} from "../utils/UsualErrorMessage"
import {GameService} from "../services/GameService"

export class GameController {
    static FindGame = AsyncHandler(async (req: Request, res: Response) => {
        const {gameName}    = req.body
        if (!gameName) ERR_GAME_MISSING_NAME.Throw()
        const result: any   = await GameService.FindGame(gameName)
        return MakeSuccess(res, StatusCodes.OK, result)
    })
}
