import {prisma} from "../prisma"
import {GameType} from "../types/Types"
import {StatusCodes} from "http-status-codes"

// Error messages
const err_game_missing_name = "No game name provided"
const err_game_nonexistent = "Game doesn't exist"

export class GameService {
    static async find_game(data: GameType) {
        const {gameName} = data
        if (!gameName) throw {statusCode: StatusCodes.BAD_REQUEST, message: err_game_missing_name}

        const game: GameType = await prisma.game.findUnique({where: {gameName}})
        if (!game) throw {statusCode: StatusCodes.NOT_FOUND, message: err_game_nonexistent}

        return game
    }
}