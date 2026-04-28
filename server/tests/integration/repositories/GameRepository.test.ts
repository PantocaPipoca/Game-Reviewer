import { describe, it, expect } from "@jest/globals";
import { GameRepository } from "../../../src/Repository/GameRepository";
import { GameCover, GameFull } from "../../../src/types/Types";
import { InputJsonValue, JsonValue } from "@prisma/client/runtime/client";
import { fastCreateGame } from "../helper/helper";
import { IGDB } from "../../../src/IGDB/Requests";

describe("GameRepository (integration)", () => {
    // Auxiliary function, checks a games's name, id and data against expected values
    async function checkGameAux(game: GameFull | null, id: number, name: string, data: JsonValue) {
        expect(game).not.toBeNull();
        expect(game?.gameID).toBe(id);
        expect(game?.gameName).toBe(name);
        expect(game?.metadata).toBeDefined();
        expect(game?.metadata).toStrictEqual(data);
    }

    it("InsertGame correctly creates games; UpdateGame correctly updates games' metadata; DeleteGame correctly deletes games; SelectGames, InsertGame, UpdateGame and DeleteGame always give correct info", async () => {
        // Array of 10 games
        const arr: GameFull[] = [];
        for (var i = 0; i < 10; i++) {
            arr.push(await fastCreateGame(i));
        }

        // Check all game data against expected values
        for (var i = 0; i < arr.length; i++) {
            const game: GameFull | null = await GameRepository.selectGame(arr[i].gameID);
            checkGameAux(game, arr[i].gameID, arr[i].gameName, arr[i].metadata);
        }

        // UpdateGame returns the correct
        const g1: GameFull = await GameRepository.updateGame({
            gameID: arr[0].gameID,
            gameName: arr[0].gameName,
            metadata: arr[1].metadata as InputJsonValue,
        });
        const g2: GameFull = await GameRepository.updateGame({
            gameID: arr[1].gameID,
            gameName: arr[1].gameName,
            metadata: arr[2].metadata as InputJsonValue,
        });
        checkGameAux(g1, arr[0].gameID, arr[0].gameName, arr[1].metadata);
        checkGameAux(g2, arr[1].gameID, arr[1].gameName, arr[2].metadata);
        const g3: GameFull | null = await GameRepository.selectGame(arr[0].gameID);
        checkGameAux(g3, arr[0].gameID, arr[0].gameName, arr[1].metadata);

        // DeleteGame
        const g4: GameFull = await GameRepository.deleteGame(arr[0].gameID);
        checkGameAux(g4, arr[0].gameID, arr[0].gameName, arr[1].metadata);
        const g5: GameFull | null = await GameRepository.selectGame(arr[0].gameID);
        expect(g5).toBeNull();
    });
});

describe("IGDB requests (integration)", () => {
    it("checks if getGameByID is working correctly", async () => {
        const game: any = await IGDB.getGameByID(26226);
        expect(game).toHaveProperty("id");
        expect(game).toHaveProperty("cover");
        expect(game).toHaveProperty("first_release_date");
        expect(game).toHaveProperty("name");
    });

    it("checks if searchGames is working correctly", async () => {
        const name = "celes";
        const genres = [8, 32];
        const offset = 0;
        const amount = 3;
        const games: any[] = await IGDB.searchGames(name, genres, offset, amount);
        expect(games).toHaveLength(amount);
        const regex = new RegExp(name, "i");
        for (const game of games) {
            expect(game).toHaveProperty("id");
            expect(game).toHaveProperty("cover");
            expect(game).toHaveProperty("name");

            expect(game["name"]).toMatch(regex);
            let gameFull: any = await IGDB.getGameByID(game["id"]);
            let genresRaw = gameFull["genres"] as { id: number }[];
            let genresParsed: number[] = genresRaw.map((elem) => elem.id);
            const hasMatch = genres.some((g) => genresParsed.includes(g));
            expect(hasMatch).toBe(true);
        }
    }, 15000);

    it("checks if getGivenGames is working correctly", async () => {
        const gameIDs: number[] = [121, 1879, 14593, 26226];
        const games: GameCover[] = await IGDB.getGivenGames(gameIDs);
        expect(games.length).toBe(gameIDs.length);
        for (const game of games) {
            expect(gameIDs).toContain(game.id);
        }
    });

    it("checks if getRecentGames is working correctly", async () => {
        const offset = 0;
        const amount = 3;
        const games: any[] = await IGDB.getRecentGames(offset, amount);
        expect(games).toHaveLength(amount);

        for (const game of games) {
            expect(game).toHaveProperty("id");
            expect(game).toHaveProperty("cover");
            expect(game).toHaveProperty("name");

            let gameFull: any = await IGDB.getGameByID(game["id"]);
            expect(gameFull["first_release_date"]).toBeLessThan(Date.now() / 1000);

            const week = 7 * 24 * 60 * 60;
            expect(gameFull["first_release_date"]).toBeGreaterThan(Date.now() / 1000 - week);
        }
    }, 15000);

    it("checks if getGenresOfGames is working correctly", async () => {
        const games: number[] = [1, 1879, 26226];
        const genres: number[] = await IGDB.getGenresOfGames(games);
        expect(genres.length).toBeGreaterThanOrEqual(1);
        expect(new Set(genres).size).toBe(genres.length); // no repeating elements
    });
});
