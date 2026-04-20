// DONE
import { describe, it, expect } from "@jest/globals";
import { AccountService } from "../../../src/services/AccountService";
import { AuthResponse, UserFull, UserMe, UserPrivate, UserPublic } from "../../../src/types/Types";
import { fastCreateUser, fastCreateUserAndValidate, makeSomeUser, UserMicro } from "../helper/helper";
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

    // it("RegisterUser creates a user and returns token, not with duplicate name or duplicate email", async () => {
    //     // Register user
    //     const user: UserMicro = makeSomeUser();
    //     const res: AuthResponse = (await AccountService.registerUser(
    //         user.accountName,
    //         displayName,
    //         pass,
    //         user.email,
    //         false
    //     )) as AuthResponse;

    //     // Check matching name and defined token
    //     expect(res.accountName).toBe(user.accountName);
    //     expect(res.isPrivate).toBe(false);
    //     expect(res.token).toBeDefined();

    //     // Check matching data
    //     const dbUser: UserFull | null = await UserRepository.selectUser(user.accountName);
    //     checkUserAux(dbUser, user.accountName, user.email);

    //     // Fails, duplicate user name
    //     await expect(
    //         AccountService.registerUser(user.accountName, displayName, pass, "blabla" + user.email, false)
    //     ).rejects.toBeDefined();
    //     // Fails, duplicate email
    //     await expect(
    //         AccountService.registerUser(user.accountName + "blabla", displayName, pass, user.email, false)
    //     ).rejects.toBeDefined();
    // });

    it("Checks if registerUser is working", async () => {
        const res: string = (await AccountService.registerUser(
            "test",
            displayName,
            pass,
            "test@test.com",
            true
        )) as string;

        expect(res).toBe("test");
    });

    it("Checks if email verification is working", async () => {
        const accountName: string = `repo_user_${Date.now()}`;
        await fastCreateUser(accountName);
        const userFull = await UserRepository.selectUser(accountName);
        expect(AccountService.verify(accountName, -1)).rejects.toBeDefined();
        expect(AccountService.verify(accountName, userFull?.emailValidation as number)).resolves.toBeDefined();
    });

    it("LoginUser fails with wrong passwords and non-existent users", async () => {
        // Register user
        const user: UserFull = await fastCreateUserAndValidate("test");

        // Passes, correct password and existing user
        await expect(AccountService.loginUser(user.accountName, "test")).resolves.toBeDefined();
        // Fails, wrong password
        await expect(AccountService.loginUser(user.accountName, "wrongpass")).rejects.toBeDefined();
        // Fails, user doesn't exist
        await expect(AccountService.loginUser("notexists", pass)).rejects.toBeDefined();
    });

    it("AlterUser alters a user, not if duplicate email", async () => {
        // Register user
        const accountName: string = `repo_user_${Date.now()}`;
        const userStart: UserFull = await fastCreateUserAndValidate(accountName);

        // Alter user data and check the returned object
        const userAltered: UserMe = await AccountService.alterUser(
            accountName,
            true,
            "otheremail@test.com",
            { displayName, gender: null, bio: null },
            "newPass"
        );
        expect(userAltered).not.toBeNull();
        expect(userAltered?.accountName).toBe(accountName);
        expect(userAltered?.isPrivate).toBe(true);

        // Check if data in the database matches expectations
        const userAlteredFull: UserFull | null = await UserRepository.selectUser(accountName);
        expect(userAlteredFull?.email).toBe("otheremail@test.com");
        expect(userAlteredFull?.passwordHash).not.toBe(userStart.passwordHash);

        // Fails, duplicate email
        const newUser: UserFull = await fastCreateUserAndValidate("anotheruser");
        await expect(
            AccountService.alterUser(
                userStart.accountName,
                true,
                "anotheruser@test.com",
                { displayName, gender: null, bio: null },
                pass
            )
        ).rejects.toBeDefined();
    });

    it("DeleteUser removes a user", async () => {
        // Register user
        const accountName: string = "test";
        const user: UserFull = await fastCreateUser(accountName);

        expect(user).not.toBe(null);

        // Remove user and make sure it's gone from the database
        await AccountService.removeUser(accountName);

        const userDel: UserFull | null = await UserRepository.selectUser(accountName);
        expect(userDel).toBeNull();
    });

    it("checks grantPasswordReset is working", async () => {
        const accountName: string = "test";
        await fastCreateUserAndValidate(accountName);

        const code: number = await AccountService.grantPasswordReset(accountName, false);

        const user: UserFull | null = await UserRepository.selectUser("test");

        if (user === null) {
            throw new Error("if you are reading this we are having a joints problem on prisma");
        }

        expect(code).toBe(user.passwordRecover);
    });

    it("checks usePasswordReset is working", async () => {
        const accountName: string = "test";

        await fastCreateUserAndValidate(accountName);

        await UserRepository.grantPasswordReset(accountName, 123);

        const newPass = "newPass";

        await AccountService.usePasswordReset(accountName, 123, newPass);

        const user: UserFull | null = await UserRepository.selectUser(accountName);

        if (user === null) {
            throw new Error("if you are reading this we are having a joints problem on prisma");
        }

        expect(await bcrypt.compare(newPass, user.passwordHash)).toBeTruthy();
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
