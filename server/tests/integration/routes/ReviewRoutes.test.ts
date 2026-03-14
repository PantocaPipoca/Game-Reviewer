import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import { createTestApp } from "../helper/app.ts";
import { StatusCodes } from "http-status-codes";
import { Express } from "express";
import { Register, CreateGame } from "../helper/helper.ts";
import { AuthResponse } from "../../../src/types/Types.ts";

const app: Express = createTestApp();

const username = "user_" + Date.now();
const password = "12345678";
const displayName = "User Display Name";
const email = username + "@test.com";



describe("GET /api/reviews/:reviewer/:reviewed", () => {
    it("returns BAD REQUEST if reviewed is not a number", async () => {
        await request(app)
            .get("/api/reviews/someuser/not-a-number")
            .expect(StatusCodes.BAD_REQUEST);
    });

    it("returns NOT FOUND if reviewer doesn't exist", async () => {
        const game = await CreateGame();

        await request(app)
            .get("/api/reviews/not-existing-user/" + game.gameID)
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns NOT FOUND if game doesn't exist", async () => {
        const user = await Register(app, username, displayName, password, email);

        await request(app)
            .get("/api/reviews/" + user.accountName + "/99999")
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns NOT FOUND if review doesn't exist", async () => {
        const user = await Register(app, username, displayName, password, email);
        const game = await CreateGame();

        await request(app)
            .get("/api/reviews/" + user.accountName + "/" + game.gameID)
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns OK and review data (public user, no auth)", async () => {
        const user = await Register(app, username, displayName, password, email);
        const game = await CreateGame();

        await request(app)
            .post("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + user.token)
            .send({ text: "great game", score: 8 })
            .expect(StatusCodes.CREATED);

        const res = await request(app)
            .get("/api/reviews/" + user.accountName + "/" + game.gameID)
            .expect(StatusCodes.OK);

        expect(res.body.status).toBe("success");
        expect(res.body.data.reviewer).toBe(user.accountName);
        expect(res.body.data.reviewed).toBe(game.gameID);
        expect(res.body.data.text).toBe("great game");
        expect(res.body.data.score).toBe(8);
        expect(res.body.data.createdAt).toBeDefined();
        expect(res.body.data.updatedAt).toBeDefined();
    });

    it("returns FORBIDDEN if reviewer is private and viewer is not following", async () => {
        const user = await Register(app, username, displayName, password, email);
        const game = await CreateGame();

        await request(app)
            .post("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + user.token)
            .send({ text: "private review", score: 6 })
            .expect(StatusCodes.CREATED);

        await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + user.token)
            .send({ isPrivate: true })
            .expect(StatusCodes.OK);

        await request(app)
            .get("/api/reviews/" + user.accountName + "/" + game.gameID)
            .expect(StatusCodes.FORBIDDEN);
    });

    it("returns FORBIDDEN if reviewer is private and viewer is authenticated but not following", async () => {
        const reviewer = await Register(app, username, displayName, password, email);
        const viewerName = "viewer_" + Date.now();
        const viewer = await Register(app, viewerName, "Viewer", password, `${viewerName}@test.com`);
        const game = await CreateGame();

        await request(app)
            .post("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + reviewer.token)
            .send({ text: "private review", score: 6 })
            .expect(StatusCodes.CREATED);

        await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + reviewer.token)
            .send({ isPrivate: true })
            .expect(StatusCodes.OK);

        await request(app)
            .get("/api/reviews/" + reviewer.accountName + "/" + game.gameID)
            .set("Authorization", "Bearer " + viewer.token)
            .expect(StatusCodes.FORBIDDEN);
    });

    it("returns OK if reviewer is private but viewer is an accepted follower", async () => {
        const reviewer = await Register(app, username, displayName, password, email);
        const viewerName = "viewer_" + Date.now();
        const viewer = await Register(app, viewerName, "Viewer", password, `${viewerName}@test.com`);
        const game = await CreateGame();

        await request(app)
            .post("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + reviewer.token)
            .send({ text: "private review", score: 6 })
            .expect(StatusCodes.CREATED);

        await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + reviewer.token)
            .send({ isPrivate: true })
            .expect(StatusCodes.OK);

        await request(app)
            .post("/api/users/" + reviewer.accountName + "/followers/")
            .set("Authorization", "Bearer " + viewer.token)
            .expect(StatusCodes.CREATED);

        await request(app)
            .put("/api/users/me/followers/requests/received/" + viewer.accountName)
            .set("Authorization", "Bearer " + reviewer.token)
            .expect(StatusCodes.ACCEPTED);

        const res = await request(app)
            .get("/api/reviews/" + reviewer.accountName + "/" + game.gameID)
            .set("Authorization", "Bearer " + viewer.token)
            .expect(StatusCodes.OK);

        expect(res.body.status).toBe("success");
        expect(res.body.data.reviewer).toBe(reviewer.accountName);
        expect(res.body.data.reviewed).toBe(game.gameID);
    });

    it("returns OK if reviewer is private and viewer is the reviewer themselves", async () => {
        const user = await Register(app, username, displayName, password, email);
        const game = await CreateGame();

        await request(app)
            .post("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + user.token)
            .send({ text: "my review", score: 9 })
            .expect(StatusCodes.CREATED);

        await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + user.token)
            .send({ isPrivate: true })
            .expect(StatusCodes.OK);

        const res = await request(app)
            .get("/api/reviews/" + user.accountName + "/" + game.gameID)
            .set("Authorization", "Bearer " + user.token)
            .expect(StatusCodes.OK);

        expect(res.body.data.reviewer).toBe(user.accountName);
        expect(res.body.data.text).toBe("my review");
    });
});