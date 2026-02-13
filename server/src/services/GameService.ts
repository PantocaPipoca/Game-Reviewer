import {prisma} from "../prisma"
import {GameType} from "../types/Types"
import {ERR_GAME_NOTEXISTS} from "../utils/UsualErrorMessage"

export class GameService {
    static async FindGame(gameName: string): Promise<GameType> {
        const game: GameType = await prisma.game.findUnique({where: {gameName}})
        if (!game) ERR_GAME_NOTEXISTS.Throw()
        return game
    }
}
