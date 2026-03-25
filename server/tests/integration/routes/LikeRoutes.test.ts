import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import { createApp } from "../../../src/App.ts";
import { StatusCodes } from "http-status-codes";
import { Express } from "express";
import { register, createGame } from "../helper/helper.ts";
import { AuthResponse, GameFull } from "../../../src/types/Types.ts";

const app: Express = createApp();

const username: string = "user_" + Date.now();
const password: string = "12345678";
const displayName: string = "User Display Name";
const email: string = username + "@test.com";

const username2: string = "user2_" + Date.now();
const password2: string = "12345678";
const displayName2: string = "User2 Display Name";
const email2: string = username2 + "@test.com";

/** Creates a user, a game, and a review. Returns the reviewer and the gameID. */
async function setupReview(): Promise<{ reviewer: AuthResponse; gameID: number }> {
    const reviewer: AuthResponse = await register(app, username, displayName, password, email);
    const game: GameFull = await createGame();

    await request(app)
        .post("/api/games/id/" + game.gameID + "/reviews")
        .set("Authorization", "Bearer " + reviewer.token)
        .send({ text: "a review", score: 7 })
        .expect(StatusCodes.CREATED);

    return { reviewer, gameID: game.gameID };
}

// ===================== GET LIKES =====================

describe("GET /api/reviews/:reviewer/on/:reviewed/likes", () => {
    it("returns NOT FOUND if review doesn't exist", async () => {
        const user: AuthResponse = await register(app, username, displayName, password, email);
        const game: GameFull = await createGame();

        await request(app)
            .get("/api/reviews/" + user.accountName + "/on/" + game.gameID + "/likes")
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns OK with 0 likes on a fresh review", async () => {
        const { reviewer, gameID } = await setupReview();

        const res = await request(app)
            .get("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/likes")
            .expect(StatusCodes.OK);

        expect(res.body.status).toBe("success");
        expect(res.body.data).toBe(0);
    });

    it("returns OK with correct like count after liking", async () => {
        const { reviewer, gameID } = await setupReview();
        const liker: AuthResponse = await register(app, username2, displayName2, password2, email2);

        await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/likes")
            .set("Authorization", "Bearer " + liker.token)
            .expect(StatusCodes.ACCEPTED);

        const res = await request(app)
            .get("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/likes")
            .expect(StatusCodes.OK);

        expect(res.body.data).toBe(1);
    });
});

// ===================== ADD LIKE =====================

describe("POST /api/reviews/:reviewer/:reviewed/likes", () => {
    it("returns UNAUTHORIZED if not authenticated", async () => {
        const { reviewer, gameID } = await setupReview();

        await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/likes")
            .expect(StatusCodes.UNAUTHORIZED);
    });

    it("returns NOT FOUND if review doesn't exist", async () => {
        const user: AuthResponse = await register(app, username, displayName, password, email);
        const game: GameFull = await createGame();
        const liker: AuthResponse = await register(app, username2, displayName2, password2, email2);

        await request(app)
            .post("/api/reviews/" + user.accountName + "/on/" + game.gameID + "/likes")
            .set("Authorization", "Bearer " + liker.token)
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns ACCEPTED with like data on success", async () => {
        const { reviewer, gameID } = await setupReview();
        const liker: AuthResponse = await register(app, username2, displayName2, password2, email2);

        const res = await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/likes")
            .set("Authorization", "Bearer " + liker.token)
            .expect(StatusCodes.ACCEPTED);

        expect(res.body.status).toBe("success");
        expect(res.body.data.liker).toBe(liker.accountName);
        expect(res.body.data.reviewer).toBe(reviewer.accountName);
        expect(res.body.data.reviewed).toBe(gameID);
        expect(res.body.data.value).toBe(true);
    });

    it("updates reaction to like if user had previously disliked", async () => {
        const { reviewer, gameID } = await setupReview();
        const liker: AuthResponse = await register(app, username2, displayName2, password2, email2);

        await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/dislikes")
            .set("Authorization", "Bearer " + liker.token)
            .expect(StatusCodes.ACCEPTED);

        const res = await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/likes")
            .set("Authorization", "Bearer " + liker.token)
            .expect(StatusCodes.ACCEPTED);

        expect(res.body.data.value).toBe(true);

        // dislike count should now be 0
        const dislikesRes = await request(app)
            .get("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/dislikes")
            .expect(StatusCodes.OK);

        expect(dislikesRes.body.data).toBe(0);
    });

    it("allows the reviewer to like their own review", async () => {
        const { reviewer, gameID } = await setupReview();

        const res = await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/likes")
            .set("Authorization", "Bearer " + reviewer.token)
            .expect(StatusCodes.ACCEPTED);

        expect(res.body.data.liker).toBe(reviewer.accountName);
        expect(res.body.data.value).toBe(true);
    });
});

// ===================== GET DISLIKES =====================

describe("GET /api/reviews/:reviewer/:reviewed/dislikes", () => {
    it("returns NOT FOUND if review doesn't exist", async () => {
        const user: AuthResponse = await register(app, username, displayName, password, email);
        const game: GameFull = await createGame();

        await request(app)
            .get("/api/reviews/" + user.accountName + "/on/" + game.gameID + "/dislikes")
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns OK with 0 dislikes on a fresh review", async () => {
        const { reviewer, gameID } = await setupReview();

        const res = await request(app)
            .get("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/dislikes")
            .expect(StatusCodes.OK);

        expect(res.body.status).toBe("success");
        expect(res.body.data).toBe(0);
    });

    it("returns OK with correct dislike count after disliking", async () => {
        const { reviewer, gameID } = await setupReview();
        const liker: AuthResponse = await register(app, username2, displayName2, password2, email2);

        await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/dislikes")
            .set("Authorization", "Bearer " + liker.token)
            .expect(StatusCodes.ACCEPTED);

        const res = await request(app)
            .get("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/dislikes")
            .expect(StatusCodes.OK);

        expect(res.body.data).toBe(1);
    });
});

// ===================== ADD DISLIKE =====================

describe("POST /api/reviews/:reviewer/:reviewed/dislikes", () => {
    it("returns UNAUTHORIZED if not authenticated", async () => {
        const { reviewer, gameID } = await setupReview();

        await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/dislikes")
            .expect(StatusCodes.UNAUTHORIZED);
    });

    it("returns NOT FOUND if review doesn't exist", async () => {
        const user: AuthResponse = await register(app, username, displayName, password, email);
        const game: GameFull = await createGame();
        const liker: AuthResponse = await register(app, username2, displayName2, password2, email2);

        await request(app)
            .post("/api/reviews/" + user.accountName + "/on/" + game.gameID + "/dislikes")
            .set("Authorization", "Bearer " + liker.token)
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns ACCEPTED with dislike data on success", async () => {
        const { reviewer, gameID } = await setupReview();
        const liker: AuthResponse = await register(app, username2, displayName2, password2, email2);

        const res = await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/dislikes")
            .set("Authorization", "Bearer " + liker.token)
            .expect(StatusCodes.ACCEPTED);

        expect(res.body.status).toBe("success");
        expect(res.body.data.liker).toBe(liker.accountName);
        expect(res.body.data.reviewer).toBe(reviewer.accountName);
        expect(res.body.data.reviewed).toBe(gameID);
        expect(res.body.data.value).toBe(false);
    });

    it("updates reaction to dislike if user had previously liked", async () => {
        const { reviewer, gameID } = await setupReview();
        const liker: AuthResponse = await register(app, username2, displayName2, password2, email2);

        await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/likes")
            .set("Authorization", "Bearer " + liker.token)
            .expect(StatusCodes.ACCEPTED);

        const res = await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/dislikes")
            .set("Authorization", "Bearer " + liker.token)
            .expect(StatusCodes.ACCEPTED);

        expect(res.body.data.value).toBe(false);

        // like count should now be 0
        const likesRes = await request(app)
            .get("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/likes")
            .expect(StatusCodes.OK);

        expect(likesRes.body.data).toBe(0);
    });
});

// ===================== REMOVE REACTION =====================

describe("DELETE /api/reviews/:reviewer/:reviewed/reacts", () => {
    it("returns UNAUTHORIZED if not authenticated", async () => {
        const { reviewer, gameID } = await setupReview();

        await request(app)
            .delete("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/reacts")
            .expect(StatusCodes.UNAUTHORIZED);
    });

    it("returns NOT FOUND if review doesn't exist", async () => {
        const user: AuthResponse = await register(app, username, displayName, password, email);
        const game: GameFull = await createGame();
        const reactor: AuthResponse = await register(app, username2, displayName2, password2, email2);

        await request(app)
            .delete("/api/reviews/" + user.accountName + "/on/" + game.gameID + "/reacts")
            .set("Authorization", "Bearer " + reactor.token)
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns NOT FOUND if user hasn't reacted to the review", async () => {
        const { reviewer, gameID } = await setupReview();
        const reactor: AuthResponse = await register(app, username2, displayName2, password2, email2);

        await request(app)
            .delete("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/reacts")
            .set("Authorization", "Bearer " + reactor.token)
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns ACCEPTED after removing a like", async () => {
        const { reviewer, gameID } = await setupReview();
        const reactor: AuthResponse = await register(app, username2, displayName2, password2, email2);

        await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/likes")
            .set("Authorization", "Bearer " + reactor.token)
            .expect(StatusCodes.ACCEPTED);

        const res = await request(app)
            .delete("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/reacts")
            .set("Authorization", "Bearer " + reactor.token)
            .expect(StatusCodes.ACCEPTED);

        expect(res.body.status).toBe("success");
        expect(res.body.data.liker).toBe(reactor.accountName);
        expect(res.body.data.value).toBe(true);

        // like count drops back to 0
        const likesRes = await request(app)
            .get("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/likes")
            .expect(StatusCodes.OK);

        expect(likesRes.body.data).toBe(0);
    });

    it("returns ACCEPTED after removing a dislike", async () => {
        const { reviewer, gameID } = await setupReview();
        const reactor: AuthResponse = await register(app, username2, displayName2, password2, email2);

        await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/dislikes")
            .set("Authorization", "Bearer " + reactor.token)
            .expect(StatusCodes.ACCEPTED);

        const res = await request(app)
            .delete("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/reacts")
            .set("Authorization", "Bearer " + reactor.token)
            .expect(StatusCodes.ACCEPTED);

        expect(res.body.status).toBe("success");
        expect(res.body.data.liker).toBe(reactor.accountName);
        expect(res.body.data.value).toBe(false);

        // dislike count drops back to 0
        const dislikesRes = await request(app)
            .get("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/dislikes")
            .expect(StatusCodes.OK);

        expect(dislikesRes.body.data).toBe(0);
    });

    it("returns NOT FOUND if trying to remove a reaction that was already removed", async () => {
        const { reviewer, gameID } = await setupReview();
        const reactor: AuthResponse = await register(app, username2, displayName2, password2, email2);

        await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/likes")
            .set("Authorization", "Bearer " + reactor.token)
            .expect(StatusCodes.ACCEPTED);

        await request(app)
            .delete("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/reacts")
            .set("Authorization", "Bearer " + reactor.token)
            .expect(StatusCodes.ACCEPTED);

        await request(app)
            .delete("/api/reviews/" + reviewer.accountName + "/on/" + gameID + "/reacts")
            .set("Authorization", "Bearer " + reactor.token)
            .expect(StatusCodes.NOT_FOUND);
    });
});
