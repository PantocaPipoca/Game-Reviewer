import { GameFull, GamePK } from "../types/Types"
import * as GameRepository from "../Repository/GameRepository"
import { AppError } from "../utils/ErrorHandler"
import * as ErrorMessage from "../utils/ErrorMessage"
import { StatusCodes } from "http-status-codes"

export class GameService {
    /**
     * Gets a game by it's primary key
     * @param gameId - the game id
     * @returns Game Information
     */
    static async GetGameById(gameId: GamePK): Promise<GameFull> {
        const game: GameFull | null = await GameRepository.SelectGame(gameId)
        
        if (!game)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.GAME_NOT_FOUND)

        return {
            gameID: game.gameID,
            gameName: game.gameName,
            metadata: game.metadata
        }
    }

    /**
     * Searches for games by name and/or other atributes
     * @param name 
     * @param tag 
     */
    static async searchGames(name?: string, tag?: string): Promise<void> {
    }

    // WIP

    static async getPopularGames(): Promise<void> {
    }


    static async GetGameStats(gameId: GamePK): Promise<void> {
    }

    // needs a endpoint "get x games"
}
