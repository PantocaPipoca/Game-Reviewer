import CLIENT from "./Client";
import type { GameCover, GameFull, GameSearchResult, BigGameCover } from "./Types";

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
            offset,
            amount: limit,
        })) as { id: number; name: string; cover?: { url?: string } }[];

        return response.map((game) => ({
            id: game.id,
            name: game.name,
            cover: game.cover?.url?.replace("t_thumb", "t_cover_big"),
        }));
    }

    static async getPopular(offset: number = 0, amount: number = 5): Promise<BigGameCover[]> {
        return CLIENT.post("/games/popular", { offset, amount });
    }

    static async getRecommended(offset: number = 0, amount: number = 10): Promise<GameCover[]> {
        return CLIENT.post("/games/recommended", { offset, amount });
    }

    static async getById(gameID: number): Promise<GameFull> {
        return CLIENT.get("/games/id/" + gameID);
    }
}
