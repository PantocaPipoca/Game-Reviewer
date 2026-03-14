import client from "./Client";
import type { GameFull } from "./Types";

export class GameAPI{
    static async search(params: { name?: string; tag?: string }): Promise<GameFull[]> {
        return client.get("/games", { params });
    }

    static async getPopular(): Promise<GameFull[]> {
        return client.get("/games/popular");
    }

    static async getById(gameID: number): Promise<GameFull> {
        return client.get("/games/" + gameID);
    }
}