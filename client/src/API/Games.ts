import CLIENT from "./Client";
import { ReviewAPI } from "./Reviews";
import type { GameFull, GameSearchResult } from "./Types";

type GameStruct = {
    id: number;
    name: string;
    cover?:
        | {
              url?: string | undefined;
          }
        | undefined;
};

async function countReviews(game: GameStruct): Promise<number> {
    try {
        return (await ReviewAPI.getByGame(game.id)).length;
    } catch (_) {
        return Promise.resolve(0);
    }
}

async function sortByReviewCount(array: GameStruct[]): Promise<GameStruct[]> {
    const mapped = await Promise.all(array.map(async (game) => ({ item: game, sortKey: await countReviews(game) })));
    mapped.sort((a, b) => b.sortKey - a.sortKey);
    return mapped.map(({ item }) => item);
}

export class GameAPI {
    static async search(params: {
        name?: string;
        tag?: string;
        limit?: number;
        sortRelevant?: boolean;
    }): Promise<GameSearchResult[]> {
        const limit: number = params.limit ?? 50;

        let response: GameStruct[] = (await CLIENT.post("/games/search", {
            name: params.name ?? "",
            genres: [],
            offset: 0,
            amount: params.sortRelevant ? 50 : limit,
        })) as { id: number; name: string; cover?: { url?: string } }[];

        if (params.sortRelevant) response = (await sortByReviewCount(response)).slice(0, limit);

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
