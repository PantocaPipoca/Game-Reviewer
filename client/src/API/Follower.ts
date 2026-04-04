import CLIENT from "./Client";
import type { FollowerFull } from "./Types";

export class FollowerAPI {
    static async getFollowers(username: string): Promise<FollowerFull[]> {
        return CLIENT.get("/users/" + username + "/followers");
    }

    static async follow(username: string): Promise<FollowerFull> {
        return CLIENT.post("/users/" + username + "/followers");
    }

    static async unfollow(username: string): Promise<FollowerFull> {
        return CLIENT.delete("/users/" + username + "/followers");
    }

    static async getFollowing(username: string): Promise<FollowerFull[]> {
        return CLIENT.get("/users/" + username + "/following");
    }

    static async getRequestsReceived(): Promise<FollowerFull[]> {
        return CLIENT.get("/users/me/followers/requests/received");
    }

    static async getRequestsSent(): Promise<FollowerFull[]> {
        return CLIENT.get("/users/me/followers/requests/sent");
    }

    static async acceptRequest(username: string): Promise<FollowerFull> {
        return CLIENT.put("/users/me/followers/requests/received/" + username);
    }

    static async rejectRequest(username: string): Promise<FollowerFull> {
        return CLIENT.delete("/users/me/followers/requests/received/" + username);
    }

    static async removeFollower(username: string): Promise<FollowerFull> {
        return CLIENT.delete("/users/me/followers/" + username);
    }
}
