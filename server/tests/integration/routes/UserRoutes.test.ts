import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import bcrypt from "bcrypt";
import { createApp } from "../../../src/App.ts";
import { StatusCodes } from "http-status-codes";
import { Express } from "express";
import { register, createGame } from "../helper/helper.ts";
import { AuthResponse, UserData, UserFull } from "../../../src/types/Types.ts";
import { fetchFullUser } from "../../../src/services/AccountService.ts";

const app: Express = createApp();

// Jest docs: https://jestjs.io/docs/api

const username: string = "auth_test_" + Date.now();
const password: string = "12345678";
const displayName: string = "User Display Name";
const email: string = username + "@test.com";

// =============== Register User ===============

describe("POST /api/users (register)", () => {
    it("returns 201", async () => {
        const res = await request(app)
            .post("/api/users")
            .send({
                accountName: username,
                displayName,
                password,
                email,
            })
            .expect(StatusCodes.CREATED);

        expect(res.body.status).toBe("success");
        // put in validation
        // expect(res.body.data.accountName).toBe(username);
        // expect(res.body.data.isPrivate).toBe(false);
        // expect(res.body.data.userData.displayName).toBe(displayName);
        // expect(res.body.data.token).toBeDefined();
    });

    describe("validation BAD REQUESTS (400)", () => {
        it("missing accountName", async () => {
            await request(app)
                .post("/api/users")
                .send({ displayName, password, email })
                .expect(StatusCodes.BAD_REQUEST);
        });

        it("missing displayName", async () => {
            await request(app)
                .post("/api/users")
                .send({ accountName: "user" + Date.now(), password, email })
                .expect(StatusCodes.BAD_REQUEST);
        });

        it("missing password", async () => {
            await request(app)
                .post("/api/users")
                .send({ accountName: "user" + Date.now(), displayName, email })
                .expect(StatusCodes.BAD_REQUEST);
        });

        it("missing email", async () => {
            await request(app)
                .post("/api/users")
                .send({ accountName: "user" + Date.now(), displayName, password })
                .expect(StatusCodes.BAD_REQUEST);
        });

        it("accountName shorter than 3", async () => {
            await request(app)
                .post("/api/users")
                .send({
                    accountName: "us",
                    displayName,
                    password,
                    email,
                })
                .expect(StatusCodes.BAD_REQUEST);
        });

        it("password shorter than 8", async () => {
            const u = "user_shortpw" + Date.now();
            await request(app)
                .post("/api/users")
                .send({
                    accountName: u,
                    displayName,
                    password: "1234567",
                    email: email,
                })
                .expect(StatusCodes.BAD_REQUEST);
        });

        it("invalid email", async () => {
            await request(app)
                .post("/api/users")
                .send({
                    accountName: "user_badmail",
                    displayName,
                    password,
                    email: "not-an-email",
                })
                .expect(StatusCodes.BAD_REQUEST);
        });
    });

    describe("conflicts (409)", () => {
        it("duplicate accountName", async () => {
            await register(app, username, displayName, password, email);

            await request(app)
                .post("/api/users")
                .send({
                    accountName: username,
                    displayName,
                    password,
                    email: username + "2@test.com",
                })
                .expect(StatusCodes.CONFLICT);
        });

        it("duplicate email", async () => {
            await register(app, username, displayName, password, email);

            await request(app)
                .post("/api/users")
                .send({
                    accountName: username + "2",
                    displayName,
                    password,
                    email,
                })
                .expect(StatusCodes.CONFLICT);
        });
    });
});

// =============== Login ===============

describe("POST /api/users/login", () => {
    it("returns OK and a token", async () => {
        await register(app, username, displayName, password, email);

        const res = await request(app)
            .post("/api/users/login")
            .send({ accountName: username, password })
            .expect(StatusCodes.OK);

        expect(res.body.status).toBe("success");
        expect(res.body.data.accountName).toBe(username);
        expect(res.body.data.token).toBeDefined();
    });

    describe("validation BAD REQUESTS (400)", () => {
        it("missing accountName", async () => {
            await request(app).post("/api/users/login").send({ password }).expect(StatusCodes.BAD_REQUEST);
        });

        it("missing password", async () => {
            await request(app).post("/api/users/login").send({ accountName: username }).expect(StatusCodes.BAD_REQUEST);
        });
    });

    describe("auth errors", () => {
        it("user NOT FOUND (404)", async () => {
            await request(app)
                .post("/api/users/login")
                .send({ accountName: "no_user_has_this_name", password })
                .expect(StatusCodes.UNAUTHORIZED);
        });

        it("wrong password (UNAUTHORIZED)", async () => {
            await register(app, username, displayName, password, email);

            await request(app)
                .post("/api/users/login")
                .send({ accountName: username, password: "wrong_pass" })
                .expect(StatusCodes.UNAUTHORIZED);
        });
    });
});

// =============== Logout ===============

describe("POST /api/users/logout", () => {
    it("returns UNAUTHORIZED if not authenticated", async () => {
        await request(app).post("/api/users/logout").expect(StatusCodes.UNAUTHORIZED);
    });

    it("returns OK", async () => {
        const user: AuthResponse = await register(app, username, displayName, password, email);
        const token: string = user.token;

        await request(app)
            .post("/api/users/logout")
            .set("Authorization", "Bearer " + token)
            .expect(StatusCodes.OK);
    });
});

// =============== Current User ===============

describe("GET /api/users/me", () => {
    it("returns UNAUTHORIZED if not authenticated", async () => {
        await request(app).get("/api/users/me").expect(StatusCodes.UNAUTHORIZED);
    });

    it("returns 200 and current user data with Bearer token", async () => {
        const user: AuthResponse = await register(app, username, displayName, password, email);
        const token: string = user.token;

        const res = await request(app)
            .get("/api/users/me")
            .set("Authorization", "Bearer " + token)
            .expect(StatusCodes.OK);

        expect(res.body.status).toBe("success");
        expect(res.body.data.accountName).toBe(user.accountName);
        expect(res.body.data.isPrivate).toBeDefined();

        expect(res.body.data.userData).toBeDefined();
        expect(res.body.data.createdAt).toBeDefined();

        expect(res.body.data.token).toBeUndefined();
    });
});

describe("PUT /api/users/me (alter)", () => {
    it("returns UNAUTHORIZED if not authenticated", async () => {
        await request(app)
            .put("/api/users/me")
            .set("Content-Type", "application/json")
            .send({ isPrivate: false, email: email, userData: { displayName, gender: null, bio: null } })
            .expect(StatusCodes.UNAUTHORIZED);
    });

    it("BAD REQUEST if password is shorter than 8", async () => {
        const user: AuthResponse = await register(app, username, displayName, password, email);

        await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + user.token)
            .send({
                isPrivate: true,
                email: email,
                userData: { displayName, gender: null, bio: null },
                password: "1234567",
            })
            .expect(StatusCodes.BAD_REQUEST);
    });

    it("BAD REQUEST if email is invalid", async () => {
        const user: AuthResponse = await register(app, username, displayName, password, email);

        await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + user.token)
            .send({
                isPrivate: true,
                email: "invalid-email",
                userData: { displayName, gender: null, bio: null },
            })
            .expect(StatusCodes.BAD_REQUEST);
    });

    it("BAD REQUEST if password or email is incorrect type", async () => {
        const user: AuthResponse = await register(app, username, displayName, password, email);
        const token: string = user.token;

        await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + token)
            .send({
                isPrivate: true,
                email: "invalid-email",
                userData: { displayName, gender: null, bio: null },
                password: 12345678,
            })
            .expect(StatusCodes.BAD_REQUEST);

        await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + token)
            .send({
                isPrivate: true,
                email: 12345679,
                userData: { displayName, gender: null, bio: null },
            })
            .expect(StatusCodes.BAD_REQUEST);
    });

    it("OK when updating isPrivate and other valid fields", async () => {
        const user: AuthResponse = await register(app, username, displayName, password, email);
        const newDisplayName: string = "new display name";
        const newPassword: string = "12345678";
        const newEmail: string = "new-email@email.com";

        const res = await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + user.token)
            .send({
                isPrivate: true,
                email: newEmail,
                password: newPassword,
                userData: { displayName: newDisplayName, gender: null, bio: null },
            })
            .expect(StatusCodes.OK);

        const userFull: UserFull = await fetchFullUser(user.accountName);

        const currentUserData: UserData = userFull.userData as UserData;

        expect(userFull.isPrivate).toBe(true);
        expect(await bcrypt.compare(newPassword, userFull.passwordHash)).toBe(true);
        expect(userFull.email).toBe(newEmail);
        expect(currentUserData.displayName).toBe(newDisplayName);

        expect(res.body.data.isPrivate).toBe(true);
        expect(res.body.data.userData.displayName).toBe(newDisplayName);
    });
});

describe("DELETE /api/users/me", () => {
    it("returns UNAUTHORIZED if not authenticated", async () => {
        await request(app).delete("/api/users/me").expect(StatusCodes.UNAUTHORIZED);
    });

    it("returns 200 and current user data with Bearer token", async () => {
        const user: AuthResponse = await register(app, username, displayName, password, email);
        const token: string = user.token;

        await request(app)
            .delete("/api/users/me")
            .set("Authorization", "Bearer " + token)
            .expect(StatusCodes.OK);
    });

    it("returns 401 if using token after deletion", async () => {
        const user: AuthResponse = await register(app, username, displayName, password, email);
        const token: string = user.token;

        await request(app)
            .delete("/api/users/me")
            .set("Authorization", "Bearer " + token)
            .expect(StatusCodes.OK);

        await request(app)
            .get("/api/users/me")
            .set("Authorization", "Bearer " + token)
            .expect(StatusCodes.UNAUTHORIZED);
    });
});

// ========== SEARCH ==========

describe("GET /api/users/id/:username (find profile)", () => {
    it("returns NOT FOUND if user doesn't exist", async () => {
        await request(app).get("/api/users/id/not-existing-user").expect(StatusCodes.NOT_FOUND);
    });

    it("returns OK and full public data if user is public (no auth)", async () => {
        const u: AuthResponse = await register(app, username, displayName, password, email);

        const res = await request(app)
            .get("/api/users/id/" + u.accountName)
            .expect(StatusCodes.OK);

        expect(res.body.status).toBe("success");
        expect(res.body.data.accountName).toBe(u.accountName);
        expect(res.body.data.userData).toBeDefined();
        expect(res.body.data.createdAt).toBeDefined();
    });

    it("returns OK but hides userData/createdAt for private user when not following", async () => {
        const u: AuthResponse = await register(app, username, displayName, password, email);

        await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + u.token)
            .send({
                isPrivate: true,
                email,
                userData: { displayName, gender: "", bio: "" },
            })
            .expect(StatusCodes.OK);

        const res = await request(app)
            .get("/api/users/id/" + u.accountName)
            .expect(StatusCodes.OK);

        expect(res.body.status).toBe("success");
        expect(res.body.data.accountName).toBe(u.accountName);
        expect(res.body.data.isPrivate).toBe(true);
        expect(res.body.data.userData).toBeUndefined();
        expect(res.body.data.createdAt).toBeUndefined();
    });

    it("returns OK and shows private profile to self (auth)", async () => {
        const u: AuthResponse = await register(app, username, displayName, password, email);

        await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + u.token)
            .send({
                isPrivate: true,
                email,
                userData: { displayName, gender: "", bio: "" },
            })
            .expect(StatusCodes.OK);

        const res = await request(app)
            .get("/api/users/id/" + u.accountName)
            .set("Authorization", "Bearer " + u.token)
            .expect(StatusCodes.OK);

        expect(res.body.data.userData).toBeDefined();
        expect(res.body.data.createdAt).toBeDefined();
    });

    it("returns OK and shows private profile to follower (auth)", async () => {
        const u: AuthResponse = await register(app, username, displayName, password, email);
        const follower: AuthResponse = await register(app, "user2", "user2", "sspassword", "u2@email.com");

        await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + u.token)
            .send({
                isPrivate: true,
                email,
                userData: { displayName, gender: "", bio: "" },
            })
            .expect(StatusCodes.OK);

        await request(app)
            .post("/api/users/id/" + u.accountName + "/followers/")
            .set("Authorization", "Bearer " + follower.token)
            .expect(StatusCodes.CREATED);

        // accept request
        await request(app)
            .put("/api/users/me/followers/requests/received/" + follower.accountName)
            .set("Authorization", "Bearer " + u.token)
            .expect(StatusCodes.ACCEPTED);

        const res = await request(app)
            .get("/api/users/id/" + u.accountName)
            .set("Authorization", "Bearer " + follower.token)
            .expect(StatusCodes.OK);

        expect(res.body.data.isPrivate).toBe(true);
        expect(res.body.data.userData).toBeDefined();
        expect(res.body.data.createdAt).toBeDefined();
    });
});

// ========== SEARCH ==========

describe("GET /api/users/search?query=...", () => {
    it("returns 400 if query is missing", async () => {
        await request(app).get("/api/users/search").expect(StatusCodes.BAD_REQUEST);
    });

    it("returns 400 if query is not a string (e.g. query[]=x)", async () => {
        await request(app).get("/api/users/search?query[]=x").expect(StatusCodes.BAD_REQUEST);
    });

    it("returns 200 and array for a valid query", async () => {
        const u: AuthResponse = await register(app, username, displayName, password, email);

        const res = await request(app)
            .get("/api/users/search?query=" + u.accountName.slice(0, 4))
            .expect(StatusCodes.OK);

        expect(res.body.status).toBe("success");
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data[0].accountName).toBe(u.accountName);
        expect(res.body.data[0].userData.displayName).toBe(u.userData!.displayName);
    });

    it("only shows username if it's private account", async () => {
        const u: AuthResponse = await register(app, username, displayName, password, email);

        await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + u.token)
            .send({
                isPrivate: true,
                email,
                userData: { displayName, gender: "", bio: "" },
            })
            .expect(StatusCodes.OK);

        const res = await request(app)
            .get("/api/users/search?query=" + u.accountName.slice(0, 4))
            .expect(StatusCodes.OK);

        expect(res.body.status).toBe("success");
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data[0].accountName).toBe(u.accountName);
        expect(res.body.data[0].userData).toBeUndefined();
    });
});

// =============== FOLLOWERS ===============

describe("GET /api/users/me/followers/requests/received", () => {
    it("returns UNAUTHORIZED if not authenticated", async () => {
        await request(app).get("/api/users/me/followers/requests/received").expect(StatusCodes.UNAUTHORIZED);
    });

    it("returns 200 and current user data with Bearer token", async () => {
        const user: AuthResponse = await register(app, username, displayName, password, email);
        const token: string = user.token;

        await request(app)
            .get("/api/users/me/followers/requests/received")
            .set("Authorization", "Bearer " + token)
            .expect(StatusCodes.OK);
    });
});

describe("GET /api/users/me/followers/requests/sent", () => {
    it("returns UNAUTHORIZED if not authenticated", async () => {
        await request(app).get("/api/users/me/followers/requests/sent").expect(StatusCodes.UNAUTHORIZED);
    });

    it("returns 200 and current user data with Bearer token", async () => {
        const user = await register(app, username, displayName, password, email);
        const token = user.token;

        await request(app)
            .get("/api/users/me/followers/requests/sent")
            .set("Authorization", "Bearer " + token)
            .expect(StatusCodes.OK);
    });
});

describe("PUT /api/users/me/followers/requests/received/:username", () => {
    it("returns UNAUTHORIZED if not authenticated", async () => {
        await request(app).put("/api/users/me/followers/requests/received/:username").expect(StatusCodes.UNAUTHORIZED);
    });

    it("returns 404 if user doesn't exist", async () => {
        const user: AuthResponse = await register(app, username, displayName, password, email);
        const token: string = user.token;

        await request(app)
            .put("/api/users/me/followers/requests/received/not-existing-user")
            .set("Authorization", "Bearer " + token)
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns 400 if user didn't request", async () => {
        const user: AuthResponse = await register(app, username, displayName, password, email);
        const user2: AuthResponse = await register(app, "user2", "user2", "sspassword", "u2@email.com");
        const token: string = user.token;

        await request(app)
            .put("/api/users/me/followers/requests/received/" + user2.accountName)
            .set("Authorization", "Bearer " + token)
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns CONFLICT if the request is already accepted", async () => {
        const user: AuthResponse = await register(app, username, displayName, password, email);
        const user2: AuthResponse = await register(app, "user2", "user2", "sspassword", "u2@email.com");

        // put user2 as private
        await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + user2.token)
            .send({
                isPrivate: true,
                email: "u2@email.com",
                userData: { displayName, gender: "", bio: "" },
            })
            .expect(StatusCodes.OK);

        // user sends request to user2
        await request(app)
            .post("/api/users/id/" + user2.accountName + "/followers/")
            .set("Authorization", "Bearer " + user.token);

        //user2 accepts request
        await request(app)
            .put("/api/users/me/followers/requests/received/" + user.accountName)
            .set("Authorization", "Bearer " + user2.token)
            .expect(StatusCodes.ACCEPTED);

        await request(app)
            .put("/api/users/me/followers/requests/received/" + user.accountName)
            .set("Authorization", "Bearer " + user2.token)
            .expect(StatusCodes.CONFLICT);
    });

    it("returns OK and current user data with Bearer token", async () => {
        const user: AuthResponse = await register(app, username, displayName, password, email);
        const user2: AuthResponse = await register(app, "user2", "user2", "sspassword", "u2@email.com");

        // put user2 as private
        await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + user2.token)
            .send({
                isPrivate: true,
                email: "u2@email.com",
                userData: { displayName, gender: "", bio: "" },
            })
            .expect(StatusCodes.OK);

        // user sends request to user2
        const res = await request(app)
            .post("/api/users/id/" + user2.accountName + "/followers/")
            .set("Authorization", "Bearer " + user.token);

        expect(res.status).toBe(StatusCodes.CREATED);

        //user2 accepts request
        await request(app)
            .put("/api/users/me/followers/requests/received/" + user.accountName)
            .set("Authorization", "Bearer " + user2.token)
            .expect(StatusCodes.ACCEPTED);
    });
});

describe("DELETE /api/users/me/followers/requests/received/:username", () => {
    it("returns UNAUTHORIZED if not authenticated", async () => {
        await request(app).delete("/api/users/me/followers/requests/received/no-auth").expect(StatusCodes.UNAUTHORIZED);
    });

    it("returns 404 if user doesn't exist", async () => {
        const user: AuthResponse = await register(app, username, displayName, password, email);

        await request(app)
            .delete("/api/users/me/followers/requests/received/not-existing-user")
            .set("Authorization", "Bearer " + user.token)
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns 404 if user didn't request", async () => {
        const target: AuthResponse = await register(app, username, displayName, password, email);
        const follower: AuthResponse = await register(app, "user2", "user2", "sspassword", "u2@email.com");

        await request(app)
            .delete("/api/users/me/followers/requests/received/" + follower.accountName)
            .set("Authorization", "Bearer " + target.token)
            .expect(StatusCodes.NOT_FOUND);
    });

    it("returns 202 when rejecting an existing request", async () => {
        const target = await register(app, username, displayName, password, email);
        const follower = await register(app, "user2", "user2", "sspassword", "u2@email.com");

        await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + target.token)
            .send({
                isPrivate: true,
                email,
                userData: { displayName, gender: "", bio: "" },
            })
            .expect(StatusCodes.OK);

        // follower request to target
        await request(app)
            .post("/api/users/id/" + target.accountName + "/followers/")
            .set("Authorization", "Bearer " + follower.token)
            .expect(StatusCodes.CREATED);

        // target rejects
        await request(app)
            .delete("/api/users/me/followers/requests/received/" + follower.accountName)
            .set("Authorization", "Bearer " + target.token)
            .expect(StatusCodes.ACCEPTED);
    });
});

describe("GET /api/users/id/:username/following", () => {
    it("returns NOT FOUND if user doesn't exist", async () => {
        await request(app).get("/api/users/id/not-existing-user/following").expect(StatusCodes.NOT_FOUND);
    });

    it("returns FORBIDDEN if user is private and not authenticated", async () => {
        const user1 = await register(app, username, displayName, password, email);
        const user2name = "user2_" + Date.now();
        const user2 = await register(app, user2name, "user2", "sspassword", `${user2name}@email.com`);

        await request(app)
            .post("/api/users/id/" + user2.accountName + "/followers/")
            .set("Authorization", "Bearer " + user1.token)
            .expect(StatusCodes.CREATED);

        // user1 private
        await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + user1.token)
            .send({
                isPrivate: true,
                email,
                userData: { displayName, gender: "", bio: "" },
            })
            .expect(StatusCodes.OK);

        await request(app)
            .get("/api/users/id/" + user1.accountName + "/following")
            .expect(StatusCodes.FORBIDDEN);
    });

    it("returns OK and following list for public user (no auth)", async () => {
        const user1 = await register(app, username, displayName, password, email);
        const user2name = "user2_" + Date.now();
        const user2 = await register(app, user2name, "user2", "sspassword", `${user2name}@email.com`);

        // user1 follows user2
        await request(app)
            .post("/api/users/id/" + user2.accountName + "/followers/")
            .set("Authorization", "Bearer " + user1.token)
            .expect(StatusCodes.CREATED);

        const res = await request(app)
            .get("/api/users/id/" + user1.accountName + "/following")
            .expect(StatusCodes.OK);

        expect(res.body.status).toBe("success");
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].follows).toBe(user1.accountName);
        expect(res.body.data[0].followed).toBe(user2.accountName);
    });

    it("returns OK and following list for private user (self auth)", async () => {
        const user1 = await register(app, username, displayName, password, email);
        const user2name = "user2_" + Date.now();
        const user2 = await register(app, user2name, "user2", "sspassword", `${user2name}@email.com`);

        // user1 follows user2
        await request(app)
            .post("/api/users/id/" + user2.accountName + "/followers/")
            .set("Authorization", "Bearer " + user1.token)
            .expect(StatusCodes.CREATED);

        // user1 private
        await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + user1.token)
            .send({
                isPrivate: true,
                email,
                userData: { displayName, gender: "", bio: "" },
            })
            .expect(StatusCodes.OK);

        const res = await request(app)
            .get("/api/users/id/" + user1.accountName + "/following")
            .set("Authorization", "Bearer " + user1.token)
            .expect(StatusCodes.OK);

        expect(res.body.status).toBe("success");
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].follows).toBe(user1.accountName);
        expect(res.body.data[0].followed).toBe(user2.accountName);
    });

    it("returns OK and following list for private user (viewer is accepted follower)", async () => {
        const target = await register(app, username, displayName, password, email);
        const viewerName = "viewer_" + Date.now();
        const viewer = await register(app, viewerName, "viewer", "sspassword", `${viewerName}@email.com`);

        // target private
        await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + target.token)
            .send({
                isPrivate: true,
                email,
                userData: { displayName, gender: "", bio: "" },
            })
            .expect(StatusCodes.OK);

        // someone that target follows
        const someoneName = "someone_" + Date.now();
        const someone = await register(app, someoneName, "someone", "sspassword", `${someoneName}@email.com`);

        await request(app)
            .post("/api/users/id/" + someone.accountName + "/followers/")
            .set("Authorization", "Bearer " + target.token)
            .expect(StatusCodes.CREATED);

        // viewer requests follow
        await request(app)
            .post("/api/users/id/" + target.accountName + "/followers/")
            .set("Authorization", "Bearer " + viewer.token)
            .expect(StatusCodes.CREATED);

        // target accepts
        await request(app)
            .put("/api/users/me/followers/requests/received/" + viewer.accountName)
            .set("Authorization", "Bearer " + target.token)
            .expect(StatusCodes.ACCEPTED);

        const res = await request(app)
            .get("/api/users/id/" + target.accountName + "/following")
            .set("Authorization", "Bearer " + viewer.token)
            .expect(StatusCodes.OK);

        expect(res.body.status).toBe("success");
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });
});

// =============== REVIEWS ===============

describe("GET /api/users/id/:username/reviews", () => {
    it("returns NOT FOUND if user doesn't exist", async () => {
        await request(app).get("/api/users/id/not-existing-user/reviews").expect(StatusCodes.NOT_FOUND);
    });

    it("returns OK and empty array when user has no reviews (public, no auth)", async () => {
        const name = "u_" + Date.now();
        const u = await register(app, name, displayName, password, name + "@test.com");

        const res = await request(app)
            .get("/api/users/id/" + u.accountName + "/reviews")
            .expect(StatusCodes.OK);

        expect(res.body.status).toBe("success");
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data).toHaveLength(0);
    });

    it("returns OK and array with reviews (public, no auth)", async () => {
        const name = "u_" + Date.now();
        const u = await register(app, name, displayName, password, `${name}@test.com`);

        const game = await createGame();

        await request(app)
            .post("/api/games/id/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + u.token)
            .send({ text: "nice", score: 8 })
            .expect(StatusCodes.CREATED);

        const res = await request(app)
            .get("/api/users/id/" + u.accountName + "/reviews")
            .expect(StatusCodes.OK);

        expect(res.body.status).toBe("success");
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.data[0].reviewer).toBe(u.accountName);
        expect(res.body.data[0].reviewed).toBe(game.gameID);
    });

    it("returns FORBIDDEN and empty array if user is private and requester not allowed (no auth)", async () => {
        const name = "priv_" + Date.now();
        const u = await register(app, name, displayName, password, name + "@test.com");

        await request(app)
            .put("/api/users/me")
            .set("Authorization", "Bearer " + u.token)
            .send({
                isPrivate: true,
                email,
                userData: { displayName, gender: "", bio: "" },
            })
            .expect(StatusCodes.OK);

        const game = await createGame();

        await request(app)
            .post("/api/games/id/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + u.token)
            .send({ text: "nice", score: 8 })
            .expect(StatusCodes.CREATED);

        await request(app)
            .get("/api/users/id/" + u.accountName + "/reviews")
            .expect(StatusCodes.FORBIDDEN);
    });

    it("returns OK and reviews if user is private but requester is accepted follower", async () => {
        const targetName = "target_" + Date.now();
        const target = await register(app, targetName, displayName, password, `${targetName}@test.com`);

        const viewerName = "viewer_" + Date.now();
        const viewer = await register(app, viewerName, "Viewer", password, `${viewerName}@test.com`);

        await request(app)
            .put("/api/users/me")
            .set("Authorization", `Bearer ${target.token}`)
            .send({
                isPrivate: true,
                email,
                userData: { displayName, gender: "", bio: "" },
            })
            .expect(StatusCodes.OK);

        const game = await createGame();

        await request(app)
            .post("/api/games/id/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + target.token)
            .send({ text: "private review", score: 7 })
            .expect(StatusCodes.CREATED);

        await request(app)
            .post("/api/users/id/" + target.accountName + "/followers/")
            .set("Authorization", "Bearer " + viewer.token)
            .expect(StatusCodes.CREATED);

        await request(app)
            .put("/api/users/me/followers/requests/received/" + viewer.accountName)
            .set("Authorization", "Bearer " + target.token)
            .expect(StatusCodes.ACCEPTED);

        const res = await request(app)
            .get("/api/users/id/" + target.accountName + "/reviews")
            .set("Authorization", "Bearer " + viewer.token)
            .expect(StatusCodes.OK);

        expect(res.body.status).toBe("success");
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.data[0].reviewer).toBe(target.accountName);
        expect(res.body.data[0].reviewed).toBe(game.gameID);
    });

    it("returns OK and reviews if viewer is also target", async () => {
        const target = await register(app, username, displayName, password, email);

        const game = await createGame();

        await request(app)
            .post("/api/games/id/" + game.gameID + "/reviews")
            .set("Authorization", "Bearer " + target.token)
            .send({ text: "private review", score: 7 })
            .expect(StatusCodes.CREATED);

        await request(app)
            .get("/api/users/id/" + target.accountName + "/reviews")
            .set("Authorization", "Bearer " + target.token)
            .expect(StatusCodes.OK);
    });

    describe("DELETE /api/users/me/followers/:username", () => {
        it("returns UNAUTHORIZED if not authenticated", async () => {
            await request(app).delete("/api/users/me/followers/someone").expect(StatusCodes.UNAUTHORIZED);
        });

        it("returns 404 if the target user doesn't exist", async () => {
            const user = await register(app, username, displayName, password, email);

            await request(app)
                .delete("/api/users/me/followers/not-existing-user")
                .set("Authorization", "Bearer " + user.token)
                .expect(StatusCodes.NOT_FOUND);
        });

        it("returns 404 if the target user is not a follower", async () => {
            const user = await register(app, username, displayName, password, email);
            const otherName = "other_" + Date.now();
            const other = await register(app, otherName, "Other", password, `${otherName}@test.com`);

            await request(app)
                .delete("/api/users/me/followers/" + other.accountName)
                .set("Authorization", "Bearer " + user.token)
                .expect(StatusCodes.NOT_FOUND);
        });

        it("returns 202 and removes an accepted follower", async () => {
            const user = await register(app, username, displayName, password, email);
            const followerName = "flwr_" + Date.now();
            const follower = await register(app, followerName, "Follower", password, `${followerName}@test.com`);

            // follower follows user (public account → auto-accepted)
            await request(app)
                .post("/api/users/id/" + user.accountName + "/followers/")
                .set("Authorization", "Bearer " + follower.token)
                .expect(StatusCodes.CREATED);

            // user removes follower
            const res = await request(app)
                .delete("/api/users/me/followers/" + follower.accountName)
                .set("Authorization", "Bearer " + user.token)
                .expect(StatusCodes.ACCEPTED);

            expect(res.body.status).toBe("success");
            expect(res.body.data.follows).toBe(follower.accountName);
            expect(res.body.data.followed).toBe(user.accountName);

            // confirm they no longer appear in followers list
            const followersRes = await request(app)
                .get("/api/users/id/" + user.accountName + "/followers")
                .expect(StatusCodes.OK);

            expect(followersRes.body.data.find((f: any) => f.follows === follower.accountName)).toBeUndefined();
        });

        it("returns 202 and removes a pending follower request (private account)", async () => {
            const user = await register(app, username, displayName, password, email);
            const requesterName = "req_" + Date.now();
            const requester = await register(app, requesterName, "Requester", password, `${requesterName}@test.com`);

            // make user private
            await request(app)
                .put("/api/users/me")
                .set("Authorization", "Bearer " + user.token)
                .send({
                    isPrivate: true,
                    email,
                    userData: { displayName, gender: "", bio: "" },
                })
                .expect(StatusCodes.OK);

            // requester sends follow request (pending, not accepted)
            await request(app)
                .post("/api/users/id/" + user.accountName + "/followers/")
                .set("Authorization", "Bearer " + requester.token)
                .expect(StatusCodes.CREATED);

            // user dismisses the pending request via this route
            const res = await request(app)
                .delete("/api/users/me/followers/" + requester.accountName)
                .set("Authorization", "Bearer " + user.token)
                .expect(StatusCodes.ACCEPTED);

            expect(res.body.status).toBe("success");
            expect(res.body.data.follows).toBe(requester.accountName);
        });
    });
});
