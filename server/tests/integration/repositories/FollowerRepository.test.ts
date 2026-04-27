import { describe, it, expect } from "@jest/globals";
import { UserRepository } from "../../../src/Repository/UserRepository";
import { FollowerFull, UserFull } from "../../../src/types/Types";
import { FollowerRepository } from "../../../src/Repository/FollowerRepository";

describe("FollowerRepository (integration)", () => {
    // Auxiliary function, inserts a follow request
    async function insertFollowerAux(user1: string, user2: string): Promise<FollowerFull> {
        return await FollowerRepository.insertFollower({ follows: user1, followed: user2, accepted: false });
    }

    // Auxiliary function, accepts a follow request
    async function updateFollowerAux(user1: string, user2: string): Promise<FollowerFull> {
        return await FollowerRepository.updateFollower({ follows: user1, followed: user2, accepted: true });
    }

    // Auxiliary function, removes a follow request
    async function deleteFollowerAux(user1: string, user2: string): Promise<FollowerFull> {
        return await FollowerRepository.deleteFollower({ follows: user1, followed: user2 });
    }

    // Auxiliary function, checks a follower object against expected values
    function checkFollowerAux(
        follower: FollowerFull | null,
        follows: string,
        followed: string,
        accepted: boolean
    ): void {
        expect(follower).not.toBeNull();
        expect(follower?.follows).toBe(follows);
        expect(follower?.followed).toBe(followed);
        expect(follower?.accepted).toBe(accepted);
    }

    it("InsertFollower inserts follower, not if duplicate; SelectFollower finds follower", async () => {
        // Creates two private users
        const user1: UserFull = await UserRepository.insertUser({
            accountName: "test1",
            passwordHash: "test",
            avatar: null,
            userData: {},
            isPrivate: true,
            email: "email1@test.com",
        });

        const user2: UserFull = await UserRepository.insertUser({
            accountName: "test2",
            passwordHash: "test",
            avatar: null,
            userData: {},
            isPrivate: true,
            email: "email2@test.com",
        });

        // Inserts a follow request
        const f1: FollowerFull = await insertFollowerAux(user1.accountName, user2.accountName);
        checkFollowerAux(f1, user1.accountName, user2.accountName, false);

        // Finds the follow request
        const f2: FollowerFull | null = await FollowerRepository.selectFollower({
            follows: user1.accountName,
            followed: user2.accountName,
        });
        checkFollowerAux(f2, user1.accountName, user2.accountName, false);

        // Fails, duplicate request
        await expect(insertFollowerAux(user1.accountName, user2.accountName)).rejects.toBeDefined();
    });

    it("UpdateFollower accepts follower, not if non-existent", async () => {
        // Creates two private users
        const user1: UserFull = await UserRepository.insertUser({
            accountName: "test1",
            passwordHash: "test",
            avatar: null,
            userData: {},
            isPrivate: true,
            email: "email1@test.com",
        });

        const user2: UserFull = await UserRepository.insertUser({
            accountName: "test2",
            passwordHash: "test",
            avatar: null,
            userData: {},
            isPrivate: true,
            email: "email2@test.com",
        });

        // Fails, not yet requested
        await expect(updateFollowerAux(user1.accountName, user2.accountName)).rejects.toBeDefined();

        // Inserts a follow request and updates it
        const f1: FollowerFull | null = await insertFollowerAux(user1.accountName, user2.accountName);
        checkFollowerAux(f1, user1.accountName, user2.accountName, false);
        const f2: FollowerFull = await updateFollowerAux(user1.accountName, user2.accountName);
        checkFollowerAux(f2, user1.accountName, user2.accountName, true);
    });

    it("DeleteFollower removes follower, not if non-existent", async () => {
        // Creates two private users
        const user1: UserFull = await UserRepository.insertUser({
            accountName: "test1",
            passwordHash: "test",
            avatar: null,
            userData: {},
            isPrivate: true,
            email: "email1@test.com",
        });

        const user2: UserFull = await UserRepository.insertUser({
            accountName: "test2",
            passwordHash: "test",
            avatar: null,
            userData: {},
            isPrivate: true,
            email: "email2@test.com",
        });

        // Fails, not yet requested
        await expect(deleteFollowerAux(user1.accountName, user2.accountName)).rejects.toBeDefined();

        // Inserts a follow request and deletes it
        await insertFollowerAux(user1.accountName, user2.accountName);
        const f1: FollowerFull = await deleteFollowerAux(user1.accountName, user2.accountName);
        checkFollowerAux(f1, user1.accountName, user2.accountName, false);

        // Inserts another follow request, accepts it and deletes it
        await insertFollowerAux(user1.accountName, user2.accountName);
        await updateFollowerAux(user1.accountName, user2.accountName);
        const f2: FollowerFull = await deleteFollowerAux(user1.accountName, user2.accountName);
        checkFollowerAux(f2, user1.accountName, user2.accountName, true);
    });
});
