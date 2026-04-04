import { describe, it, expect } from "@jest/globals";
import { UserRepository } from "../../../src/Repository/UserRepository";
import { FollowerFull, UserFull } from "../../../src/types/Types";
import { FollowerRepository } from "../../../src/Repository/FollowerRepository";
import { AccountService } from "../../../src/services/AccountService";

describe("FollowerRepository (integration)", () => {
    // Auxiliary function, inserts a user
    async function insertUserAux(): Promise<UserFull> {
        const user: string = `svc_login_${Date.now()}`;
        return await UserRepository.insertUser({
            accountName: user,
            passwordHash: "hash",
            profilePic: null,
            userData: { displayName: "Repo", gender: null, bio: null },
            isPrivate: false,
            email: `${user}@test.com`,
        });
    }

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
        const user1: string = (await insertUserAux()).accountName;
        const user2: string = (await insertUserAux()).accountName;
        await AccountService.alterUser(user1, true, "email@email.com", { displayName: "name", gender: null, bio: null });
        await AccountService.alterUser(user2, true, "email2@email.com", { displayName: "name2", gender: null, bio: null });

        // Inserts a follow request
        const f1: FollowerFull = await insertFollowerAux(user1, user2);
        checkFollowerAux(f1, user1, user2, false);

        // Finds the follow request
        const f2: FollowerFull | null = await FollowerRepository.selectFollower({ follows: user1, followed: user2 });
        checkFollowerAux(f2, user1, user2, false);

        // Fails, duplicate request
        await expect(insertFollowerAux(user1, user2)).rejects.toBeDefined();
    });

    it("UpdateFollower accepts follower, not if non-existent", async () => {
        // Creates two private users
        const user1: string = (await insertUserAux()).accountName;
        const user2: string = (await insertUserAux()).accountName;
        await AccountService.alterUser(user1, true, "email@email.com", { displayName: "name", gender: null, bio: null });
        await AccountService.alterUser(user2, true, "email2@email.com", { displayName: "name2", gender: null, bio: null });

        // Fails, not yet requested
        await expect(updateFollowerAux(user1, user2)).rejects.toBeDefined();

        // Inserts a follow request and updates it
        const f1: FollowerFull | null = await insertFollowerAux(user1, user2);
        checkFollowerAux(f1, user1, user2, false);
        const f2: FollowerFull = await updateFollowerAux(user1, user2);
        checkFollowerAux(f2, user1, user2, true);
    });

    it("DeleteFollower removes follower, not if non-existent", async () => {
        // Creates two private users
        const user1: string = (await insertUserAux()).accountName;
        const user2: string = (await insertUserAux()).accountName;
        
        await AccountService.alterUser(user1, true, "email@email.com", { displayName: "name", gender: null, bio: null });
        await AccountService.alterUser(user2, true, "email2@email.com", { displayName: "name2", gender: null, bio: null });


        // Fails, not yet requested
        await expect(deleteFollowerAux(user1, user2)).rejects.toBeDefined();

        // Inserts a follow request and deletes it
        await insertFollowerAux(user1, user2);
        const f1: FollowerFull = await deleteFollowerAux(user1, user2);
        checkFollowerAux(f1, user1, user2, false);

        // Inserts another follow request, accepts it and deletes it
        await insertFollowerAux(user1, user2);
        await updateFollowerAux(user1, user2);
        const f2: FollowerFull = await deleteFollowerAux(user1, user2);
        checkFollowerAux(f2, user1, user2, true);
    });
});
