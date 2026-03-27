import CLIENT from "./Client";
import type { GameFull, GameSearchResult } from "./Types";

export class GameAPI {
    static async search(params: { name?: string; tag?: string; limit?: number }): Promise<GameSearchResult[]> {
        const response = (await CLIENT.post("/games/search", {
            name: params.name ?? "",
            genres: [],
            offset: 0,
            amount: params.limit ?? 50,
        })) as { id: number; name: string; cover?: { url?: string } }[];

        return response.map((game) => ({
            id: game.id,
            name: game.name,
            cover: game.cover?.url?.replace("t_thumb", "t_cover_big"),
        }));
    }

    static async getPopular(): Promise<GameFull[]> {
        return CLIENT.get("/games/popular");
    }

    static async getById(gameID: number): Promise<GameFull> {
        return CLIENT.get("/games/id/" + gameID);
    }
}
