import { describe, it, expect } from "@jest/globals";
import { prisma } from "../../../src/prisma";
import { AccountService } from "../../../src/services/AccountService";

// Jest docs: https://jestjs.io/docs/api

describe("AccountService (integration)", () => {
    it("RegisterUser cria utilizador e devolve token", async () => {
        const accountName = "username1";
        const email = "username1@test.com"

        const res = await AccountService.RegisterUser(accountName, "Svc", "12345678", email);

        expect(res.accountName).toBe(accountName);
        expect(res.token).toBeDefined();

        const dbUser = await prisma.user.findUnique({ where: { accountName } });
        expect(dbUser).not.toBeNull();
        expect(dbUser!.email).toBe(email);
        expect(dbUser!.passwordHash).not.toBe("12345678");
    });

    it("LoginUser falha com password errada", async () => {
        const accountName = `svc_login_${Date.now()}`;
        const email = `${accountName}@test.com`;

        await AccountService.RegisterUser(accountName, "Svc", "12345678", email);

        await expect(AccountService.LoginUser(accountName, "wrongpass")).rejects.toBeDefined();
    });
});