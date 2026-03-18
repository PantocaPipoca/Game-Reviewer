import client from "./Client";
import type { ReviewFull } from "./Types";

export class ReviewAPI {
    static async publish(
        gameID: number,
        data: {
            text: string;
            score: number;
        },
    ): Promise<ReviewFull> {
        return client.post("/games/" + gameID + "/reviews", data);
    }

    static async update(
        gameID: number,
        data: {
            text?: string;
            score?: number;
        },
    ): Promise<ReviewFull> {
        return client.put("/games/" + gameID + "/reviews", data);
    }

    static async remove(gameID: number): Promise<ReviewFull> {
        return client.delete("/games/" + gameID + "/reviews");
    }

    static async getByGame(gameID: number): Promise<ReviewFull[]> {
        return client.get("/games/" + gameID + "/reviews");
    }

    static async getByUser(username: string): Promise<ReviewFull[]> {
        return client.get("/users/" + username + "/reviews");
    }

    static async get(reviewer: string, reviewed: number): Promise<ReviewFull> {
        return client.get("/reviews/" + reviewer + "/" + reviewed);
    }
}
