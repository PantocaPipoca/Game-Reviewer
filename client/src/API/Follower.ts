import CLIENT from "./Client";
import type { FollowerPublic } from "./Types";

export class FollowerAPI {
    static async getFollowers(username: string): Promise<FollowerPublic[]> {
        return CLIENT.get("/users/id/" + username + "/followers");
    }
    static async follow(username: string): Promise<FollowerPublic> {
        return CLIENT.post("/users/id/" + username + "/followers");
    }
    static async unfollow(username: string): Promise<FollowerPublic> {
        return CLIENT.delete("/users/id/" + username + "/followers");
    }
    static async getFollowing(username: string): Promise<FollowerPublic[]> {
        return CLIENT.get("/users/id/" + username + "/following");
    }
    static async getRequestsReceived(): Promise<FollowerPublic[]> {
        return CLIENT.get("/users/me/followers/requests/received");
    }

    static async getRequestsSent(): Promise<FollowerPublic[]> {
        return CLIENT.get("/users/me/followers/requests/sent");
    }

    static async acceptRequest(username: string): Promise<FollowerPublic> {
        return CLIENT.put("/users/me/followers/requests/received/" + username);
    }

    static async rejectRequest(username: string): Promise<FollowerPublic> {
        return CLIENT.delete("/users/me/followers/requests/received/" + username);
    }

    static async removeFollower(username: string): Promise<FollowerPublic> {
        return CLIENT.delete("/users/me/followers/" + username);
    }
}
