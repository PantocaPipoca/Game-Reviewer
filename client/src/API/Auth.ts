import { UserAPI } from "./User";

export async function isAuthenticated(): Promise<boolean> {
    try {
        await UserAPI.getMe();
        return true;
    } catch {
        return false;
    }
}
