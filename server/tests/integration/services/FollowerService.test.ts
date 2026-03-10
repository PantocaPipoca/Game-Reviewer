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

    it.todo("RequestFollower requests a follow, doesn't make duplicates or between the same user");

    it.todo("AcceptFollower accepts a follow request, not if it doesn't exist or was already accepted");

    it.todo("RemoveFollower removes a follower, not if they didn't follow");
})