import {describe, it, expect} from "@jest/globals";
import {FollowerFull} from "../../../src/types/Types";
import {FollowerService} from '../../../src/services/FollowerService';
import {AccountService} from "../../../src/services/AccountService";
import {MakeSomeUser, UserMicro} from "../helper/helper";

describe("FollowerService (integration)", () => {
    // Auxiliary interface, contains the username and email of two users
    interface UserMicroPair {
        user1: UserMicro; user2: UserMicro;
    }

    // Auxiliary function, creates two private users, registers them and returns their usernames and emails
    async function RegisterUsersAux(): Promise<UserMicroPair> {
        const user1: UserMicro = MakeSomeUser();
        await AccountService.RegisterUser(user1.accountName, "USER1", "12345678", user1.email);
        await AccountService.AlterUser(user1.accountName, true);
        const user2: UserMicro = MakeSomeUser();
        await AccountService.RegisterUser(user2.accountName, "USER2", "87654321", user2.email);
        await AccountService.AlterUser(user2.accountName, true);
        return {user1, user2} as UserMicroPair;
    }

    // Auxiliary function, requests follower
    async function RequestFollowerAux(us1: string, us2: string): Promise<FollowerFull> {
        return await FollowerService.RequestFollower(us1, us2);
    }

    // Auxiliary function, accepts follower
    async function AcceptFollowerAux(us1: string, us2: string): Promise<FollowerFull> {
        return await FollowerService.AcceptFollower(us1, us2);
    }

    // Auxiliary function, removes follower
    async function RemoveFollowerAux(us1: string, us2: string): Promise<FollowerFull> {
        return await FollowerService.RemoveFollower(us1, us2);
    }

    // Auxiliary function, checks a follower pair against expected values
    function CheckFollowerAux(response: FollowerFull, follows: string, followed: string, accepted: boolean): void {
        expect(response).not.toBeNull();
        expect(response.follows).toBe(follows);
        expect(response.followed).toBe(followed);
        expect(response.accepted).toBe(accepted);
    }

    it("RequestFollower requests a follow, doesn't make duplicates or between the same user", async () => {
        // Register two users
        const pair: UserMicroPair = await RegisterUsersAux();
        const us1: string = pair.user1.accountName;
        const us2: string = pair.user2.accountName;

        // Check if the data from the database matches expectations
        const response: FollowerFull = await RequestFollowerAux(us1, us2);
        CheckFollowerAux(response, us1, us2, false);
        
        // Fails, already requested
        await expect(RequestFollowerAux(us1, us2)).rejects.toBeDefined();
        // Fails, follow request between user and self
        await expect(RequestFollowerAux(us1, us1)).rejects.toBeDefined();
    });

    it("AcceptFollower accepts a follow request, not if it doesn't exist or was already accepted", async () => {
        // Register two users
        const pair: UserMicroPair = await RegisterUsersAux();
        const us1: string = pair.user1.accountName;
        const us2: string = pair.user2.accountName;

        // Fails, not yet requested
        await expect(AcceptFollowerAux(us1, us2)).rejects.toBeDefined();

        // Request and accept
        await RequestFollowerAux(us1, us2);
        const response: FollowerFull = await AcceptFollowerAux(us2, us1);
        CheckFollowerAux(response, us1, us2, true);

        // Fails, already accepted
        await expect(AcceptFollowerAux(us2, us1)).rejects.toBeDefined();
    });

    it("RemoveFollower removes a follower, not if they didn't follow", async () => {
        // Register two users
        const pair: UserMicroPair = await RegisterUsersAux();
        const us1: string = pair.user1.accountName;
        const us2: string = pair.user2.accountName;

        // Fails, not requested
        await expect(RemoveFollowerAux(us1, us2)).rejects.toBeDefined();

        // Request and remove
        await RequestFollowerAux(us1, us2);
        const res1: FollowerFull = await RemoveFollowerAux(us1, us2);
        CheckFollowerAux(res1, us1, us2, false);

        // Request, accept and remove
        await RequestFollowerAux(us1, us2);
        await AcceptFollowerAux(us2, us1);
        const res2: FollowerFull = await RemoveFollowerAux(us1, us2);
        CheckFollowerAux(res2, us1, us2, true);
    });

    it("GetFollowers and GetPendingRequestsToUser correctly identify a user's followers and pending requests, respectively",
            async () => {
        // Register a target user
        const user: UserMicro = MakeSomeUser();
        const us1: string = user.accountName;
        await AccountService.RegisterUser(us1, "USER1", "12345678", user.email);
        // Make target user private
        await AccountService.AlterUser(us1, true);

        // Registers a number of users to follow the target user
        const followers: string[] = [];
        for (var i = 0; i < 8; i++) {
            const f: UserMicro = MakeSomeUser();
            followers.push(f.accountName);
            await AccountService.RegisterUser(f.accountName, "FOLLOWER" + i, "12345678", f.email);
            await FollowerService.RequestFollower(f.accountName, us1);
            await FollowerService.AcceptFollower(us1, f.accountName);
        }

        // Registers a number of users to request to follow the target user
        const requests: string[] = [];
        for (var i = 0; i < 6; i++) {
            const d: UserMicro = MakeSomeUser();
            requests.push(d.accountName);
            await AccountService.RegisterUser(d.accountName, "DUMMY" + i, "12345678", d.email);
            await FollowerService.RequestFollower(d.accountName, us1);
        }

        // Checks if the users in the first array follow the target user
        const response1: string[] = (await FollowerService.GetFollowers(us1, us1)).map(x => x.follows);
        expect(response1).not.toBeNull();
        expect(response1.length).toBe(followers.length);
        followers.forEach(f => expect(response1.includes(f)).toBe(true));
        requests.forEach(d => expect(response1.includes(d)).toBe(false));

        // Checks if the users in the second array requested to follow the target user without acceptange
        const response2: string[] = (await FollowerService.GetPendingRequestsToUser(us1)).map(x => x.follows);
        expect(response2).not.toBeNull();
        expect(response2.length).toBe(requests.length);
        followers.forEach(f => expect(response2.includes(f)).toBe(false));
        requests.forEach(d => expect(response2.includes(d)).toBe(true));
    });

    it("GetFollowed and GetPendingRequestsFromUser correctly identify who a user follows and asked to follow them, respectively",
            async () => {
        // Registers a target user
        const user: UserMicro = MakeSomeUser();
        const us1: string = user.accountName;
        await AccountService.RegisterUser(us1, "USER1", "12345678", "us1@test.com");

        // Registers a number of (private) users for the target user to follow
        const followed: string[] = [];
        for (var i = 0; i < 7; i++) {
            const f: UserMicro = MakeSomeUser();
            followed.push(f.accountName);
            await AccountService.RegisterUser(f.accountName, "FOLLOWED" + i, "12345678", f.email);
            await AccountService.AlterUser(f.accountName, true);
            await FollowerService.RequestFollower(us1, f.accountName);
            await FollowerService.AcceptFollower(f.accountName, us1);
        }
        
        // Registers a number of (private) users for the target user to follow request
        const requests: string[] = [];
        for (var i = 0; i < 5; i++) {
            const d: UserMicro = MakeSomeUser();
            requests.push(d.accountName);
            await AccountService.RegisterUser(d.accountName, "DUMMY" + i, "12345678", d.email);
            await AccountService.AlterUser(d.accountName, true);
            await FollowerService.RequestFollower(us1, d.accountName);
        }

        // Checks if the target user follows the users in the first array
        const response1: string[] = (await FollowerService.GetFollowing(us1, us1)).map(x => x.followed);
        expect(response1).not.toBeNull();
        expect(response1.length).toBe(followed.length);
        followed.forEach(f => expect(response1.includes(f)).toBe(true));
        requests.forEach(d => expect(response1.includes(d)).toBe(false));

        // Checks if the target user requested to follow the users in the second array without acceptance
        const response2: string[] = (await FollowerService.GetPendingRequestsFromUser(us1)).map(x => x.followed);
        expect(response2).not.toBeNull();
        expect(response2.length).toBe(requests.length);
        followed.forEach(f => expect(response2.includes(f)).toBe(false));
        requests.forEach(d => expect(response2.includes(d)).toBe(true));
    });
});
