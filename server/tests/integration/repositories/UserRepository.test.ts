import { describe, it, expect } from "@jest/globals";
import { UserRepository } from "../../../src/Repository/UserRepository";
import { UserFull, UserShort } from "../../../src/types/Types";
import { AccountService } from "../../../src/services/AccountService";

describe("UserRepository (integration)", () => {
    // Auxiliary function, inserts a user
    async function insertAux(): Promise<UserFull> {
        const accountName: string = `repo_user_${Date.now()}`;
        return await UserRepository.insertUser({
            accountName,
            passwordHash: "hash",
            profilePic: null,
            userData: { displayName: "Repo", gender: null, bio: null },
            isPrivate: false,
            email: `${accountName}@test.com`,
        });
    }

    // Auxiliary function, checks a user's data against expected values
    function checkUserAux(user: UserFull | null, name: string, email: string, pfp: string | null): void {
        expect(user).not.toBeNull();
        expect(user?.accountName).toBe(name);
        expect(user?.email).toBe(email);
        expect(user?.profilePic).toBe(pfp);
    }

    it("Inserts and selects a user", async () => {
        // Inserts user
        const user: UserFull = await insertAux();

        // Checks whether the user exists and checks
        const found: UserFull | null = await UserRepository.selectUser(user.accountName);
        checkUserAux(found, user.accountName, user.email, null);

        // Fails, duplicate user
        await expect(
            UserRepository.insertUser({
                accountName: user.accountName,
                passwordHash: "",
                email: "",
                isPrivate: true,
            } as UserShort)
        ).rejects.toBeDefined();
    });

    it("Inserts and updates a user", async () => {
        // Inserts user
        const user: UserFull = await insertAux();
        const passwordHash: string = "newhash";
        const newEmail: string = "another@test.com";
        const newProfilePic: string = "FAKE PROFILE PIC LINK";

        // Updates user with new data and checks
        const found: UserFull = await UserRepository.updateUser({
            accountName: user.accountName,
            passwordHash,
            profilePic: newProfilePic,
            userData: { displayName: "Repo", gender: null, bio: null },
            isPrivate: true,
            email: newEmail,
        });
        checkUserAux(found, user.accountName, newEmail, newProfilePic);
        expect(found.passwordHash).toBe(passwordHash);
        expect(found.isPrivate).toBe(true);

        // Checks if the same is true for the result of selectUser
        const found2: UserFull | null = await UserRepository.selectUser(user.accountName);
        checkUserAux(found2, user.accountName, newEmail, newProfilePic);
        expect(found2?.passwordHash).toBe(passwordHash);
        expect(found2?.isPrivate).toBe(true);
    });

    it("Inserts and deletes a user", async () => {
        // Inserts user
        const user: UserFull = await insertAux();
        const newProfilePic: string = "FAKE PROFILE PIC LINK";
        await AccountService.alterUser(
            user.accountName,
            true,
            user.email,
            { displayName: "name", gender: null, bio: null },
            undefined,
            newProfilePic
        );

        // Deletes user and checks if the data matches the old
        const found: UserFull = await UserRepository.deleteUser(user.accountName);
        checkUserAux(found, user.accountName, user.email, newProfilePic);

        // Checks whether the user doesn't exist
        const notFound: UserFull | null = await UserRepository.selectUser(user.accountName);
        expect(notFound).toBeNull();
    });
});
