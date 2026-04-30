import CLIENT from "./Client";
import type { AuthResponse, UserMe, UserPublic } from "./Types";

export class UserAPI {
    static async register(data: {
        accountName: string;
        displayName: string;
        password: string;
        email: string;
    }): Promise<string | AuthResponse> {
        const response = (await CLIENT.post("/users", data)) as string | AuthResponse;
        return response;
    }

    static async login(data: { accountName: string; password: string }): Promise<AuthResponse> {
        const response = (await CLIENT.post("/users/login", data)) as AuthResponse;
        return response;
    }

    static async logout(): Promise<void> {
        await CLIENT.post("/users/logout");
    }

    static async getMe(): Promise<UserMe> {
        return CLIENT.get("/users/me");
    }

    static async updateMe(data: {
        isPrivate: boolean;
        email: string;
        userData: { displayName: string; gender: string; bio: string };
        password?: string;
    }): Promise<UserPublic> {
        return CLIENT.put("/users/me", data);
    }

    static async deleteMe(): Promise<UserPublic> {
        return CLIENT.delete("/users/me");
    }

    static async search(query: string, offset?: number, limit?: number): Promise<UserPublic[]> {
        return CLIENT.get("/users/search", { params: { query, offset, limit } });
    }

    static async getByUsername(username: string): Promise<UserPublic> {
        return CLIENT.get("/users/id/" + username);
    }

    // accepts any file object from an <input type="file">
    static async uploadAvatar(file: File): Promise<{ url: string }> {
        const formData = new FormData();
        formData.append("avatar", file);
        return CLIENT.put("/users/me/avatar", formData, {
            headers: { "Content-Type": undefined },
        });
    }
}
