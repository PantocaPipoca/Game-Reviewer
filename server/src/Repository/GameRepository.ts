import { prisma } from "../prisma";
import type { Game } from "../generated/prisma/client";
export { Game };

export type game = {
    gameName: string;
    metadata: any;
}

export type gamePK = string;

// select game
export function SelectGame(gamePK: gamePK): Promise<Game | null> {
    return prisma.game.findUnique({
        where: { gameName: gamePK }
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
        where: { gameName: game.gameName },
        data: { metadata: game.metadata }
    });
}

// delete game DONT CALL THIS ON CODE ACCESSIBLE FROM AN ENDPOINT!!!
export function DeleteGame(gamePK: gamePK): Promise<Game> {
    return prisma.game.delete({
        where: { gameName: gamePK }
    });
}



// select games with same tags and/or similar name
