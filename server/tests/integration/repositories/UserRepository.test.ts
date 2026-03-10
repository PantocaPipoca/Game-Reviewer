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

    it.todo("Inserts and selects a user");

    it.todo("Inserts and updates a user");

    it.todo("Inserts and deletes a user");
});