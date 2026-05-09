import CLIENT from "./Client";
import type { ReviewFull, ReviewWithAvatar } from "./Types";

export class ReviewAPI {
    static async publish(
        gameID: number,
        data: { text: string; score: number; hoursPlayed?: number; platforms?: string[] }
    ): Promise<ReviewFull> {
        return CLIENT.post("/games/id/" + gameID + "/reviews", data);
    }
    static async update(
        gameID: number,
        data: { text?: string; score?: number; hoursPlayed?: number; platforms?: string[] }
    ): Promise<ReviewFull> {
        return CLIENT.put("/games/id/" + gameID + "/reviews", data);
    }
    static async remove(gameID: number): Promise<ReviewFull> {
        return CLIENT.delete("/games/id/" + gameID + "/reviews");
    }
    static async getByGame(gameID: number): Promise<ReviewWithAvatar[]> {
        return CLIENT.get("/games/id/" + gameID + "/reviews");
    }
    static async getByUser(username: string): Promise<ReviewWithAvatar[]> {
        return CLIENT.get("/users/id/" + username + "/reviews");
    }

    static async get(reviewer: string, reviewed: number): Promise<ReviewFull> {
        return CLIENT.get("/reviews/" + reviewer + "/" + reviewed);
    }
}
