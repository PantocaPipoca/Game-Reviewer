import { describe, it, expect } from "@jest/globals";
import request from "supertest";

import { createTestApp } from "../helper/app.ts";
import { StatusCodes } from "http-status-codes";
import { Express } from 'express';
import { Register } from "../helper/helper.ts";
import { AuthResponse } from "../../../src/types/Types.ts";

const app: Express = createTestApp();

// user 1
const username: string = "user_" + Date.now();
const password: string = "12345678";
const displayName: string = "User Display Name";
const email: string = username + "@test.com";

// user 2
const username2: string = "user2_" + Date.now();
const password2: string = "12345678";
const displayName2: string = "User2 Display Name";
const email2: string = username2 + "@test.com";

// =============== FOLLOWERS ===============

describe("GET /api/users/:username/followers", () => {
    it("returns NOT FOUND if username param missing (route won't match -> 404)", async () => {
        await request(app).get("/api/users/").expect(StatusCodes.NOT_FOUND);
    });

    it("returns NOT FOUND if user doesn't exist", async () => {
        await request(app)
            .get("/api/users/not-existing-user/followers")
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns FORBIDDEN if target is private", async () => {
        const target: AuthResponse = await Register(app, username, displayName, password, email);
        const viewer: AuthResponse = await Register(app, username2, displayName2, password2, email2);

        // target as private
        await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + target.token)
            .send({ isPrivate: true })

        await request(app)
            .get("/api/users/" + target.accountName + "/followers")
            .set("Authorization", "Bearer " + viewer.token)
            .expect(StatusCodes.FORBIDDEN)
    });

    it("returns OK when target is private and viewer is an accepted follower", async () => {
        const target: AuthResponse = await Register(app, username, displayName, password, email);
        const follower: AuthResponse = await Register(app, username2, displayName2, password2, email2);

        // target as private
        await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + target.token)
            .send({ isPrivate: true })

        // follower follows target
        await request(app)
            .post("/api/users/" + target.accountName + "/followers/")
            .set("Authorization", "Bearer " + follower.token)
            .expect(StatusCodes.CREATED);

        // follower accepts
        await request(app)
            .put("/api/users/me/followers/requests/received/" + follower.accountName)
            .set("Authorization", "Bearer " + target.token)
            .expect(StatusCodes.ACCEPTED);

        const res = await request(app)
            .get("/api/users/" + target.accountName + "/followers")
            .set("Authorization", "Bearer " + follower.token)
            .expect(StatusCodes.OK);
        
        expect(res.body.status).toBe("success");
        expect(res.body.data[0].follows).toBe(follower.accountName);
        expect(res.body.data[0].followed).toBe(target.accountName);
    })

    it("returns OK when target is public", async () => {
        const target: AuthResponse = await Register(app, username, displayName, password, email);
        const follower: AuthResponse = await Register(app, username2, displayName2, password2, email2);

        // follower follows target
        await request(app)
            .post("/api/users/" + target.accountName + "/followers/")
            .set("Authorization", "Bearer " + follower.token)
            .expect(StatusCodes.CREATED);
        
        const res = await request(app)
            .get("/api/users/" + target.accountName + "/followers")
            .expect(StatusCodes.OK);

        expect(res.body.status).toBe("success");
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data[0].follows).toBe(follower.accountName);
        expect(res.body.data[0].followed).toBe(target.accountName);
    });
});

// ================ FOLLOW user ================

describe("POST /api/users/:username/followers", () => {
    it("returns NOT FOUND if username param missing (route won't match -> 404)", async () => {
        const user = await Register(app, username, displayName, password, email);

        await request(app)
            .post("/api/users//followers")
            .set("Authorization", "Bearer " + user.token)
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns NOT FOUND if user doesn't exist", async () => {
        const user = await Register(app, username, displayName, password, email);
        await request(app)
            .post("/api/users/not-existing-user/followers")
            .set("Authorization", "Bearer " + user.token)
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns UNAUTHORIZED if not authenticated", async () => {
        await request(app).post("/api/users/me/followers").expect(StatusCodes.UNAUTHORIZED);
    });

    it("returns CONFLICT if user tries to follow themselves", async () => {
        const user = await Register(app, username, displayName, password, email);

        await request(app)
            .post("/api/users/" + user.accountName + "/followers") 
            .set("Authorization", "Bearer " + user.token)
            .expect(StatusCodes.CONFLICT);
    });

    it("returns CONFLICT if follow request already exists", async () => {
        const target: AuthResponse = await Register(app, username, displayName, password, email);
        const follower: AuthResponse = await Register(app, username2, displayName2, password2, email2);
        
        await request(app)
            .post("/api/users/" + target.accountName + "/followers/")
            .set("Authorization", "Bearer " + follower.token)
            .expect(StatusCodes.CREATED);

        await request(app)
            .post("/api/users/" + target.accountName + "/followers/")
            .set("Authorization", "Bearer " + follower.token)
            .expect(StatusCodes.CONFLICT);
    });

    it("returns CREATED if follower follows target (public -> accepted: true)", async () => {
        const target: AuthResponse = await Register(app, username, displayName, password, email);
        const follower: AuthResponse = await Register(app, username2, displayName2, password2, email2);

        const res = await request(app)
            .post("/api/users/" + target.accountName + "/followers/")
            .set("Authorization", "Bearer " + follower.token)
            .expect(StatusCodes.CREATED);

        expect(res.body.status).toBe("success");
        expect(res.body.data.follows).toBe(follower.accountName);
        expect(res.body.data.followed).toBe(target.accountName);
        expect(res.body.data.accepted).toBe(true);
    });

    it("returns CREATED if follower follows target (private -> accepted: false)", async () => {
        const target: AuthResponse = await Register(app, username, displayName, password, email);
        const follower: AuthResponse = await Register(app, username2, displayName2, password2, email2);

        await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + target.token)
            .send({ isPrivate: true })
            .expect(StatusCodes.OK);

        const res = await request(app)
            .post("/api/users/" + target.accountName + "/followers/")
            .set("Authorization", "Bearer " + follower.token)
            .expect(StatusCodes.CREATED);

        expect(res.body.status).toBe("success");
        expect(res.body.data.follows).toBe(follower.accountName);
        expect(res.body.data.followed).toBe(target.accountName);
        expect(res.body.data.accepted).toBe(false);
    });
});

// =============== Unfollow/Delete request ===============

describe("DELETE /api/users/:username/followers", () => {
    it("returns NOT FOUND if username param missing (route won't match -> 404)", async () => {
        const user = await Register(app, username, displayName, password, email);

        await request(app)
            .delete("/api/users//followers")
            .set("Authorization", "Bearer " + user.token)
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns NOT FOUND if user doesn't exist", async () => {
        const user = await Register(app, username, displayName, password, email);
        await request(app)
            .delete("/api/users/not-existing-user/followers")
            .set("Authorization", "Bearer " + user.token)
            .expect(StatusCodes.NOT_FOUND);
    });

    it("return NOT FOUND if not following target", async () => {
        const target: AuthResponse = await Register(app, username, displayName, password, email);
        const user = await Register(app, username2, displayName2, password2, email2);
        
        await request(app)
            .delete("/api/users/" + target.accountName + "/followers/")
            .set("Authorization", "Bearer " + user.token)
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns UNAUTHORIZED if not authenticated", async () => {
        await request(app).delete("/api/users/me/followers").expect(StatusCodes.UNAUTHORIZED);
    });

    it("returns NOT FOUND if user is not following target", async () => {
        const target: AuthResponse = await Register(app, username, displayName, password, email);
        const user = await Register(app, username2, displayName2, password2, email2);
        
        await request(app)
            .delete("/api/users/" + target.accountName + "/followers/")
            .set("Authorization", "Bearer " + user.token)
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns ACCEPTED if follower unfollows target", async () => {
        const target: AuthResponse = await Register(app, username, displayName, password, email);
        const follower: AuthResponse = await Register(app, username2, displayName2, password2, email2);

        await request(app)
            .post("/api/users/" + target.accountName + "/followers/")
            .set("Authorization", "Bearer " + follower.token)
            .expect(StatusCodes.CREATED);

        const res = await request(app)
            .delete("/api/users/" + target.accountName + "/followers/")
            .set("Authorization", "Bearer " + follower.token)
            .expect(StatusCodes.ACCEPTED);

        expect(res.body.status).toBe("success");
        expect(res.body.data.follows).toBe(follower.accountName);
        expect(res.body.data.followed).toBe(target.accountName);
    });
});