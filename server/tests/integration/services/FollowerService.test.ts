import { describe, it, expect } from "@jest/globals";
import { FollowerFull } from "../../../src/types/Types";
import { FollowerService } from "../../../src/services/FollowerService";
import { AccountService } from "../../../src/services/AccountService";
import { makeSomeUser, UserMicro } from "../helper/helper";

describe("FollowerService (integration)", () => {
    // Auxiliary interface, contains the username and email of two users
    interface UserMicroPair {
        user1: UserMicro;
        user2: UserMicro;
    }

    // Auxiliary function, creates two private users, registers them and returns their usernames and emails
    async function registerUsersAux(): Promise<UserMicroPair> {
        const user1: UserMicro = makeSomeUser();
        await AccountService.registerUser(user1.accountName, "USER1", "12345678", user1.email);
        await AccountService.alterUser(user1.accountName, true, user1.email, {
            displayName: "name",
            gender: null,
            bio: null,
        });

        const user2: UserMicro = makeSomeUser();
        await AccountService.registerUser(user2.accountName, "USER2", "87654321", user2.email);
        await AccountService.alterUser(user2.accountName, true, user2.email, {
            displayName: "name2",
            gender: null,
            bio: null,
        });

        return { user1, user2 } as UserMicroPair;
    }

    // Auxiliary function, requests follower
    async function requestFollowerAux(us1: string, us2: string): Promise<FollowerFull> {
        return await FollowerService.requestFollower(us1, us2);
    }

    // Auxiliary function, accepts follower
    async function acceptFollowerAux(us1: string, us2: string): Promise<FollowerFull> {
        return await FollowerService.acceptFollower(us1, us2);
    }

    // Auxiliary function, removes follower
    async function removeFollowerAux(us1: string, us2: string): Promise<FollowerFull> {
        return await FollowerService.removeFollower(us1, us2);
    }

    // Auxiliary function, checks a follower pair against expected values
    function checkFollowerAux(response: FollowerFull, follows: string, followed: string, accepted: boolean): void {
        expect(response).not.toBeNull();
        expect(response.follows).toBe(follows);
        expect(response.followed).toBe(followed);
        expect(response.accepted).toBe(accepted);
    }

    it("RequestFollower requests a follow, doesn't make duplicates or between the same user", async () => {
        // Register two users
        const pair: UserMicroPair = await registerUsersAux();
        const us1: string = pair.user1.accountName;
        const us2: string = pair.user2.accountName;

        // Check if the data from the database matches expectations
        const response: FollowerFull = await requestFollowerAux(us1, us2);
        checkFollowerAux(response, us1, us2, false);

        // Fails, already requested
        await expect(requestFollowerAux(us1, us2)).rejects.toBeDefined();
        // Fails, follow request between user and self
        await expect(requestFollowerAux(us1, us1)).rejects.toBeDefined();
    });

    it("AcceptFollower accepts a follow request, not if it doesn't exist or was already accepted", async () => {
        // Register two users
        const pair: UserMicroPair = await registerUsersAux();
        const us1: string = pair.user1.accountName;
        const us2: string = pair.user2.accountName;

        // Fails, not yet requested
        await expect(acceptFollowerAux(us1, us2)).rejects.toBeDefined();

        // Request and accept
        await requestFollowerAux(us1, us2);
        const response: FollowerFull = await acceptFollowerAux(us2, us1);
        checkFollowerAux(response, us1, us2, true);

        // Fails, already accepted
        await expect(acceptFollowerAux(us2, us1)).rejects.toBeDefined();
    });

    it("RemoveFollower removes a follower, not if they didn't follow", async () => {
        // Register two users
        const pair: UserMicroPair = await registerUsersAux();
        const us1: string = pair.user1.accountName;
        const us2: string = pair.user2.accountName;

        // Fails, not requested
        await expect(removeFollowerAux(us1, us2)).rejects.toBeDefined();

        // Request and remove
        await requestFollowerAux(us1, us2);
        const res1: FollowerFull = await removeFollowerAux(us1, us2);
        checkFollowerAux(res1, us1, us2, false);

        // Request, accept and remove
        await requestFollowerAux(us1, us2);
        await acceptFollowerAux(us2, us1);
        const res2: FollowerFull = await removeFollowerAux(us1, us2);
        checkFollowerAux(res2, us1, us2, true);
    });

    it("GetFollowers and GetPendingRequestsToUser correctly identify a user's followers and pending requests, respectively", async () => {
        // Register a target user
        const user: UserMicro = makeSomeUser();
        const us1: string = user.accountName;
        await AccountService.registerUser(us1, "USER1", "12345678", user.email);
        // Make target user private
        await AccountService.alterUser(us1, true, "1234email@email.com", {
            displayName: "USER1",
            gender: null,
            bio: null,
        });

        // Registers a number of users to follow the target user
        const followers: string[] = [];
        for (var i = 0; i < 8; i++) {
            const f: UserMicro = makeSomeUser();
            followers.push(f.accountName);
            await AccountService.registerUser(f.accountName, "FOLLOWER" + i, "12345678", f.email);
            await FollowerService.requestFollower(f.accountName, us1);
            await FollowerService.acceptFollower(us1, f.accountName);
        }

        // Registers a number of users to request to follow the target user
        const requests: string[] = [];
        for (var i = 0; i < 6; i++) {
            const d: UserMicro = makeSomeUser();
            requests.push(d.accountName);
            await AccountService.registerUser(d.accountName, "DUMMY" + i, "12345678", d.email);
            await FollowerService.requestFollower(d.accountName, us1);
        }

        // Checks if the users in the first array follow the target user
        const response1: string[] = (await FollowerService.getFollowers(us1, us1)).map((x) => x.follows);
        expect(response1).not.toBeNull();
        expect(response1.length).toBe(followers.length);
        followers.forEach((f) => expect(response1.includes(f)).toBe(true));
        requests.forEach((d) => expect(response1.includes(d)).toBe(false));

        // Checks if the users in the second array requested to follow the target user without acceptange
        const response2: string[] = (await FollowerService.getPendingRequestsToUser(us1)).map((x) => x.follows);
        expect(response2).not.toBeNull();
        expect(response2.length).toBe(requests.length);
        followers.forEach((f) => expect(response2.includes(f)).toBe(false));
        requests.forEach((d) => expect(response2.includes(d)).toBe(true));
    });

    it("GetFollowed and GetPendingRequestsFromUser correctly identify who a user follows and asked to follow them, respectively", async () => {
        // Registers a target user
        const user: UserMicro = makeSomeUser();
        const us1: string = user.accountName;
        await AccountService.registerUser(us1, "USER1", "12345678", "us1@test.com");

        // Registers a number of (private) users for the target user to follow
        const followed: string[] = [];
        for (var i = 0; i < 7; i++) {
            const f: UserMicro = makeSomeUser();
            followed.push(f.accountName);
            await AccountService.registerUser(f.accountName, "FOLLOWED" + i, "12345678", f.email);
            await AccountService.alterUser(f.accountName, true, f.email, {
                displayName: "name",
                gender: null,
                bio: null,
            });
            await FollowerService.requestFollower(us1, f.accountName);
            await FollowerService.acceptFollower(f.accountName, us1);
        }

        // Registers a number of (private) users for the target user to follow request
        const requests: string[] = [];
        for (var i = 0; i < 5; i++) {
            const d: UserMicro = makeSomeUser();
            requests.push(d.accountName);
            await AccountService.registerUser(d.accountName, "DUMMY" + i, "12345678", d.email);
            await AccountService.alterUser(d.accountName, true, d.email, {
                displayName: "name",
                gender: null,
                bio: null,
            });
            await FollowerService.requestFollower(us1, d.accountName);
        }

        // Checks if the target user follows the users in the first array
        const response1: string[] = (await FollowerService.getFollowing(us1, us1)).map((x) => x.followed);
        expect(response1).not.toBeNull();
        expect(response1.length).toBe(followed.length);
        followed.forEach((f) => expect(response1.includes(f)).toBe(true));
        requests.forEach((d) => expect(response1.includes(d)).toBe(false));

        // Checks if the target user requested to follow the users in the second array without acceptance
        const response2: string[] = (await FollowerService.getPendingRequestsFromUser(us1)).map((x) => x.followed);
        expect(response2).not.toBeNull();
        expect(response2.length).toBe(requests.length);
        followed.forEach((f) => expect(response2.includes(f)).toBe(false));
        requests.forEach((d) => expect(response2.includes(d)).toBe(true));
    });
});
