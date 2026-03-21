import CLIENT from "./Client";
import type { AuthResponse, UserPublic } from "./Types";

export class UserAPI {
    static async register(data: {
        accountName: string;
        displayName: string;
        password: string;
        email: string;
    }): Promise<AuthResponse> {
        const response = (await CLIENT.post("/users", data)) as AuthResponse;
        return response;
    }

    static async login(data: { accountName: string; password: string }): Promise<AuthResponse> {
        const response = (await CLIENT.post("/users/login", data)) as AuthResponse;
        return response;
    }

    static async logout(): Promise<void> {
        await CLIENT.post("/users/logout");
    }

    static async getMe(): Promise<UserPublic> {
        return CLIENT.get("/users/me");
    }

    static async updateMe(data: {
        isPrivate?: boolean;
        password?: string;
        email?: string;
        userData?: object;
    }): Promise<UserPublic> {
        return CLIENT.put("/users/me", data);
    }

    static async deleteMe(): Promise<UserPublic> {
        return CLIENT.delete("/users/me");
    }

    static async search(query: string): Promise<UserPublic[]> {
        return CLIENT.get("/users/search", { params: { query } });
    }

    static async getByUsername(username: string): Promise<UserPublic> {
        return CLIENT.get("/users/" + username);
    }
}
