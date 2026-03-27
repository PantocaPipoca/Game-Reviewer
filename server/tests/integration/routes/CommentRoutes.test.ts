import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import { createApp } from "../../../src/App.ts";
import { StatusCodes } from "http-status-codes";
import { Express } from "express";
import { register, createGame } from "../helper/helper.ts";
import { AuthResponse } from "../../../src/types/Types.ts";

const app: Express = createApp();

const username = "user_" + Date.now();
const password = "12345678";
const displayName = "User Display Name";
const email = username + "@test.com";

const username2 = "user2_" + Date.now();
const password2 = "12345678";
const displayName2 = "User2 Display Name";
const email2 = username2 + "@test.com";

// Creates a review and returns the reviewer's AuthResponse and the gameID
async function setupReview(): Promise<{ reviewer: AuthResponse; gameID: number }> {
    const reviewer = await register(app, username, displayName, password, email);
    const game = await createGame();

    await request(app)
        .post("/api/games/" + game.gameID + "/reviews")
        .set("Authorization", "Bearer " + reviewer.token)
        .send({ text: "a review", score: 7 })
        .expect(StatusCodes.CREATED);

    return { reviewer, gameID: game.gameID };
}

// ===================== GET COMMENTS =====================

describe("GET /api/reviews/:reviewer/:reviewed/comments", () => {
    it("returns NOT FOUND if review doesn't exist", async () => {
        const user = await register(app, username, displayName, password, email);
        const game = await createGame();

        await request(app)
            .get("/api/reviews/" + user.accountName + "/" + game.gameID + "/comments")
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns OK and empty array if review has no comments", async () => {
        const { reviewer, gameID } = await setupReview();

        const res = await request(app)
            .get("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments")
            .expect(StatusCodes.OK);

        expect(res.body.status).toBe("success");
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data).toHaveLength(0);
    });

    it("returns OK and array with comments (no auth)", async () => {
        const { reviewer, gameID } = await setupReview();
        const commenter = await register(app, username2, displayName2, password2, email2);

        await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments")
            .set("Authorization", "Bearer " + commenter.token)
            .send({ text: "nice review!" })
            .expect(StatusCodes.CREATED);

        const res = await request(app)
            .get("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments")
            .expect(StatusCodes.OK);

        expect(res.body.status).toBe("success");
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].commentator).toBe(commenter.accountName);
        expect(res.body.data[0].text).toBe("nice review!");
        expect(res.body.data[0].reviewer).toBe(reviewer.accountName);
        expect(res.body.data[0].reviewed).toBe(gameID);
    });

    it("returns FORBIDDEN if reviewer is private and viewer is not following", async () => {
        const { reviewer, gameID } = await setupReview();

        await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + reviewer.token)
            .send({
                isPrivate: true,
                email,
                userData: { displayName, gender: "", bio: "" },
            })
            .expect(StatusCodes.OK);

        await request(app)
            .get("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments")
            .expect(StatusCodes.FORBIDDEN);
    });

    it("returns OK if reviewer is private but viewer is an accepted follower", async () => {
        const { reviewer, gameID } = await setupReview();
        const viewerName = "viewer_" + Date.now();
        const viewer = await register(app, viewerName, "Viewer", password, `${viewerName}@test.com`);

        await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + reviewer.token)
            .send({
                isPrivate: true,
                email,
                userData: { displayName, gender: "", bio: "" },
            })
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
            .get("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments")
            .set("Authorization", "Bearer " + viewer.token)
            .expect(StatusCodes.OK);

        expect(res.body.status).toBe("success");
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});

// ===================== ADD COMMENT =====================

describe("POST /api/reviews/:reviewer/:reviewed/comments", () => {
    it("returns UNAUTHORIZED if not authenticated", async () => {
        const { reviewer, gameID } = await setupReview();

        await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments")
            .send({ text: "great review" })
            .expect(StatusCodes.UNAUTHORIZED);
    });

    it("returns NOT FOUND if review doesn't exist", async () => {
        const user = await register(app, username, displayName, password, email);
        const game = await createGame();

        await request(app)
            .post("/api/reviews/" + user.accountName + "/" + game.gameID + "/comments")
            .set("Authorization", "Bearer " + user.token)
            .send({ text: "great review" })
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns BAD REQUEST if text is missing", async () => {
        const { reviewer, gameID } = await setupReview();
        const commenter = await register(app, username2, displayName2, password2, email2);

        await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments")
            .set("Authorization", "Bearer " + commenter.token)
            .send({})
            .expect(StatusCodes.BAD_REQUEST);
    });

    it("returns CREATED with comment data on success", async () => {
        const { reviewer, gameID } = await setupReview();
        const commenter = await register(app, username2, displayName2, password2, email2);

        const res = await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments")
            .set("Authorization", "Bearer " + commenter.token)
            .send({ text: "great review!" })
            .expect(StatusCodes.CREATED);

        expect(res.body.status).toBe("success");
        expect(res.body.data.commentator).toBe(commenter.accountName);
        expect(res.body.data.reviewer).toBe(reviewer.accountName);
        expect(res.body.data.reviewed).toBe(gameID);
        expect(res.body.data.text).toBe("great review!");
        expect(res.body.data.id).toBeDefined();
        expect(res.body.data.createdAt).toBeDefined();
    });

    it("allows the reviewer to comment on their own review", async () => {
        const { reviewer, gameID } = await setupReview();

        const res = await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments")
            .set("Authorization", "Bearer " + reviewer.token)
            .send({ text: "thanks for reading!" })
            .expect(StatusCodes.CREATED);

        expect(res.body.data.commentator).toBe(reviewer.accountName);
    });

    it("allows multiple comments from different users on the same review", async () => {
        const { reviewer, gameID } = await setupReview();
        const commenter = await register(app, username2, displayName2, password2, email2);

        await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments")
            .set("Authorization", "Bearer " + commenter.token)
            .send({ text: "first comment" })
            .expect(StatusCodes.CREATED);

        await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments")
            .set("Authorization", "Bearer " + commenter.token)
            .send({ text: "second comment" })
            .expect(StatusCodes.CREATED);

        const res = await request(app)
            .get("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments")
            .expect(StatusCodes.OK);

        expect(res.body.data).toHaveLength(2);
    });
});

// ===================== EDIT COMMENT =====================

describe("PUT /api/reviews/:reviewer/:reviewed/comments/:id", () => {
    it("returns UNAUTHORIZED if not authenticated", async () => {
        const { reviewer, gameID } = await setupReview();

        await request(app)
            .put("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments/1")
            .send({ text: "updated" })
            .expect(StatusCodes.UNAUTHORIZED);
    });

    it("returns BAD REQUEST if comment id is not a number", async () => {
        const { reviewer, gameID } = await setupReview();
        const commenter = await register(app, username2, displayName2, password2, email2);

        await request(app)
            .put("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments/not-a-number")
            .set("Authorization", "Bearer " + commenter.token)
            .send({ text: "updated" })
            .expect(StatusCodes.BAD_REQUEST);
    });

    it("returns NOT FOUND if comment doesn't exist", async () => {
        const { reviewer, gameID } = await setupReview();
        const commenter = await register(app, username2, displayName2, password2, email2);

        await request(app)
            .put("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments/99999")
            .set("Authorization", "Bearer " + commenter.token)
            .send({ text: "updated" })
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns FORBIDDEN if user is not the comment author", async () => {
        const { reviewer, gameID } = await setupReview();
        const commenter = await register(app, username2, displayName2, password2, email2);

        const createRes = await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments")
            .set("Authorization", "Bearer " + commenter.token)
            .send({ text: "original comment" })
            .expect(StatusCodes.CREATED);

        const commentID = createRes.body.data.id;

        // reviewer tries to edit commenter's comment
        await request(app)
            .put("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments/" + commentID)
            .set("Authorization", "Bearer " + reviewer.token)
            .send({ text: "tampered" })
            .expect(StatusCodes.FORBIDDEN);
    });

    it("returns BAD REQUEST if text is missing", async () => {
        const { reviewer, gameID } = await setupReview();
        const commenter = await register(app, username2, displayName2, password2, email2);

        const createRes = await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments")
            .set("Authorization", "Bearer " + commenter.token)
            .send({ text: "original comment" })
            .expect(StatusCodes.CREATED);

        const commentID = createRes.body.data.id;

        await request(app)
            .put("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments/" + commentID)
            .set("Authorization", "Bearer " + commenter.token)
            .send({})
            .expect(StatusCodes.BAD_REQUEST);
    });

    it("returns ACCEPTED and updated comment on success", async () => {
        const { reviewer, gameID } = await setupReview();
        const commenter = await register(app, username2, displayName2, password2, email2);

        const createRes = await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments")
            .set("Authorization", "Bearer " + commenter.token)
            .send({ text: "original comment" })
            .expect(StatusCodes.CREATED);

        const commentID = createRes.body.data.id;

        const res = await request(app)
            .put("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments/" + commentID)
            .set("Authorization", "Bearer " + commenter.token)
            .send({ text: "updated comment" })
            .expect(StatusCodes.ACCEPTED);

        expect(res.body.status).toBe("success");
        expect(res.body.data.id).toBe(commentID);
        expect(res.body.data.text).toBe("updated comment");
        expect(res.body.data.commentator).toBe(commenter.accountName);
    });
});

// ===================== DELETE COMMENT =====================

describe("DELETE /api/reviews/:reviewer/:reviewed/comments/:id", () => {
    it("returns UNAUTHORIZED if not authenticated", async () => {
        const { reviewer, gameID } = await setupReview();

        await request(app)
            .delete("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments/1")
            .expect(StatusCodes.UNAUTHORIZED);
    });

    it("returns BAD REQUEST if comment id is not a number", async () => {
        const { reviewer, gameID } = await setupReview();
        const commenter = await register(app, username2, displayName2, password2, email2);

        await request(app)
            .delete("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments/not-a-number")
            .set("Authorization", "Bearer " + commenter.token)
            .expect(StatusCodes.BAD_REQUEST);
    });

    it("returns NOT FOUND if comment doesn't exist", async () => {
        const { reviewer, gameID } = await setupReview();
        const commenter = await register(app, username2, displayName2, password2, email2);

        await request(app)
            .delete("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments/99999")
            .set("Authorization", "Bearer " + commenter.token)
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns FORBIDDEN if user is not the comment author", async () => {
        const { reviewer, gameID } = await setupReview();
        const commenter = await register(app, username2, displayName2, password2, email2);

        const createRes = await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments")
            .set("Authorization", "Bearer " + commenter.token)
            .send({ text: "a comment" })
            .expect(StatusCodes.CREATED);

        const commentID = createRes.body.data.id;

        await request(app)
            .delete("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments/" + commentID)
            .set("Authorization", "Bearer " + reviewer.token)
            .expect(StatusCodes.FORBIDDEN);
    });

    it("returns ACCEPTED and deleted comment data on success", async () => {
        const { reviewer, gameID } = await setupReview();
        const commenter = await register(app, username2, displayName2, password2, email2);

        const createRes = await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments")
            .set("Authorization", "Bearer " + commenter.token)
            .send({ text: "to be deleted" })
            .expect(StatusCodes.CREATED);

        const commentID = createRes.body.data.id;

        const res = await request(app)
            .delete("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments/" + commentID)
            .set("Authorization", "Bearer " + commenter.token)
            .expect(StatusCodes.ACCEPTED);

        expect(res.body.status).toBe("success");
        expect(res.body.data.id).toBe(commentID);
        expect(res.body.data.text).toBe("to be deleted");
        expect(res.body.data.commentator).toBe(commenter.accountName);
    });

    it("returns NOT FOUND if trying to delete the same comment twice", async () => {
        const { reviewer, gameID } = await setupReview();
        const commenter = await register(app, username2, displayName2, password2, email2);

        const createRes = await request(app)
            .post("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments")
            .set("Authorization", "Bearer " + commenter.token)
            .send({ text: "to be deleted" })
            .expect(StatusCodes.CREATED);

        const commentID = createRes.body.data.id;

        await request(app)
            .delete("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments/" + commentID)
            .set("Authorization", "Bearer " + commenter.token)
            .expect(StatusCodes.ACCEPTED);

        await request(app)
            .delete("/api/reviews/" + reviewer.accountName + "/" + gameID + "/comments/" + commentID)
            .set("Authorization", "Bearer " + commenter.token)
            .expect(StatusCodes.NOT_FOUND);
    });
});
