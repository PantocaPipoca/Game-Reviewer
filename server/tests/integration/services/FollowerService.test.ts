import { describe, it, expect } from "@jest/globals";
import { FollowerFull } from "../../../src/types/Types";
import { FollowerService } from '../../../src/services/FollowerService';
import { AccountService } from "../../../src/services/AccountService";

describe("FollowerService (integration)", () => {
    const us1: string = "user1";
    const us2: string = "user2";

    async function RegisterUsersAux(): Promise<void> {
        await AccountService.RegisterUser(us1, "USER1", "12345678", "us1@test.com");
        await AccountService.RegisterUser(us2, "USER2", "87654321", "us2@test.com");
    }

    async function RequestFollowerAux(): Promise<FollowerFull> {
        return await FollowerService.RequestFollower(us1, us2);
    }

    async function AcceptFollowerAux(): Promise<FollowerFull> {
        return await FollowerService.AcceptFollower(us1, us2);
    }

    async function RemoveFollowerAux(): Promise<FollowerFull> {
        return await FollowerService.RemoveFollower(us1, us1, us2);
    }

    it("RequestFollower requests a follow, doesn't make duplicates or between the same user", async () => {
        await RegisterUsersAux();

        const res: FollowerFull = await RequestFollowerAux();
        expect(res).not.toBeNull();
        expect(res.follows).toBe(us1);
        expect(res.followed).toBe(us2);
        expect(res.accepted).toBe(false);
        
        // Fails, already requested
        await expect(await RequestFollowerAux()).rejects.toBeDefined();
        // Fails, follow request between user and self
        await expect(await FollowerService.RequestFollower(us1, us1)).rejects.toBeDefined();
    })

    it("AcceptFollower accepts a follow request, not if it doesn't exist or was already accepted", async () => {
        await RegisterUsersAux();

        // Fails, not yet requested
        await expect(await AcceptFollowerAux()).rejects.toBeDefined();

        // Request and accept
        await RequestFollowerAux();
        const res: FollowerFull = await AcceptFollowerAux();
        expect(res).not.toBeNull();
        expect(res.follows).toBe(us1);
        expect(res.followed).toBe(us2);
        expect(res.accepted).toBe(true);

        // Fails, already accepted
        await expect(await AcceptFollowerAux()).rejects.toBeDefined();
    })

    it("RemoveFollower removes a follower, not if they didn't follow", async () => {
        await RegisterUsersAux();

        // Fails, not requested
        await expect(await RemoveFollowerAux()).rejects.toBeDefined();

        // Request and remove
        await RequestFollowerAux();
        const res: FollowerFull = await RemoveFollowerAux();
        expect(res).not.toBeNull();

        // Request, accept and remove
        await RequestFollowerAux();
        await AcceptFollowerAux();
        const res2: FollowerFull = await RemoveFollowerAux();
        expect(res2).not.toBeNull();
    })
})