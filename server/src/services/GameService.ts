import { GamePK, UserPK, GameCover } from "../types/Types";
import { GameRepository } from "../Repository/GameRepository";
import { IGDB } from "../IGDB/Requests";
import { ReviewService } from "./ReviewService";

async function countReviews(game: GameCover): Promise<number> {
    try {
        return (await ReviewService.getReviewsByGame(game.id, undefined, true)).length;
    } catch (_) {
        return 0;
    }
}

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
    static async getGameInfo(gameID: GamePK): Promise<any> {
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
        const games: GameCover[] = await IGDB.searchGames(name, genres, offset, amount);
        const sortedGames = await Promise.all(
            games.map(async (game) => ({ item: game, sortKey: await countReviews(game) }))
        );
        sortedGames.sort((a, b) => b.sortKey - a.sortKey);
        return sortedGames.map((game) => game.item);
    }

    /**
     * Gets what games are popular on our db
     * @param offset number of games on IGDB we want to skip
     * @param amount total number of games we want
     * @returns array of enough game info to make a cover
     */
    static async getPopularGames(offset: number, amount: number): Promise<GameCover[]> {
        const popularGames: number[] = await GameRepository.getPopularGames(offset, amount);
        return IGDB.getGivenGames(popularGames);
    }

    /**
     * Gets what games have recently released
     * @param offset number of games on IGDB we want to skip
     * @param amount total number of games we want
     * @returns array of enough game info to make a cover
     */
    static async getRecentGames(offset: number, amount: number): Promise<GameCover[]> {
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
        const likedGames: number[] = await GameRepository.getGamesUserLikes(userPK);
        if (likedGames.length < 1) {
            return GameService.getPopularGames(offset, amount);
        }
        const likedGenres: number[] = await IGDB.getGenresOfGames(likedGames); // TODO: swap this function for ours
        return IGDB.searchGames("", likedGenres, offset, amount);
    }

    /**
     * Sends the request to IGDB to get information about the games
     * @param ids array of game ids
     * @returns array of Games
     */
    static async getGamesBatch(ids: GamePK[]): Promise<GameCover[]> {
        if (ids.length === 0) return [];
        return IGDB.getGivenGames(ids);
    }
}
