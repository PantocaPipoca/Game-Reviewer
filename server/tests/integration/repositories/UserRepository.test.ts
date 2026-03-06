import { describe, it, expect } from "@jest/globals";
import { UserRepository } from "../../../src/Repository/UserRepository";
import { UserFull } from "../../../src/types/Types";

// Jest docs: https://jestjs.io/docs/api

describe("UserRepository (integration)", () => {
    const accountName = `repo_user_${Date.now()}`;
    const email = `${accountName}@test.com`;

    async function insert(): Promise<void> {
        await UserRepository.InsertUser({
            accountName,
            passwordHash: "hash",
            userData: {displayName: "Repo", gender: null, bio: null},
            isPrivate: false,
            email
        });
    }

    it("Inserts and selects a user", async () => {
        await insert();

        const found: UserFull | null = await UserRepository.SelectUser(accountName);
        expect(found).not.toBeNull();
        expect(found!.accountName).toBe(accountName);
        expect(found!.email).toBe(email);
    });

    it("Inserts and updates a user", async () => {
        await insert();

        const passwordHash: string = "newhash";
        const newEmail: string = "another@test.com";

        const found: UserFull = await UserRepository.UpdateUser({
            accountName,
            passwordHash,
            userData: {displayName: "Repo", gender: null, bio: null},
            isPrivate: true,
            email: newEmail
        });
        expect(found).not.toBeNull();
        expect(found!.accountName).toBe(accountName);
        expect(found!.passwordHash).toBe(passwordHash);
        expect(found!.isPrivate).toBe(true);
        expect(found!.email).toBe(newEmail);

        const found2: UserFull | null = await UserRepository.SelectUser(accountName)
        expect(found2).not.toBeNull();
        expect(found2!.accountName).toBe(accountName);
        expect(found2!.passwordHash).toBe(passwordHash);
        expect(found2!.isPrivate).toBe(true);
        expect(found2!.email).toBe(newEmail);
    });

    it("Inserts and deletes a user", async () => {
        await insert();

        const found: UserFull = await UserRepository.DeleteUser(accountName);
        expect(found).not.toBeNull();
        expect(found!.accountName).toBe(accountName);
        expect(found!.email).toBe(email);

        const notFound: UserFull | null = await UserRepository.SelectUser(accountName);
        expect(notFound).toBeNull();
    });
});