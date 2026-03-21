import { PRISMA } from "../Prisma";
import { GameFull, GameShort, GamePK, UserPK } from "../types/Types";

export class GameRepository {
    /**
     * @description Selects a Game from the database
     * @param gamePK primary key of Game
     * @returns a promise of the table entry which contains the given primary key, if nothing is found the promise resolves to null
     */
    public static selectGame(gamePK: GamePK): Promise<GameFull | null> {
        return PRISMA.game.findUnique({
            where: { gameID: gamePK },
        });
    }

    /**
     * @description Inserts a Game in the database
     * @param game json with all fields of Game that need to be manually set
     * @returns a promise of the table entry which contains the full inserted Game
     */
    public static insertGame(game: GameShort): Promise<GameFull> {
        return PRISMA.game.create({
            data: game,
        });
    }

    /**
     * @description Updates a Game in the database with the primary key given in game, with the rest of the values given
     * @param game json with all fields of Game that need to be manually set
     * @returns a promise of the updated table entry of the Game with the corresponding primary key
     */
    public static updateGame(game: GameShort): Promise<GameFull> {
        return PRISMA.game.update({
            where: { gameID: game.gameID },
            data: { metadata: game.metadata },
        });
    }

    /**
     * @description Deletes a Game from the database
     * @param gamePK primary key of Game
     * @returns a promise of the deleted entry
     */
    public static deleteGame(gamePK: GamePK): Promise<GameFull> {
        return PRISMA.game.delete({
            where: { gameID: gamePK },
        });
    }

    /**
     * @description Returns the most popular games from the database, that definition being "games with the most reviews with scores higher or equal to 7"
     * @param amount the number of games on the returned array
     * @param offset the number of games first on the list that are skipped
     * @returns a promise of an array of entries with the popular games' gameID
     */
    public static getPopularGames(offset: number, amount: number): Promise<{ gameID: GamePK }[]> {
        return PRISMA.review
            .groupBy({
                by: ["reviewed"],
                _count: {
                    reviewer: true,
                },
                where: {
                    score: {
                        gte: 7,
                    },
                },
                orderBy: {
                    _count: {
                        reviewer: "desc",
                    },
                },
                skip: offset,
                take: amount,
            })
            .then((results) => results.map((x) => ({ gameID: x.reviewed })));
    }

    /**
     * @description Returns the top 50% of games a specific User has left a review on
     * @param userPK primary key of the user we want the liked games
     * @returns a promise of an array of entries with the user liked games' gameID
     */
    public static getGamesUserLikes(userPK: UserPK): Promise<{ gameID: GamePK }[]> {
        return PRISMA.review
            .findMany({
                where: {
                    reviewer: userPK,
                    score: {
                        gte: 6,
                    },
                },
                select: {
                    reviewed: true,
                },
                orderBy: {
                    score: "desc",
                },
                take: 20,
            })
            .then((results) => results.map((x) => ({ gameID: x.reviewed })));
    }
}
