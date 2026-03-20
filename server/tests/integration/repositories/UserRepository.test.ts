import {describe, it, expect} from "@jest/globals";
import {UserRepository} from "../../../src/Repository/UserRepository";
import {UserFull, UserShort} from "../../../src/types/Types";
import {AccountService} from '../../../src/services/AccountService';

describe("UserRepository (integration)", () => {
    // Auxiliary function, inserts a user
    async function InsertAux(): Promise<UserFull> {
        const accountName: string = `repo_user_${Date.now()}`;
        return await UserRepository.InsertUser({
            accountName,
            passwordHash: "hash",
            profilePic: null,
            userData: {displayName: "Repo", gender: null, bio: null},
            isPrivate: false,
            email: `${accountName}@test.com`
        });
    }

    // Auxiliary function, checks a user's data against expected values
    function CheckUserAux(user: UserFull | null, name: string, email: string, pfp: string | null): void {
        expect(user).not.toBeNull();
        expect(user?.accountName).toBe(name);
        expect(user?.email).toBe(email);
        expect(user?.profilePic).toBe(pfp);
    }

    it("Inserts and selects a user", async () => {
        // Inserts user
        const user: UserFull = await InsertAux();

        // Checks whether the user exists and checks
        const found: UserFull | null = await UserRepository.SelectUser(user.accountName);
        CheckUserAux(found, user.accountName, user.email, null);

        // Fails, duplicate user
        await expect(UserRepository.InsertUser({accountName: user.accountName,
            passwordHash: "", email: "", isPrivate: true} as UserShort)).rejects.toBeDefined();
    });

    it("Inserts and updates a user", async () => {
        // Inserts user
        const user: UserFull = await InsertAux();
        const passwordHash: string = "newhash";
        const newEmail: string = "another@test.com";
        const newProfilePic: string = "FAKE PROFILE PIC LINK";

        // Updates user with new data and checks
        const found: UserFull = await UserRepository.UpdateUser({
            accountName: user.accountName,
            passwordHash,
            profilePic: newProfilePic,
            userData: {displayName: "Repo", gender: null, bio: null},
            isPrivate: true,
            email: newEmail
        });
        CheckUserAux(found, user.accountName, newEmail, newProfilePic);
        expect(found.passwordHash).toBe(passwordHash);
        expect(found.isPrivate).toBe(true);

        // Checks if the same is true for the result of SelectUser
        const found2: UserFull | null = await UserRepository.SelectUser(user.accountName);
        CheckUserAux(found2, user.accountName, newEmail, newProfilePic);
        expect(found2?.passwordHash).toBe(passwordHash);
        expect(found2?.isPrivate).toBe(true);
    });

    it("Inserts and deletes a user", async () => {
        // Inserts user
        const user: UserFull = await InsertAux();
        const newProfilePic: string = "FAKE PROFILE PIC LINK";
        await AccountService.AlterUser(user.accountName, newProfilePic);

        // Deletes user and checks if the data matches the old
        const found: UserFull = await UserRepository.DeleteUser(user.accountName);
        CheckUserAux(found, user.accountName, user.email, newProfilePic);

        // Checks whether the user doesn't exist
        const notFound: UserFull | null = await UserRepository.SelectUser(user.accountName);
        expect(notFound).toBeNull();
    });
});
