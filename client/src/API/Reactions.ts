import CLIENT from "./Client";
import type { LikeShort, ReactionStateResponse } from "./Types";

export class ReactionAPI {
    static async getLikes(reviewer: string, reviewed: number): Promise<number> {
        return CLIENT.get("/reviews/" + reviewer + "/" + reviewed + "/likes");
    }

    static async getDislikes(reviewer: string, reviewed: number): Promise<number> {
        return CLIENT.get("/reviews/" + reviewer + "/" + reviewed + "/dislikes");
    }

    static async like(reviewer: string, reviewed: number): Promise<LikeShort> {
        return CLIENT.post("/reviews/" + reviewer + "/" + reviewed + "/likes");
    }

    static async dislike(reviewer: string, reviewed: number): Promise<LikeShort> {
        return CLIENT.post("/reviews/" + reviewer + "/" + reviewed + "/dislikes");
    }

    static async getReaction(reviewer: string, reviewed: number): Promise<ReactionStateResponse> {
        return CLIENT.get("/reviews/" + reviewer + "/" + reviewed + "/myReaction");
    }

    static async removeReaction(reviewer: string, reviewed: number): Promise<LikeShort> {
        return CLIENT.delete("/reviews/" + reviewer + "/" + reviewed + "/myReaction");
    }
}
