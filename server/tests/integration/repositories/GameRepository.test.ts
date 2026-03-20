import {describe, it, expect} from "@jest/globals";
import {GameRepository} from "../../../src/Repository/GameRepository";
import {GameFull} from '../../../src/types/Types';
import {InputJsonValue, JsonValue} from "@prisma/client/runtime/client";
import { CreateGame } from "../helper/helper";

describe("GameRepository (integration)", () => {
    // Auxiliary function, checks a games's name, id and data against expected values
    async function CheckGameAux(game: GameFull | null, id: number, name: string, data: JsonValue) {
        expect(game).not.toBeNull();
        expect(game?.gameID).toBe(id);
        expect(game?.gameName).toBe(name);
        expect(game?.metadata).toBeDefined();
        expect(game?.metadata).toStrictEqual(data);
    }

    it("InsertGame correctly creates games; UpdateGame correctly updates games' metadata; DeleteGame correctly deletes games; SelectGames, InsertGame, UpdateGame and DeleteGame always give correct info", async () => {
        // Array of 10 games
        const arr: GameFull[] = [];
        for (var i = 0; i < 10; i++){
            arr.push(await CreateGame());
        }

        // Check all game data against expected values
        for (var i = 0; i < arr.length; i++) {
            const game: GameFull | null = await GameRepository.SelectGame(arr[i].gameID);
            CheckGameAux(game, arr[i].gameID, arr[i].gameName, arr[i].metadata);
        }

        // UpdateGame returns the correct
        const g1: GameFull = await GameRepository.UpdateGame({gameID: arr[0].gameID, gameName: arr[0].gameName, metadata: arr[1].metadata as InputJsonValue});
        const g2: GameFull = await GameRepository.UpdateGame({gameID: arr[1].gameID, gameName: arr[1].gameName, metadata: arr[2].metadata as InputJsonValue});
        CheckGameAux(g1, arr[0].gameID, arr[0].gameName, arr[1].metadata);
        CheckGameAux(g2, arr[1].gameID, arr[1].gameName, arr[2].metadata);
        const g3: GameFull | null = await GameRepository.SelectGame(arr[0].gameID);
        CheckGameAux(g3, arr[0].gameID, arr[0].gameName, arr[1].metadata);

        // DeleteGame
        const g4: GameFull = await GameRepository.DeleteGame(arr[0].gameID);
        CheckGameAux(g4, arr[0].gameID, arr[0].gameName, arr[1].metadata);
        const g5: GameFull | null = await GameRepository.SelectGame(arr[0].gameID);
        expect(g5).toBeNull();
    });
});

describe("IGDB requests (integration)", () => {
    it.todo(`
        Checks if IGDB requests are all working correctly:
            get game by id
            search games
            get given games
            get recent games
            get genres of games
    `);
});
