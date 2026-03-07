import client from "./Client";
import type { AuthResponse, UserPublic } from "./Types";

export class UserAPI {
    static async register(data: {
        accountName: string;
        displayName: string;
        password: string;
        email: string;
    }): Promise<AuthResponse> {
        return client.post("/users", data);
    }

    static async login(data: {accountName: string; password: string;}): Promise<AuthResponse> {
        return client.post("/users/login", data);
    }

    static async getMe(): Promise<UserPublic>{
        return client.get("/users/me");
    }

    static async updateMe(data: {
        isPrivate?: boolean;
        password?: string;
        email?: string;
        userData?: object;
    }): Promise<UserPublic> {
        return client.put("/users/me", data);
    }

    static async deleteMe(): Promise<UserPublic> {
        return client.delete("/users/me");
    }

    static async search(query: string): Promise<UserPublic[]> {
        return client.get("/users/search", { params: { query } });
    }

    static async getByUsername(username: string): Promise<UserPublic>{
        return client.get("/users/" + username);
    }
};