import client from "./Client";
import type { FollowerFull } from "./Types";

export class FollowerAPI {
    static async getFollowers(username: string): Promise<FollowerFull[]> {
        return client.get("/users/" + username + "/followers");
    }

    static async follow(username: string): Promise<FollowerFull> {
        return client.post("/users/" + username + "/followers");
    }

    static async unfollow(username: string): Promise<FollowerFull> {
        return client.delete("/users/" + username + "/followers");
    }

    static async getFollowing(username: string): Promise<FollowerFull[]> {
        return client.get("/users/" + username + "/following");
    }

    static async getRequestsReceived(): Promise<FollowerFull[]> {
        return client.get("/users/me/followers/requests/received");
    }

    static async getRequestsSent(): Promise<FollowerFull[]> {
        return client.get("/users/me/followers/requests/sent");
    }

    static async acceptRequest(username: string): Promise<FollowerFull> {
        return client.put("/users/me/followers/requests/received/" + username);
    }

    static async rejectRequest(username: string): Promise<FollowerFull> {
        return client.delete("/users/me/followers/requests/received/" + username);
    }
}
