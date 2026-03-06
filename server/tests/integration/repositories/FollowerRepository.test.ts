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

    it("Inserts and selects follower", async () => {
        await InsertTwoUsersAux();
        
        const f1: FollowerFull = await InsertFollowerAux();
        expect(f1).not.toBeNull();
        expect(f1.follows).toBe(user1);
        expect(f1.followed).toBe(user2);

        const f2: FollowerFull | null = await FollowerRepository.SelectFollower({follows: user1, followed: user2});
        expect(f2).not.toBeNull();
        expect(f2!.follows).toBe(user1);
        expect(f2!.followed).toBe(user2);
    });

    it("Inserts and accepts follower", async () => {
        await InsertTwoUsersAux();
        
        const f1: FollowerFull = await UpdateFollowerAux();
        expect(f1).toBeNull();

        await InsertFollowerAux();
        const f2: FollowerFull = await UpdateFollowerAux();
        expect(f2).not.toBeNull();
        expect(f2!.accepted).toBe(true);
    });

    it("Inserts and removes follower", async () => {
        await InsertTwoUsersAux();

        const f1: FollowerFull = await DeleteFollowerAux();
        expect(f1).toBeNull();

        await InsertFollowerAux();
        const f2: FollowerFull = await DeleteFollowerAux();
        expect(f2).not.toBeNull();
        expect(f2!.accepted).toBe(false);

        await InsertFollowerAux();
        await UpdateFollowerAux();
        const f3: FollowerFull = await DeleteFollowerAux();
        expect(f3).not.toBeNull();
        expect(f3!.accepted).toBe(true);
    });
});