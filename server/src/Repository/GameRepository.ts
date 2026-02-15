import { prisma } from "../prisma";
import type { Game } from "../generated/prisma/client";
export type { Game };

export type gamePK = number;

export type game = {
    gameID: gamePK;
    gameName: string;
    metadata: any;
}

// select game
export function SelectGame(gamePK: gamePK): Promise<Game | null> {
    return prisma.game.findUnique({
        where: { gameID: gamePK }
    });
}

// insert game DONT CALL THIS ON CODE ACCESSIBLE FROM AN ENDPOINT!!!
export function InsertGame(game: game): Promise<Game> {
    return prisma.game.create({
        data: game
    });
}

// update game DONT CALL THIS ON CODE ACCESSIBLE FROM AN ENDPOINT!!!
export function UpdateGame(game: game): Promise<Game> {
    return prisma.game.update({
        where: { gameID: game.gameID },
        data: { metadata: game.metadata }
    });
}

// delete game DONT CALL THIS ON CODE ACCESSIBLE FROM AN ENDPOINT!!!
export function DeleteGame(gamePK: gamePK): Promise<Game> {
    return prisma.game.delete({
        where: { gameID: gamePK }
    });
}



// select games with same tags and/or similar name
