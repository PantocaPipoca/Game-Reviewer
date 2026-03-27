import CLIENT from "./Client";
import type { CommentFull } from "./Types";

export class CommentAPI {
    static async getAll(reviewer: string, reviewed: number): Promise<CommentFull[]> {
        return CLIENT.get("/reviews/" + reviewer + "/on/" + reviewed + "/comments");
    }

    static async add(reviewer: string, reviewed: number, text: string): Promise<CommentFull> {
        return CLIENT.post("/reviews/" + reviewer + "/on/" + reviewed + "/comments", { text });
    }

    static async edit(reviewer: string, reviewed: number, id: string, text: string): Promise<CommentFull> {
        return CLIENT.put("/reviews/" + reviewer + "/on/" + reviewed + "/comments/" + id, { text });
    }

    static async remove(reviewer: string, reviewed: number, id: string): Promise<CommentFull> {
        return CLIENT.delete("/reviews/" + reviewer + "/on/" + reviewed + "/comments/" + id);
    }
}
