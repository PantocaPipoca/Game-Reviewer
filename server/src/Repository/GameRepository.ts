import { prisma } from "../prisma";
import { GameFull, GameShort, GamePK, UserPK } from "../types/Types";

export class GameRepository {

    /**
     * @description Selects a Game from the database
     * @param gamePK primary key of Game
     * @returns a promise of the table entry which contains the given primary key, if nothing is found the promise resolves to null
     */
    public static SelectGame(gamePK: GamePK): Promise<GameFull | null> {
        return prisma.game.findUnique({
            where: { gameID: gamePK }
        });
    }

    /**
     * @description Inserts a Game in the database
     * @param game json with all fields of Game that need to be manually set
     * @returns a promise of the table entry which contains the full inserted Game
     */
    public static InsertGame(game: GameShort): Promise<GameFull> {
        return prisma.game.create({
            data: game
        });
    }

    /**
     * @description Updates a Game in the database with the primary key given in game, with the rest of the values given
     * @param game json with all fields of Game that need to be manually set
     * @returns a promise of the updated table entry of the Game with the corresponding primary key
     */
    public static UpdateGame(game: GameShort): Promise<GameFull> {
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
    public static DeleteGame(gamePK: GamePK): Promise<GameFull> {
        return prisma.game.delete({
            where: { gameID: gamePK }
        });
    }

    /**
     * @description Returns the most popular games from the database, that definition being "games with the most reviews with scores higher or equal to 7"
     * @param amount the number of games on the returned array
     * @param offset the number of games first on the list that are skipped
     * @returns a promise of an array of entries with the popular games' gameID
     */
    public static GetPopularGames(amount: number, offset: number): Promise<{ gameID: GamePK }[]> {

        return prisma.review.groupBy({
            by: ['reviewed'],
            _count: {
                reviewer: true
            },
            where: {
                score: {
                    gte: 7
                }
            },
            orderBy: {
                _count: {
                    reviewer: 'desc'
                }
            },
            skip: offset,
            take: amount
        }).then(results =>
            results.map(x => ({ gameID: x.reviewed }))
        );
    }


    /**
     * @description Returns the top 50% of games a specific User has left a review on
     * @param userPK primary key of the user we want the liked games
     * @returns a promise of an array of entries with the user liked games' gameID
     */
    public static GetGamesUserLikes(userPK: UserPK): Promise<{ gameID: GamePK }[]> {

        return prisma.review.findMany({
            where: {
                reviewer: userPK
            },
            select: {
                reviewed: true
            },
            orderBy: {
                score: 'desc'
            },
            take: 20

        }).then(results =>
            results.map(x => ({ gameID: x.reviewed }))
        );

    }
}
