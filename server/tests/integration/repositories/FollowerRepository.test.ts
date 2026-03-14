import {describe, it, expect} from "@jest/globals";
import {UserRepository} from "../../../src/Repository/UserRepository";
import {FollowerFull, UserFull} from "../../../src/types/Types";
import {FollowerRepository} from '../../../src/Repository/FollowerRepository';
import {AccountService} from '../../../src/services/AccountService';

describe("FollowerRepository (integration)", () => {
    // Auxiliary function, inserts a user
    async function InsertUserAux(): Promise<UserFull> {
        const user: string = `svc_login_${Date.now()}`;
        return await UserRepository.InsertUser({
            accountName: user,
            passwordHash: "hash",
            userData: {displayName: "Repo", gender: null, bio: null},
            isPrivate: false,
            email: `${user}@test.com`
        });
    }

    // Auxiliary function, inserts a follow request
    async function InsertFollowerAux(user1: string, user2: string): Promise<FollowerFull> {
        return await FollowerRepository.InsertFollower({follows: user1, followed: user2, accepted: false});
    }

    // Auxiliary function, accepts a follow request
    async function UpdateFollowerAux(user1: string, user2: string): Promise<FollowerFull> {
        return await FollowerRepository.UpdateFollower({follows: user1, followed: user2, accepted: true});
    }

    // Auxiliary function, removes a follow request
    async function DeleteFollowerAux(user1: string, user2: string): Promise<FollowerFull> {
        return await FollowerRepository.DeleteFollower({follows: user1, followed: user2});
    }

    // Auxiliary function, checks a follower object against expected values
    function CheckFollowerAux(follower: FollowerFull | null, follows: string, followed: string, accepted: boolean): void {
        expect(follower).not.toBeNull();
        expect(follower?.follows).toBe(follows);
        expect(follower?.followed).toBe(followed);
        expect(follower?.accepted).toBe(accepted);
    }

    it("InsertFollower inserts follower, not if duplicate; SelectFollower finds follower", async () => {
        // Creates two private users
        const user1: string = (await InsertUserAux()).accountName;
        const user2: string = (await InsertUserAux()).accountName;
        await AccountService.AlterUser(user1, true);
        await AccountService.AlterUser(user2, true);
        
        // Inserts a follow request
        const f1: FollowerFull = await InsertFollowerAux(user1, user2);
        CheckFollowerAux(f1, user1, user2, false);

        // Finds the follow request
        const f2: FollowerFull | null = await FollowerRepository.SelectFollower({follows: user1, followed: user2});
        CheckFollowerAux(f2, user1, user2, false);

        // Fails, duplicate request
        await expect(InsertFollowerAux(user1, user2)).rejects.toBeDefined();
    });

    it("UpdateFollower accepts follower, not if non-existent", async () => {
        // Creates two private users
        const user1: string = (await InsertUserAux()).accountName;
        const user2: string = (await InsertUserAux()).accountName;
        await AccountService.AlterUser(user1, true);
        await AccountService.AlterUser(user2, true);
        
        // Fails, not yet requested
        await expect(UpdateFollowerAux(user1, user2)).rejects.toBeDefined();

        // Inserts a follow request and updates it
        const f1: FollowerFull | null = await InsertFollowerAux(user1, user2);
        CheckFollowerAux(f1, user1, user2, false);
        const f2: FollowerFull = await UpdateFollowerAux(user1, user2);
        CheckFollowerAux(f2, user1, user2, true);
    });

    it("DeleteFollower removes follower, not if non-existent", async () => {
        // Creates two private users
        const user1: string = (await InsertUserAux()).accountName;
        const user2: string = (await InsertUserAux()).accountName;
        await AccountService.AlterUser(user1, true);
        await AccountService.AlterUser(user2, true);

        // Fails, not yet requested
        await expect(DeleteFollowerAux(user1, user2)).rejects.toBeDefined();

        // Inserts a follow request and deletes it
        await InsertFollowerAux(user1, user2);
        const f1: FollowerFull = await DeleteFollowerAux(user1, user2);
        CheckFollowerAux(f1, user1, user2, false);

        // Inserts another follow request, accepts it and deletes it
        await InsertFollowerAux(user1, user2);
        await UpdateFollowerAux(user1, user2);
        const f2: FollowerFull = await DeleteFollowerAux(user1, user2);
        CheckFollowerAux(f2, user1, user2, true);
    });
});
