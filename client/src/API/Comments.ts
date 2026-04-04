import CLIENT from "./Client";
import type { CommentFull } from "./Types";

export class CommentAPI {
    static async getAll(reviewer: string, reviewed: number): Promise<CommentFull[]> {
        return CLIENT.get("/reviews/" + reviewer + "/" + reviewed + "/comments");
    }

    static async add(reviewer: string, reviewed: number, text: string): Promise<CommentFull> {
        return CLIENT.post("/reviews/" + reviewer + "/" + reviewed + "/comments", { text });
    }

    static async edit(reviewer: string, reviewed: number, id: string, text: string): Promise<CommentFull> {
        return CLIENT.put("/reviews/" + reviewer + "/" + reviewed + "/comments/" + id, { text });
    }

    static async remove(reviewer: string, reviewed: number, id: string): Promise<CommentFull> {
        return CLIENT.delete("/reviews/" + reviewer + "/" + reviewed + "/comments/" + id);
    }
}
