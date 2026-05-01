import CLIENT from "./Client";
import type { GameCover, GameFull, GameSearchResult } from "./Types";

export class GameAPI {
    static async search(params: {
        name?: string;
        tag?: string;
        limit?: number;
        offset?: number;
    }): Promise<GameSearchResult[]> {
        const offset: number = params.offset ?? 0;

        let response = (await CLIENT.post("/games/search", {
            name: params.name ?? "",
            genres: [],
            offset: offset,
            amount: 50,
        })) as { id: number; name: string; cover?: { url?: string } }[];

        if (params.limit !== undefined) response = response.slice(0, params.limit);

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

    static async getBatch(ids: number[]): Promise<GameCover[]> {
        return CLIENT.post("/games/batch", { ids });
    }
}
