import {Request, Response} from "express"
import {AppError, AsyncHandler, MakeSuccess} from "../utils/ErrorHandler"
import * as ErrorMessage from "../utils/ErrorMessage"
import {StatusCodes} from "http-status-codes"
import {GameService} from "../services/GameService"
import { GameFull } from "../types/Types"

export function toValidGameID(gameID?: string | string[] | undefined): number {
    if (!gameID || typeof gameID !== 'string')
        throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.GAME_NAME_REQUIRED);
    const id: number | null = Number(gameID);
    if (isNaN(id))
        throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.GAME_NAME_REQUIRED);
    return id;
}

export class GameController {
    static GetGameById = AsyncHandler(async (req: Request, res: Response) => {
        const result: GameFull = await GameService.GetGameById(toValidGameID(req.params['gameID']));
        return MakeSuccess(res, StatusCodes.OK, result);
    });

    static SearchGames = AsyncHandler(async (req: Request, res: Response) => {
        // TODO
    });

    static GetPopularGames = AsyncHandler(async (req: Request, res: Response) => {
    
    });

    static GetGameStats = AsyncHandler(async (req: Request, res: Response) => {
    
    });
}
