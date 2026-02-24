import { prisma } from "../prisma";
import { GameFull, GameShort, GamePK } from "../types/Types";


/**
 * @description Selects a Game from the database
 * @param gamePK primary key of Game
 * @returns a promise of the table entry which contains the given primary key, if nothing is found the promise resolves to null
 */
export function SelectGame(gamePK: GamePK): Promise<GameFull | null> {
    return prisma.game.findUnique({
        where: { gameID: gamePK }
    });
}

/**
 * @description Inserts a Game in the database
 * @param game json with all fields of Game that need to be manually set
 * @returns a promise of the table entry which contains the full inserted Game
 */
export function InsertGame(game: GameShort): Promise<GameFull> {
    return prisma.game.create({
        data: game
    });
}

/**
 * @description Updates a Game in the database with the primary key given in game, with the rest of the values given
 * @param game json with all fields of Game that need to be manually set
 * @returns a promise of the updated table entry of the Game with the corresponding primary key
 */
export function UpdateGame(game: GameShort): Promise<GameFull> {
    return prisma.game.update({
        where: { gameID: game.gameID },
        data: { metadata: game.metadata }
    });
}

/**
 * @description Deletes a Game from the database
 * @param gamePK primary key of Game
 * @returns a promise of the deleted entry
 */
export function DeleteGame(gamePK: GamePK): Promise<GameFull> {
    return prisma.game.delete({
        where: { gameID: gamePK }
    });
}



// select games with same tags and/or similar name
