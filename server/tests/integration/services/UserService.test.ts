import { describe, it, expect } from "@jest/globals";
import { AccountService } from "../../../src/services/UserService";
import { AuthResponse, UserFull, UserMe, UserPrivate, UserPublic } from "../../../src/types/Types";
import { fastCreateUser, fastCreateUserAndValidate, makeSomeUser, register, UserMicro } from "../helper/helper";
import { UserRepository } from "../../../src/Repository/UserRepository";
import bcrypt from "bcrypt";
import { createApp } from "../../../src/App";

describe("AccountService (integration)", () => {
    // Utilities for this test
    const displayName: string = "Svc";
    const pass: string = "12345678";

    // Auxiliary function, creates and registers a user, returning the username and email
    // (pass is gonna be same as username)
    async function makeSomeUserAndRegister(): Promise<UserMicro> {
        const user: UserMicro = makeSomeUser();
        const fullUser: UserFull = await fastCreateUserAndValidate(user.username);
        return { username: fullUser.username, email: fullUser.email };
    }

    // Auxiliary function, checks a user's name and email against expected values; password must not be its own hash
    function checkUserAux(target: UserFull | null, username: string, email: string): void {
        expect(target).not.toBeNull();
        expect(target?.username).toBe(username);
        expect(target?.email).toBe(email);
        expect(target?.passwordHash).not.toBe(pass);
    }

    it("RegisterUser creates a user and returns token, not with duplicate name or duplicate email", async () => {
        // Register user
        const user: UserMicro = makeSomeUser();
        const res: AuthResponse = (await AccountService.registerUser(
            user.username,
            displayName,
            pass,
            user.email,
            false
        )) as AuthResponse;

        // Check matching name and defined token
        expect(res.username).toBe(user.username);
        expect(res.isPrivate).toBe(false);
        expect(res.token).toBeDefined();

        // Check matching data
        const dbUser: UserFull | null = await UserRepository.selectUser(user.username);
        checkUserAux(dbUser, user.username, user.email);

        // Fails, duplicate user name
        await expect(
            AccountService.registerUser(user.username, displayName, pass, "blabla" + user.email, false)
        ).rejects.toBeDefined();
        // Fails, duplicate email
        await expect(
            AccountService.registerUser(user.username + "blabla", displayName, pass, user.email, false)
        ).rejects.toBeDefined();
    });

    it("Checks if email verification is working", async () => {
        const user: UserFull = await fastCreateUser("test");

        expect(AccountService.verify(user.username, -1)).rejects.toBeDefined();
        expect(AccountService.verify(user.username, user?.emailValidation as number)).resolves.toBeDefined();
    });

    it("LoginUser fails with wrong passwords and non-existent users", async () => {
        // Register user
        const user: UserMicro = await makeSomeUserAndRegister();

        // Passes, correct password and existing user
        await expect(AccountService.loginUser(user.username, user.username)).resolves.toBeDefined();
        // Passes, correct password and existing user (email)
        await expect(AccountService.loginUser(user.email, user.username)).resolves.toBeDefined();
        // Fails, wrong password
        await expect(AccountService.loginUser(user.username, "wrongpass")).rejects.toBeDefined();
        // Fails, user doesn't exist
        await expect(AccountService.loginUser("notexists", user.username)).rejects.toBeDefined();
    });

    it("AlterUser alters a user, not if duplicate email", async () => {
        // Register user
        const user: UserFull = await fastCreateUser("test1");

        // Find previous hash
        const prevPassHash: string | undefined = user?.passwordHash;

        // Alter user data and check the returned object
        const altered: UserMe = await AccountService.updateUser(
            user.username,
            true,
            user.email,
            { displayName, gender: null, bio: null },
            pass
        );
        expect(altered).not.toBeNull();
        expect(altered.username).toBe(user.username);
        expect(altered.isPrivate).toBe(true);

        // Check if data in the database matches expectations
        const selectedAltered: UserFull | null = await UserRepository.selectUser(user.username);
        checkUserAux(selectedAltered, user.username, user.email);
        expect(selectedAltered?.passwordHash).not.toBe(prevPassHash);

        // Fails, duplicate email
        const otherEmail: string = "otheremail@test.com";
        await AccountService.registerUser("username2", "OTHER USER", "18273645", otherEmail, false);
        await expect(
            AccountService.updateUser(user.username, true, otherEmail, { displayName, gender: null, bio: null }, pass)
        ).rejects.toBeDefined();
    });

    it("DeleteUser removes a user", async () => {
        // Register user
        const user: UserMicro = await makeSomeUserAndRegister();

        // Find user in database and check its data
        const dbUser1: UserFull | null = await UserRepository.selectUser(user.username);
        checkUserAux(dbUser1, user.username, user.email);

        // Remove user and make sure it's gone from the database
        await AccountService.removeUser(user.username);
        const dbUser2: UserFull | null = await UserRepository.selectUser(user.username);
        expect(dbUser2).toBeNull();
    });

    it("checks grantPasswordReset is working", async () => {
        await UserRepository.insertUser({
            username: "test",
            email: "test@test.com",
            passwordHash: "brrrrr",
            avatar: null,
            isPrivate: false,
            userData: {
                displayName: "test",
                gender: null,
                bio: null,
            },
        });

        const code: number = await AccountService.grantPasswordReset("test", false);

        const user: UserFull | null = await UserRepository.selectUser("test");

        if (user === null) {
            throw new Error("if you are reading this we are having a joints problem on prisma");
        }

        expect(code).toBe(user.passwordRecover);
    });

    it("checks usePasswordReset is working", async () => {
        const SALT_ROUNDS = 10;
        await UserRepository.insertUser({
            username: "test",
            email: "test@test.com",
            passwordHash: "brrrrr",
            avatar: null,
            isPrivate: false,
            userData: {
                displayName: "test",
                gender: null,
                bio: null,
            },
        });

        await UserRepository.grantPasswordReset("test", 123);

        await AccountService.usePasswordReset("test", 123, "test1");

        const user: UserFull | null = await UserRepository.selectUser("test");

        if (user === null) {
            throw new Error("if you are reading this we are having a joints problem on prisma");
        }

        expect(await bcrypt.compare("test1", user.passwordHash)).toBeTruthy();
    });

    it("FindByUsername correctly finds a user, not if non-existent", async () => {
        const users: UserPublic[] = [];
        const size: number = 8;
        // Register several users
        for (var i = 0; i < size; i++) {
            const user: UserMicro = makeSomeUser();
            users.push(
                (await register(createApp(), user.username, "display" + i, "password" + i, user.email)) as AuthResponse
            );
        }

        // Check the result of findByUsername against all users
        for (var i = 0; i < size; i++) {
            const found: UserPublic | UserPrivate = await AccountService.findByUsername(users[i].username);
            expect(found).not.toBeNull();
            expect(found.username).toBe(users[i].username);
            expect(found.isPrivate).toBe(users[i].isPrivate);
        }
    });
});
