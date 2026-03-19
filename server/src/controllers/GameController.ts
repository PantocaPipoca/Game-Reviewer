import { Request, Response } from "express"
import { AppError, AsyncHandler, MakeSuccess } from "../utils/ErrorHandler"
import * as ErrorMessage from "../utils/ErrorMessage"
import { StatusCodes } from "http-status-codes"
import { GameService } from "../services/GameService"
import { GameFull } from "../types/Types"
import { AuthRequest, ExtractLoggedUser } from "../utils/auth"

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


    /**
     * Returns all necessary info for the frontend to create a page for the game
     * Used by GET /api/games/id/:gameID/page
     */
    static GetGamePage: any = AsyncHandler(async (req: Request, res: Response) => {
        const gameIDStr = req.params['gameID'] as string;
        let gameID: number
        try {
            gameID = Number.parseInt(gameIDStr);
        } catch (e) {
            throw new AppError(StatusCodes.BAD_REQUEST, "gameID invalid");
        }
        const result = await GameService.GetGamePage(gameID);
        return MakeSuccess(res, StatusCodes.OK, result);
    });

    /**
     * Search games using query params
     * Used by POST /api/games/search
     */
    static SearchGames: any = AsyncHandler(async (req: Request, res: Response) => {
        let { name, genres, offset, amount } = req.body;
        if (!offset)
            throw new AppError(StatusCodes.BAD_REQUEST, "offset required");
        if (!amount)
            throw new AppError(StatusCodes.BAD_REQUEST, "amount required");
        if (!name)
            name = "";
        if (!genres)
            genres = [] as number[];
        const result = await GameService.SearchGames(name, genres, offset, amount);
        return MakeSuccess(res, StatusCodes.OK, result);
    });

    /**
     * Returns popular games on our db
     * Used by POST /api/games/popular
     */
    static GetPopularGames: any = AsyncHandler(async (req: Request, res: Response) => {
        const { offset, amount } = req.body;
        if (!Number.isInteger(offset))
            throw new AppError(StatusCodes.BAD_REQUEST, "offset required");
        if (!Number.isInteger(amount))
            throw new AppError(StatusCodes.BAD_REQUEST, "amount invalid");
        const result = await GameService.GetPopularGames(offset, amount);
        return MakeSuccess(res, StatusCodes.OK, result)
    });

    /**
     * Returns recently released games
     * Used by POST /api/games/recent
     */
    static GetRecentGames: any = AsyncHandler(async (req: Request, res: Response) => {
        const { offset, amount } = req.body;
        if (!Number.isInteger(offset))
            throw new AppError(StatusCodes.BAD_REQUEST, "offset required");
        if (!Number.isInteger(amount))
            throw new AppError(StatusCodes.BAD_REQUEST, "amount invalid");
        const result = await GameService.GetRecentGames(offset, amount);
        return MakeSuccess(res, StatusCodes.OK, result)
    });

    /**
     * Returns recommended games for a user
     * Used by POST /api/games/recommended
     */
    static GetRecommendedGames: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const { amount, offset } = req.body;
        const accountName = ExtractLoggedUser(req);
        if (!Number.isInteger(amount))
            throw new AppError(StatusCodes.BAD_REQUEST, "amount invalid");
        if (!Number.isInteger(offset))
            throw new AppError(StatusCodes.BAD_REQUEST, "offset required");
        const result = await GameService.getRecommendedGames(accountName, offset, amount);
    });





    static GetGameStats: any = AsyncHandler(async (req: Request, res: Response) => { });
}
