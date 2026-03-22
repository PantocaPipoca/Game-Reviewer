import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import { createApp } from "../../../src/App.ts";
import { StatusCodes } from "http-status-codes";
import { Express } from "express";
import { register, createGame } from "../helper/helper.ts";

const app: Express = createApp();

const username = "user_" + Date.now();
const password = "12345678";
const displayName = "User Display Name";
const email = username + "@test.com";

// ===================== GET GAME BY ID =====================
// describe("GET /api/games/:gameID", () => {
//     it("returns BAD REQUEST if gameID is not a number", async () => {
//         await request(app)
//         .get("/api/games/not-a-number")
//         .expect(StatusCodes.BAD_REQUEST);
//     });

//     it("returns NOT FOUND if game doesn't exist", async () => {
//         await request(app)
//         .get("/api/games/99999")
//         .expect(StatusCodes.NOT_FOUND);
//     });

//     it("returns OK and game data", async () => {
//         const game = await CreateGame();

//         const res = await request(app)
//         .get("/api/games/" + game.gameID)
//         .expect(StatusCodes.OK);

//         expect(res.body.status).toBe("success");
//         expect(res.body.data.gameID).toBe(game.gameID);
//         expect(res.body.data.gameName).toBeDefined();
//     });
// });
// refactor this for IGDB

// ===================== IGDB REQUESTS (TODO) =====================

describe("GET /api/games/id/:gameID", () => {
    it.todo("returns OK and game data");
    it.todo("returns BAD REQUEST if given GameID isn't a valid integer");
});

describe("POST /api/games/search", () => {
    it.todo("returns OK and matching games for a valid name query");
    it.todo("returns OK and matching games for a valid genre query");
    it.todo("returns OK and matching games for combined name and genre query");
    it.todo("returns BAD REQUEST if query params are invalid");
});

describe("POST /api/games/popular", () => {
    it.todo("returns OK and list of popular games");
    it.todo("returns BAD REQUEST if query params are invalid");
});

describe("POST /api/games/recent", () => {
    it.todo("returns OK and list of recent games");
    it.todo("returns BAD REQUEST if query params are invalid");
});

describe("POST /api/games/recommended", () => {
    it.todo("returns OK and list of recommended games");
    it.todo("returns BAD REQUEST if query params are invalid");
});

// ===================== GET REVIEWS BY GAME =====================

describe("GET /api/games/:gameID/reviews", () => {
    it("returns NOT FOUND if game doesn't exist", async () => {
        await request(app).get("/api/games/99999/reviews").expect(StatusCodes.NOT_FOUND);
    });

    it("returns OK and empty array if game has no reviews", async () => {
        const game = await createGame();

        const res = await request(app)
            .get("/api/games/" + game.gameID + "/reviews")
            .expect(StatusCodes.OK);

        expect(res.body.status).toBe("success");
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data).toHaveLength(0);
    });

    it("returns OK and array with reviews (public user, no auth)", async () => {
        const user = await register(app, username, displayName, password, email);
        const game = await createGame();

        await request(app)
            .post("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + user.token)
            .send({ text: "great game", score: 9 })
            .expect(StatusCodes.CREATED);

        const res = await request(app)
            .get("/api/games/" + game.gameID + "/reviews")
            .expect(StatusCodes.OK);

        expect(res.body.status).toBe("success");
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].reviewer).toBe(user.accountName);
        expect(res.body.data[0].reviewed).toBe(game.gameID);
        expect(res.body.data[0].score).toBe(9);
    });

    it("hides reviews from private users that the viewer doesn't follow", async () => {
        const user = await register(app, username, displayName, password, email);
        const game = await createGame();

        await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + user.token)
            .send({ isPrivate: true })
            .expect(StatusCodes.OK);

        await request(app)
            .post("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + user.token)
            .send({ text: "hidden review", score: 5 })
            .expect(StatusCodes.CREATED);

        const res = await request(app)
            .get("/api/games/" + game.gameID + "/reviews")
            .expect(StatusCodes.OK);

        expect(res.body.data).toHaveLength(0);
    });

    it("shows reviews from private users to their accepted followers", async () => {
        const privName = "priv_" + Date.now();
        const privateUser = await register(app, privName, displayName, password, `${privName}@test.com`);
        const viewerName = "viewer_" + Date.now();
        const viewer = await register(app, viewerName, "Viewer", password, `${viewerName}@test.com`);
        const game = await createGame();

        await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + privateUser.token)
            .send({ isPrivate: true })
            .expect(StatusCodes.OK);

        await request(app)
            .post("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + privateUser.token)
            .send({ text: "private review", score: 7 })
            .expect(StatusCodes.CREATED);

        await request(app)
            .post("/api/users/" + privateUser.accountName + "/followers/")
            .set("Authorization", "Bearer " + viewer.token)
            .expect(StatusCodes.CREATED);

        await request(app)
            .put("/api/users/me/followers/requests/received/" + viewer.accountName)
            .set("Authorization", "Bearer " + privateUser.token)
            .expect(StatusCodes.ACCEPTED);

        const res = await request(app)
            .get("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + viewer.token)
            .expect(StatusCodes.OK);

        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].reviewer).toBe(privateUser.accountName);
    });
});

// ===================== PUBLISH REVIEW =====================

describe("POST /api/games/:gameID/reviews", () => {
    it("returns UNAUTHORIZED if not authenticated", async () => {
        const game = await createGame();

        await request(app)
            .post("/api/games/" + game.gameID + "/reviews")
            .send({ text: "great", score: 8 })
            .expect(StatusCodes.UNAUTHORIZED);
    });

    it("returns NOT FOUND if game doesn't exist", async () => {
        const user = await register(app, username, displayName, password, email);

        await request(app)
            .post("/api/games/99999/reviews")
            .set("Authorization", "Bearer " + user.token)
            .send({ text: "great", score: 8 })
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns BAD REQUEST if text is missing", async () => {
        const user = await register(app, username, displayName, password, email);
        const game = await createGame();

        await request(app)
            .post("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + user.token)
            .send({ score: 8 })
            .expect(StatusCodes.BAD_REQUEST);
    });

    it("returns BAD REQUEST if score is missing", async () => {
        const user = await register(app, username, displayName, password, email);
        const game = await createGame();

        await request(app)
            .post("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + user.token)
            .send({ text: "great" })
            .expect(StatusCodes.BAD_REQUEST);
    });

    it("returns BAD REQUEST if score is above 10", async () => {
        const user = await register(app, username, displayName, password, email);
        const game = await createGame();

        await request(app)
            .post("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + user.token)
            .send({ text: "great", score: 11 })
            .expect(StatusCodes.BAD_REQUEST);
    });

    it("returns BAD REQUEST if score is below 0", async () => {
        const user = await register(app, username, displayName, password, email);
        const game = await createGame();

        await request(app)
            .post("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + user.token)
            .send({ text: "great", score: -1 })
            .expect(StatusCodes.BAD_REQUEST);
    });

    it("returns BAD REQUEST if score is not a number", async () => {
        const user = await register(app, username, displayName, password, email);
        const game = await createGame();

        await request(app)
            .post("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + user.token)
            .send({ text: "great", score: "eight" })
            .expect(StatusCodes.BAD_REQUEST);
    });

    it("returns CONFLICT if user already reviewed this game", async () => {
        const user = await register(app, username, displayName, password, email);
        const game = await createGame();

        await request(app)
            .post("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + user.token)
            .send({ text: "first review", score: 8 })
            .expect(StatusCodes.CREATED);

        await request(app)
            .post("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + user.token)
            .send({ text: "second review", score: 7 })
            .expect(StatusCodes.CONFLICT);
    });

    it("returns CREATED with correct review data on success", async () => {
        const user = await register(app, username, displayName, password, email);
        const game = await createGame();

        const res = await request(app)
            .post("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + user.token)
            .send({ text: "great game", score: 8 })
            .expect(StatusCodes.CREATED);

        expect(res.body.status).toBe("success");
        expect(res.body.data.reviewer).toBe(user.accountName);
        expect(res.body.data.reviewed).toBe(game.gameID);
        expect(res.body.data.text).toBe("great game");
        expect(res.body.data.score).toBe(8);
        expect(res.body.data.createdAt).toBeDefined();
        expect(res.body.data.updatedAt).toBeDefined();
    });

    it("accepts boundary score values (0 and 10)", async () => {
        const u1name = "u1_" + Date.now();
        const u1 = await register(app, u1name, displayName, password, `${u1name}@test.com`);
        const u2name = "u2_" + Date.now();
        const u2 = await register(app, u2name, displayName, password, `${u2name}@test.com`);

        const game1 = await createGame();
        const game2 = await createGame();

        await request(app)
            .post("/api/games/" + game1.gameID + "/reviews")
            .set("Authorization", "Bearer " + u1.token)
            .send({ text: "terrible", score: 0 })
            .expect(StatusCodes.CREATED);

        await request(app)
            .post("/api/games/" + game2.gameID + "/reviews")
            .set("Authorization", "Bearer " + u2.token)
            .send({ text: "perfect", score: 10 })
            .expect(StatusCodes.CREATED);
    });
});

// ===================== ALTER REVIEW =====================

describe("PUT /api/games/:gameID/reviews", () => {
    it("returns UNAUTHORIZED if not authenticated", async () => {
        const game = await createGame();

        await request(app)
            .put("/api/games/" + game.gameID + "/reviews")
            .send({ text: "updated", score: 7 })
            .expect(StatusCodes.UNAUTHORIZED);
    });

    it("returns NOT FOUND if game doesn't exist", async () => {
        const user = await register(app, username, displayName, password, email);

        await request(app)
            .put("/api/games/99999/reviews")
            .set("Authorization", "Bearer " + user.token)
            .send({ text: "updated", score: 7 })
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns NOT FOUND if review doesn't exist", async () => {
        const user = await register(app, username, displayName, password, email);
        const game = await createGame();

        await request(app)
            .put("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + user.token)
            .send({ text: "updated", score: 7 })
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns BAD REQUEST if score is out of range", async () => {
        const user = await register(app, username, displayName, password, email);
        const game = await createGame();

        await request(app)
            .post("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + user.token)
            .send({ text: "original", score: 5 })
            .expect(StatusCodes.CREATED);

        await request(app)
            .put("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + user.token)
            .send({ text: "updated", score: 15 })
            .expect(StatusCodes.BAD_REQUEST);
    });

    it("returns ACCEPTED and updated review on success", async () => {
        const user = await register(app, username, displayName, password, email);
        const game = await createGame();

        await request(app)
            .post("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + user.token)
            .send({ text: "original", score: 5 })
            .expect(StatusCodes.CREATED);

        const res = await request(app)
            .put("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + user.token)
            .send({ text: "updated review", score: 7 })
            .expect(StatusCodes.ACCEPTED);

        expect(res.body.status).toBe("success");
        expect(res.body.data.reviewer).toBe(user.accountName);
        expect(res.body.data.reviewed).toBe(game.gameID);
        expect(res.body.data.text).toBe("updated review");
        expect(res.body.data.score).toBe(7);
    });
});

// ===================== REMOVE REVIEW =====================

describe("DELETE /api/games/:gameID/reviews", () => {
    it("returns UNAUTHORIZED if not authenticated", async () => {
        const game = await createGame();

        await request(app)
            .delete("/api/games/" + game.gameID + "/reviews")
            .expect(StatusCodes.UNAUTHORIZED);
    });

    it("returns NOT FOUND if game doesn't exist", async () => {
        const user = await register(app, username, displayName, password, email);

        await request(app)
            .delete("/api/games/99999/reviews")
            .set("Authorization", "Bearer " + user.token)
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns NOT FOUND if review doesn't exist", async () => {
        const user = await register(app, username, displayName, password, email);
        const game = await createGame();

        await request(app)
            .delete("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + user.token)
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns ACCEPTED and deleted review data on success", async () => {
        const user = await register(app, username, displayName, password, email);
        const game = await createGame();

        await request(app)
            .post("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + user.token)
            .send({ text: "to be deleted", score: 5 })
            .expect(StatusCodes.CREATED);

        const res = await request(app)
            .delete("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + user.token)
            .expect(StatusCodes.ACCEPTED);

        expect(res.body.status).toBe("success");
        expect(res.body.data.reviewer).toBe(user.accountName);
        expect(res.body.data.reviewed).toBe(game.gameID);
    });

    it("returns NOT FOUND if trying to delete the same review twice", async () => {
        const user = await register(app, username, displayName, password, email);
        const game = await createGame();

        await request(app)
            .post("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + user.token)
            .send({ text: "to be deleted", score: 5 })
            .expect(StatusCodes.CREATED);

        await request(app)
            .delete("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + user.token)
            .expect(StatusCodes.ACCEPTED);

        await request(app)
            .delete("/api/games/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + user.token)
            .expect(StatusCodes.NOT_FOUND);
    });
});
