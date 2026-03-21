import { AppError } from "../utils/ErrorHandler";
import * as ErrorMessage from "../utils/ErrorMessage";
import { StatusCodes } from "http-status-codes";
import { GameFull, GamePK, UserPK, GameCover } from "../types/Types";
import { GameRepository } from "../Repository/GameRepository";
import { IGDB } from "../IGDB/Requests";

export class GameService {
    /**
     * Gets a game by its primary key
     * @param gameId - the game id
     * @returns Game Information
     */
    // static async getGameById(gameId: GamePK): Promise<GameFull> {
    //     const game: GameFull | null = await GameRepository.selectGame(gameId)
    //     if (!game)
    //         throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.GAME_NOT_FOUND)

    //     return {
    //         gameID: game.gameID,
    //         gameName: game.gameName,
    //         metadata: game.metadata
    //     }
    // }
    // won't be used

    /**
     * Gets all info to make a page about a game
     * @param gameID the ID of the game we want to make a page for
     * @returns detailed info for the game in json format
     */
    static async getGamePage(gameID: GamePK): Promise<any[]> {
        return IGDB.getGameByID(gameID);
    }

    /**
     * Searches for games by name and/or genres
     * @param name name of the games
     * @param genres genres of the games
     * @param offset number of games on IGDB we want to skip
     * @param amount total number of games we want
     * @returns array of enough game info to make a cover
     */
    static async searchGames(name: string, genres: number[], offset: number, amount: number): Promise<GameCover[]> {
        return IGDB.searchGames(name, genres, offset, amount);
    }

    /**
     * Gets what games are popular on our db
     * @param offset number of games on IGDB we want to skip
     * @param amount total number of games we want
     * @returns array of enough game info to make a cover
     */
    static async getPopularGames(offset: number, amount: number): Promise<GameCover[]> {
        const popularGamesEntriesRaw = await GameRepository.getPopularGames(offset, amount);
        const popularGamesEntriesArr = popularGamesEntriesRaw.map((g) => g.gameID);
        return IGDB.getGivenGames(popularGamesEntriesArr);
    }

    /**
     * Gets what games have recently released
     * @param offset number of games on IGDB we want to skip
     * @param amount total number of games we want
     * @returns array of enough game info to make a cover
     */
    static async getRecentGames(amount: number, offset: number): Promise<GameCover[]> {
        return IGDB.getRecentGames(offset, amount);
    }

    /**
     * Gets what games are recommended to the given user
     * @param userPK primary key of the user we want the recommended games of
     * @param offset number of games on IGDB we want to skip
     * @param amount total number of games we want
     * @returns array of enough game info to make a cover
     */
    static async getRecommendedGames(userPK: UserPK, offset: number, amount: number): Promise<GameCover[]> {
        const likedGamesRaw = await GameRepository.getGamesUserLikes(userPK);
        if (likedGamesRaw.length < 1) {
            return GameService.getPopularGames(offset, amount);
        }
        const likedGamesParsed: number[] = likedGamesRaw.map((g) => g.gameID);
        const likedGenres: number[] = await IGDB.getGenresOfGames(likedGamesParsed);
        return IGDB.searchGames("", likedGenres, offset, amount);
    }

    // static async getGameStats(gameId: GamePK): Promise<void> {
    // }
    // won't be used

    // needs a endpoint "get x games"
}
