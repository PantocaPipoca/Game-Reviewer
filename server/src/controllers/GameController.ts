import {Request, Response} from "express"
import {AppError, AsyncHandler, MakeSuccess} from "../utils/ErrorHandler"
import * as ErrorMessage from "../utils/ErrorMessage"
import {StatusCodes} from "http-status-codes"
import {GameService} from "../services/GameService"
import { GameFull } from "../types/Types"

/**
 * Translates a game name string to a game ID
 * @param gameID the game id
 * @returns the ID corresponding to the game
 * @throws AppError if the game name is not a number or would return an invalid game ID
 */
export function toValidGameID(gameID: string | string[] | undefined): number {
    if (typeof gameID !== 'string')
        throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.GAME_ID_REQUIRED);
    const id: number | null = Number(gameID);
    if (!Number.isSafeInteger(id) || id < 0)
        throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.GAME_ID_REQUIRED);
    return id;
}

export class GameController {
    /**
     * Finds a game by ID
     * Used by GET /api/games/:gameID
     */
    static GetGameById: any = AsyncHandler(async (req: Request, res: Response) => {
        const result: GameFull = await GameService.GetGameById(toValidGameID(req.params['gameID']));
        return MakeSuccess(res, StatusCodes.OK, result);
    });

    // TODO

    /**
     * Search games using query params
     * Used by GET /api/games
     */
    static SearchGames: any = AsyncHandler(async (req: Request, res: Response) => {});

    /**
     * Returns popular games ordered by score or review count
     * Used by GET /api/games/popular
     */
    static GetPopularGames: any = AsyncHandler(async (_: Request, res: Response) => {});

    static GetGameStats: any = AsyncHandler(async (req: Request, res: Response) => {});
}
