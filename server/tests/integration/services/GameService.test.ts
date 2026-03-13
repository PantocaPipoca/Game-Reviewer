import {describe, it, expect} from "@jest/globals";
import {GameFull} from "../../../src/types/Types";
import {CreateGame} from "../helper/helper";
import {GameService} from '../../../src/services/GameService';

describe("GameService (integration)", () => {
    it("GetGameById correctly returns a selected game", async () => {
        // Array of 50 games
        const arr: GameFull[] = [];
        for (var i = 0; i < 50; i++) arr.push(await CreateGame());

        // Check all game data against expected values
        for (var i = 0; i < arr.length; i++) {
            const game: GameFull = await GameService.GetGameById(arr[i].gameID);
            expect(arr[i].gameID).toBe(game.gameID);
            expect(arr[i].gameName).toBe(game.gameName);
            expect(arr[i].metadata).toStrictEqual(game.metadata);
        }
    });

    it.todo("SearchGames");

    it.todo("GetPopularGames");

    it.todo("GetGameStats");
});
