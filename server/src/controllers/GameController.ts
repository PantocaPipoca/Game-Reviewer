import {Request, Response} from "express"
import {AppError, AsyncHandler, MakeSuccess} from "../utils/ErrorHandler"
import * as ErrorMessage from "../utils/ErrorMessage"
import {StatusCodes} from "http-status-codes"
import {GameService} from "../services/GameService"

export class GameController {
    static GetGameById = AsyncHandler(async (req: Request, res: Response) => {
        const {gameName}    = req.body;
        if (!gameName)
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.GAME_NAME_REQUIRED);
        const result: any   = await GameService.GetGameById(gameName);
        return MakeSuccess(res, StatusCodes.OK, result);
    });


    // TODO LATER
    static GetPopularGames = AsyncHandler(async (req: Request, res: Response) => {
    
    });

    static SearchGames = AsyncHandler(async (req: Request, res: Response) => {
    
    });

    static GetGameStats = AsyncHandler(async (req: Request, res: Response) => {
    
    });
}
