import { describe, it, expect, afterAll } from "@jest/globals";
import { UserRepository } from "../../../src/Repository/UserRepository";

// Jest docs: https://jestjs.io/docs/api

describe("UserRepository (integration)", () => {
    const accountName = `repo_user_${Date.now()}`;
    const email = `${accountName}@test.com`;

    it("inserts and selects a user", async () => {
        await UserRepository.InsertUser({
        accountName,
        passwordHash: "hash",
        userData: { displayName: "Repo", gender: null, bio: null },
        isPrivate: false,
        email
        });

        const found = await UserRepository.SelectUser(accountName);
        expect(found).not.toBeNull();
        expect(found!.accountName).toBe(accountName);
        expect(found!.email).toBe(email);
    });
});