import { describe, it, expect } from "@jest/globals";
import { prisma } from "../../../src/prisma";
import { AccountService } from "../../../src/services/AccountService";
import { AuthResponse } from "../../../src/types/Types";

// Jest docs: https://jestjs.io/docs/api

describe("AccountService (integration)", () => {
    it("RegisterUser creates a user and returns token, not if duplicate", async () => {
        const accountName: string = "username1";
        const displayName: string = "Svc"
        const pass: string = "12345678";
        const email: string = "username1@test.com";

        const res: AuthResponse = await AccountService.RegisterUser(accountName, displayName, pass, email);

        expect(res.accountName).toBe(accountName);
        expect(res.token).toBeDefined();

        const dbUser = await prisma.user.findUnique({ where: { accountName } });
        expect(dbUser).not.toBeNull();
        expect(dbUser!.email).toBe(email);
        expect(dbUser!.passwordHash).not.toBe(pass);

        await expect(AccountService.RegisterUser(accountName, displayName, pass, email)).rejects.toBeDefined();
    });

    it("LoginUser fails with wrong passwords", async () => {
        const accountName: string = `svc_login_${Date.now()}`;
        const email: string = `${accountName}@test.com`;

        await AccountService.RegisterUser(accountName, "Svc", "12345678", email);

        await expect(AccountService.LoginUser(accountName, "wrongpass")).rejects.toBeDefined();
    });

    it("AlterUser alters a user", async () => {
        const accountName: string = "username1";
        const pass: string = "12345678";
        const email: string = "username1@test.com";

        await AccountService.RegisterUser(accountName, "Svc", "87654321", "svc@test.com");

        const dbUser1 = await prisma.user.findUnique({where: {accountName}});
        const prevPassHash: string | undefined = dbUser1?.passwordHash;

        await AccountService.AlterUser(accountName, true, pass, email);

        const dbUser2 = await prisma.user.findUnique({where: {accountName}});
        expect(dbUser2).not.toBeNull();
        expect(dbUser2!.email).toBe(email);
        expect(dbUser2!.passwordHash).not.toBe(pass);
        expect(dbUser2!.passwordHash).not.toBe(prevPassHash);
    });

    it("DeleteUser removes a user", async () => {
        const accountName: string = "username1";

        await AccountService.RegisterUser(accountName, "Svc", "87654321", "svc@test.com");
        const dbUser1 = await prisma.user.findUnique({where: {accountName}});
        expect(dbUser1).not.toBeNull();

        await AccountService.RemoveUser(accountName);
        const dbUser2 = await prisma.user.findUnique({where: {accountName}});
        expect(dbUser2).toBeNull();
    });
});