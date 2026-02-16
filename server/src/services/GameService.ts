import { GameResponse } from "../types/Types"
import * as GameRepository from "../Repository/GameRepository"
import { SelectGame } from "../Repository/GameRepository"
import { AppError } from "../utils/ErrorHandler"
import * as ErrorMessage from "../utils/ErrorMessage"
import { StatusCodes } from "http-status-codes"

export class GameService {
    static async GetGameById(gameId: number): Promise<GameResponse> {
        const game = await SelectGame(gameId)
        
        if (!game)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.GAME_NOT_FOUND)

        return {
            id: game.gameID,
            metadata: game.metadata
        }
    }

    static async searchGames(name?: string, tag?: string): Promise<void> {
    }

    static async getPopularGames(): Promise<void> {
    }


    static async GetGameStats(gameId: number): Promise<void> {
    }
}
