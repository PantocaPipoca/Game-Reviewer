import { describe, it, expect } from "@jest/globals";
import { AccountService } from "../../../src/services/AccountService";
import { AuthResponse, UserFull, UserMe, UserPrivate, UserPublic } from "../../../src/types/Types";
import { makeSomeUser, UserMicro } from "../helper/helper";
import { UserRepository } from "../../../src/Repository/UserRepository";
import bcrypt from "bcrypt";

describe("AccountService (integration)", () => {
    // Utilities for this test
    const displayName: string = "Svc";
    const pass: string = "12345678";

    // Auxiliary function, creates and registers a user, returning the username and email
    async function makeSomeUserAndRegister(): Promise<UserMicro> {
        const user: UserMicro = makeSomeUser();
        await AccountService.registerUser(user.accountName, displayName, pass, user.email, false);
        return user;
    }

    // Auxiliary function, checks a user's name and email against expected values; password must not be its own hash
    function checkUserAux(target: UserFull | null, username: string, email: string): void {
        expect(target).not.toBeNull();
        expect(target?.accountName).toBe(username);
        expect(target?.email).toBe(email);
        expect(target?.passwordHash).not.toBe(pass);
    }

    it("RegisterUser creates a user and returns token, not with duplicate name or duplicate email", async () => {
        // Register user
        const user: UserMicro = makeSomeUser();
        const res: AuthResponse = (await AccountService.registerUser(
            user.accountName,
            displayName,
            pass,
            user.email,
            false
        )) as AuthResponse;

        // Check matching name and defined token
        expect(res.accountName).toBe(user.accountName);
        expect(res.isPrivate).toBe(false);
        expect(res.token).toBeDefined();

        // Check matching data
        const dbUser: UserFull | null = await UserRepository.selectUser(user.accountName);
        checkUserAux(dbUser, user.accountName, user.email);

        // Fails, duplicate user name
        await expect(
            AccountService.registerUser(user.accountName, displayName, pass, "blabla" + user.email, false)
        ).rejects.toBeDefined();
        // Fails, duplicate email
        await expect(
            AccountService.registerUser(user.accountName + "blabla", displayName, pass, user.email, false)
        ).rejects.toBeDefined();
    });

    it("Checks if email verification is working", async () => {
        const user: UserMicro = makeSomeUser();
        await AccountService.registerUser(user.accountName, displayName, pass, "support.gamereviewer@gmail.com", true);

        const userFull = await UserRepository.selectUser(user.accountName);
        expect(AccountService.verify(user.accountName, -1)).rejects.toBeDefined();
        expect(AccountService.verify(user.accountName, userFull?.emailValidation as number)).resolves.toBeDefined();
    });

    it("LoginUser fails with wrong passwords and non-existent users", async () => {
        // Register user
        const user: UserMicro = await makeSomeUserAndRegister();

        // Passes, correct password and existing user
        await expect(AccountService.loginUser(user.accountName, pass)).resolves.toBeDefined();
        // Passes, correct password and existing user (email)
        await expect(AccountService.loginUser(user.email, pass)).resolves.toBeDefined();
        // Fails, wrong password
        await expect(AccountService.loginUser(user.accountName, "wrongpass")).rejects.toBeDefined();
        // Fails, user doesn't exist
        await expect(AccountService.loginUser("notexists", pass)).rejects.toBeDefined();
    });

    it("AlterUser alters a user, not if duplicate email", async () => {
        // Register user
        const user: UserMicro = makeSomeUser();
        await AccountService.registerUser(user.accountName, displayName, "87654321", "svc@test.com", false);

        // Find user in database and their previous hash
        const dbUser1: UserFull | null = await UserRepository.selectUser(user.accountName);
        const prevPassHash: string | undefined = dbUser1?.passwordHash;

        // Alter user data and check the returned object
        const altered: UserMe = await AccountService.alterUser(
            user.accountName,
            true,
            user.email,
            { displayName, gender: null, bio: null },
            pass
        );
        expect(altered).not.toBeNull();
        expect(altered.accountName).toBe(user.accountName);
        expect(altered.isPrivate).toBe(true);

        // Check if data in the database matches expectations
        const dbUser2: UserFull | null = await UserRepository.selectUser(user.accountName);
        checkUserAux(dbUser2, user.accountName, user.email);
        expect(dbUser2?.passwordHash).not.toBe(prevPassHash);

        // Fails, duplicate email
        const otherEmail: string = "otheremail@test.com";
        await AccountService.registerUser("username2", "OTHER USER", "18273645", otherEmail, false);
        await expect(
            AccountService.alterUser(user.accountName, true, otherEmail, { displayName, gender: null, bio: null }, pass)
        ).rejects.toBeDefined();
    });

    it("DeleteUser removes a user", async () => {
        // Register user
        const user: UserMicro = await makeSomeUserAndRegister();

        // Find user in database and check its data
        const dbUser1: UserFull | null = await UserRepository.selectUser(user.accountName);
        checkUserAux(dbUser1, user.accountName, user.email);

        // Remove user and make sure it's gone from the database
        await AccountService.removeUser(user.accountName);
        const dbUser2: UserFull | null = await UserRepository.selectUser(user.accountName);
        expect(dbUser2).toBeNull();
    });

    it("checks grantPasswordReset is working", async () => {
        await UserRepository.insertUser({
            accountName: "test",
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
            accountName: "test",
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
                (await AccountService.registerUser(
                    user.accountName,
                    "display" + i,
                    "password" + i,
                    user.email,
                    false
                )) as AuthResponse
            );
        }

        // Check the result of findByUsername against all users
        for (var i = 0; i < size; i++) {
            const found: UserPublic | UserPrivate = await AccountService.findByUsername(users[i].accountName);
            expect(found).not.toBeNull();
            expect(found.accountName).toBe(users[i].accountName);
            expect(found.isPrivate).toBe(users[i].isPrivate);
        }
    });
});
