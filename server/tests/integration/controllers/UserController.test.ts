import { describe, it, expect, afterAll } from "@jest/globals";
import request from "supertest";
import { prisma } from "../../../src/prisma";
import { createTestApp } from "../helper/app";
 
// Jest docs: https://jestjs.io/docs/api

describe("Users controller (integration)", () => {
    const app = createTestApp();
    const accountName = `user_test${Date.now()}`;
    const email = `${accountName}@test.com`;

    it("POST /api/users registers an account", async () => {
        const res = await request(app)
        .post("/api/users")
        .send({
            accountName,
            displayName: "User",
            password: "12345678",
            email,
        })
        .expect(201);

        expect(res.body.status).toBe("success");
        expect(res.body.data.accountName).toBe(accountName);
        expect(res.body.data.token).toBeDefined();
    });

    afterAll(async () => {
        await prisma.user.deleteMany({ where: { accountName } });
        await prisma.$disconnect();
    });
});