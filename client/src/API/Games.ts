import CLIENT from "./Client";
import type { GameFull, GameSearchResult } from "./Types";

export class GameAPI {
    static async search(params: {
        name?: string;
        tag?: string;
        limit?: number;
        offset?: number;
    }): Promise<GameSearchResult[]> {
        const limit: number = params.limit ?? 50;
        const offset: number = params.offset ?? 0;

        const response = (await CLIENT.post("/games/search", {
            name: params.name ?? "",
            genres: [],
            offset: offset,
            amount: limit,
        })) as { id: number; name: string; cover?: { url?: string } }[];

        return response.map((game) => ({
            id: game.id,
            name: game.name,
            cover: game.cover?.url?.replace("t_thumb", "t_cover_big"),
        }));
    }

    static async getPopular(): Promise<GameFull[]> {
        return CLIENT.post("/games/popular");
    }

    static async getById(gameID: number): Promise<GameFull> {
        return CLIENT.get("/games/id/" + gameID);
    }
}
