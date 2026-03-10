import { describe, it, expect } from "@jest/globals";
import { UserRepository } from "../../../src/Repository/UserRepository";
import { FollowerFull } from "../../../src/types/Types";
import { FollowerRepository } from '../../../src/Repository/FollowerRepository';

describe("FollowerRepository (integration)", () => {
    const user1: string = "user1";
    const user2: string = "user2";

    async function InsertOneUserAux(user: string): Promise<void> {
        await UserRepository.InsertUser({
            accountName: user,
            passwordHash: "hash",
            userData: {displayName: "Repo", gender: null, bio: null},
            isPrivate: false,
            email: `${user}@test.com`
        });
    }

    async function InsertTwoUsersAux(): Promise<void> {
        InsertOneUserAux(user1);
        InsertOneUserAux(user2);
    }

    async function InsertFollowerAux(): Promise<FollowerFull> {
        return await FollowerRepository.InsertFollower({follows: user1, followed: user2, accepted: false});
    }

    async function UpdateFollowerAux(): Promise<FollowerFull> {
        return await FollowerRepository.UpdateFollower({follows: user1, followed: user2, accepted: true});
    }

    async function DeleteFollowerAux(): Promise<FollowerFull> {
        return await FollowerRepository.DeleteFollower({follows: user1, followed: user2});
    }

    it.todo("Inserts and selects follower");

    it.todo("Inserts and accepts follower");

    it.todo("Inserts and removes follower");
});