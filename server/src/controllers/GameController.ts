import { Request, Response } from "express";
import { AppError, asyncHandler, makeSuccess } from "../utils/ErrorHandler";
import * as ErrorMessage from "../utils/ErrorMessage";
import { StatusCodes } from "http-status-codes";
import { GameService } from "../services/GameService";
import { GameCover, GameFull } from "../types/Types";
import { AuthRequest, extractLoggedUser } from "../utils/Auth";

type QueryBody = {
    name: string;
    genres: number[];
    offset: number;
    amount: number;
};

const GENRES_SET: number[] = [2, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 24, 25, 26, 30, 31, 32, 33, 34, 35, 36];

function isValidOffset(num: unknown): boolean {
    return Number.isInteger(num) && (num as number) >= 0;
}

function isValidAmount(num: unknown): boolean {
    return Number.isInteger(num) && (num as number) > 0;
}

/**
 * Translates a game name string to a game ID
 * @param gameID the game id
 * @returns the ID corresponding to the game
 * @throws AppError if the game name is not a number or would return an invalid game ID
 */
export function toValidGameID(gameID: string | string[] | undefined): number {
    if (typeof gameID !== "string") throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.GAME_ID_REQUIRED);
    const id: number | null = Number(gameID);
    if (!Number.isSafeInteger(id) || id < 0) throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.GAME_ID_REQUIRED);
    return id;
}

export class GameController {
    /**
     * Finds a game by ID
     * Used by GET /api/games/:gameID
     */
    // static getGameById: any = asyncHandler(async (req: Request, res: Response) => {
    //     const result: GameFull = await GameService.getGameById(toValidGameID(req.params['gameID']));
    //     return makeSuccess(res, StatusCodes.OK, result);
    // });
    // won't be used

    /**
     * Returns all necessary info for the frontend to create a page for the game
     * Used by GET /api/games/id/:gameID
     */
    static getGameInfo = asyncHandler(async (req: Request, res: Response) => {
        const gameIDStr: string = req.params["gameID"] as string;
        let gameID: number;
        try {
            gameID = toValidGameID(gameIDStr);
            if (gameID <= 0) throw new Error();
        } catch (e) {
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.GAME_ID_INVALID);
        }
        const result: any = await GameService.getGameInfo(gameID);
        if (result === null) throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.GAME_NOT_FOUND);
        makeSuccess(res, StatusCodes.OK, result);
    });

    /**
     * Search games using query params
     * Used by POST /api/games/search
     */
    static searchGames = asyncHandler(async (req: Request, res: Response) => {
        let { name, genres, offset, amount }: QueryBody = req.body;
        if (!isValidOffset(offset)) throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.OFFSET_INVALID);
        if (!isValidAmount(amount)) throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.AMOUNT_INVALID);
        if (name === undefined) name = "";
        if (typeof name !== "string")
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.GAME_NAME_FORMAT_INVALID);
        if (genres === undefined) genres = [] as number[];
        if (!Array.isArray(genres) || !genres.every((x) => GENRES_SET.includes(x)))
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.GENRES_INVALID);
        const result: GameCover[] = await GameService.searchGames(name, genres, offset, amount);
        makeSuccess(res, StatusCodes.OK, result);
    });

    /**
     * Returns popular games on our db
     * Used by POST /api/games/popular
     */
    static getPopularGames = asyncHandler(async (req: Request, res: Response) => {
        const { offset, amount }: QueryBody = req.body;
        if (!isValidOffset(offset)) throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.OFFSET_INVALID);
        if (!isValidAmount(amount)) throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.AMOUNT_INVALID);
        const result: GameCover[] = await GameService.getPopularGames(offset, amount);
        makeSuccess(res, StatusCodes.OK, result);
    });

    /**
     * Returns recently released games
     * Used by POST /api/games/recent
     */
    static getRecentGames = asyncHandler(async (req: Request, res: Response) => {
        const { offset, amount }: QueryBody = req.body;
        if (!isValidOffset(offset)) throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.OFFSET_INVALID);
        if (!isValidAmount(amount)) throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.AMOUNT_INVALID);
        const result: GameCover[] = await GameService.getRecentGames(offset, amount);
        makeSuccess(res, StatusCodes.OK, result);
    });

    /**
     * Returns recommended games for a user
     * Used by POST /api/games/recommended
     */
    static getRecommendedGames = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { amount, offset }: QueryBody = req.body;
        const accountName = extractLoggedUser(req);
        if (!isValidOffset(offset)) throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.OFFSET_INVALID);
        if (!isValidAmount(amount)) throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.AMOUNT_INVALID);
        const result = await GameService.getRecommendedGames(accountName, offset, amount);
        makeSuccess(res, StatusCodes.OK, result);
    });
}
