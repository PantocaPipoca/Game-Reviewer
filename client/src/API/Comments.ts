import client from "./Client";
import type { CommentFull } from "./Types";

export class CommentAPI {
    static async getAll(reviewer: string, reviewed: number): Promise<CommentFull[]> {
        return client.get("/reviews/" + reviewer + "/" + reviewed + "/comments");
    }

    static async add(reviewer: string, reviewed: number, text: string): Promise<CommentFull> {
        return client.post("/reviews/" + reviewer + "/" + reviewed + "/comments", { text });
    }

    static async edit(reviewer: string, reviewed: number, id: string, text: string): Promise<CommentFull> {
        return client.put("/reviews/" + reviewer + "/" + reviewed + "/comments/" + id, { text });
    }

    static async remove(reviewer: string, reviewed: number, id: string): Promise<CommentFull> {
        return client.delete("/reviews/" + reviewer + "/" + reviewed + "/comments/" + id);
    }
}
