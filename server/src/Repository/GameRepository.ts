import { prisma } from "../prisma";
import { GameFull, GameShort, GamePK } from "../types/Types";


// select game
export function SelectGame(gamePK: GamePK): Promise<GameFull | null> {
    return prisma.game.findUnique({
        where: { gameID: gamePK }
    });
}

// insert game DONT CALL THIS ON CODE ACCESSIBLE FROM AN ENDPOINT!!!
export function InsertGame(game: GameShort): Promise<GameFull> {
    return prisma.game.create({
        data: game
    });
}

// update game DONT CALL THIS ON CODE ACCESSIBLE FROM AN ENDPOINT!!!
export function UpdateGame(game: GameShort): Promise<GameFull> {
    return prisma.game.update({
        where: { gameID: game.gameID },
        data: { metadata: game.metadata }
    });
}

// delete game DONT CALL THIS ON CODE ACCESSIBLE FROM AN ENDPOINT!!!
export function DeleteGame(gamePK: GamePK): Promise<GameFull> {
    return prisma.game.delete({
        where: { gameID: gamePK }
    });
}



// select games with same tags and/or similar name
