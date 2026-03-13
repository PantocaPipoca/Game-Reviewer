import {describe, it, expect} from "@jest/globals";
import {UserRepository} from "../../../src/Repository/UserRepository";
import {UserFull, UserShort} from "../../../src/types/Types";

describe("UserRepository (integration)", () => {
    // Auxiliary function, inserts a user
    async function InsertAux(): Promise<UserFull> {
        const accountName: string = `repo_user_${Date.now()}`;
        return await UserRepository.InsertUser({
            accountName,
            passwordHash: "hash",
            userData: {displayName: "Repo", gender: null, bio: null},
            isPrivate: false,
            email: `${accountName}@test.com`
        });
    }

    // Auxiliary function, checks a user's data against expected values
    function CheckUserAux(user: UserFull | null, name: string, email: string): void {
        expect(user).not.toBeNull();
        expect(user?.accountName).toBe(name);
        expect(user?.email).toBe(email);
    }

    it("Inserts and selects a user", async () => {
        // Inserts user
        const user: UserFull = await InsertAux();

        // Checks whether the user exists and checks
        const found: UserFull | null = await UserRepository.SelectUser(user.accountName);
        CheckUserAux(found, user.accountName, user.email);

        // Fails, duplicate user
        await expect(UserRepository.InsertUser({accountName: user.accountName,
            passwordHash: "", email: "", isPrivate: true} as UserShort)).rejects.toBeDefined();
    });

    it("Inserts and updates a user", async () => {
        // Inserts user
        const user: UserFull = await InsertAux();
        const passwordHash: string = "newhash";
        const newEmail: string = "another@test.com";

        // Updates user with new data and checks
        const found: UserFull = await UserRepository.UpdateUser({
            accountName: user.accountName,
            passwordHash,
            userData: {displayName: "Repo", gender: null, bio: null},
            isPrivate: true,
            email: newEmail
        });
        CheckUserAux(found, user.accountName, newEmail);
        expect(found.passwordHash).toBe(passwordHash);
        expect(found.isPrivate).toBe(true);

        // Checks if the same is true for the result of SelectUser
        const found2: UserFull | null = await UserRepository.SelectUser(user.accountName);
        CheckUserAux(found2, user.accountName, newEmail);
        expect(found2?.passwordHash).toBe(passwordHash);
        expect(found2?.isPrivate).toBe(true);
    });

    it("Inserts and deletes a user", async () => {
        // Inserts user
        const user: UserFull = await InsertAux();

        // Deletes user and checks if the data matches the old
        const found: UserFull = await UserRepository.DeleteUser(user.accountName);
        CheckUserAux(found, user.accountName, user.email);

        // Checks whether the user doesn't exist
        const notFound: UserFull | null = await UserRepository.SelectUser(user.accountName);
        expect(notFound).toBeNull();
    });
});
