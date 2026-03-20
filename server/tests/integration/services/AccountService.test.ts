import {describe, it, expect} from "@jest/globals";
import {AccountService} from "../../../src/services/AccountService";
import {AuthResponse, UserFull, UserPrivate, UserPublic} from '../../../src/types/Types';
import {MakeSomeUser, UserMicro} from "../helper/helper";
import {UserRepository} from "../../../src/Repository/UserRepository";

describe("AccountService (integration)", () => {
    // Utilities for this test
    const displayName: string = "Svc";
    const pass: string = "12345678";

    // Auxiliary function, creates and registers a user, returning the username and email
    async function MakeSomeUserAndRegister(): Promise<UserMicro> {
        const user: UserMicro = MakeSomeUser();
        await AccountService.RegisterUser(user.accountName, displayName, pass, user.email);
        return user;
    }

    // Auxiliary function, checks a user's name and email against expected values; password must not be its own hash
    function CheckUserAux(target: UserFull | null, username: string, email: string): void {
        expect(target).not.toBeNull();
        expect(target?.accountName).toBe(username);
        expect(target?.email).toBe(email);
        expect(target?.passwordHash).not.toBe(pass);
    }

    it("RegisterUser creates a user and returns token, not with duplicate name or duplicate email", async () => {
        // Register user
        const user: UserMicro = MakeSomeUser();
        const res: AuthResponse = await AccountService.RegisterUser(user.accountName, displayName, pass, user.email);

        // Check matching name and defined token
        expect(res.accountName).toBe(user.accountName);
        expect(res.isPrivate).toBe(false);
        expect(res.token).toBeDefined();

        // Check matching data
        const dbUser: UserFull | null = await UserRepository.SelectUser(user.accountName);
        CheckUserAux(dbUser, user.accountName, user.email);

        // Fails, duplicate user name
        await expect(AccountService.RegisterUser(user.accountName, displayName, pass, "blabla" + user.email))
            .rejects.toBeDefined();
        // Fails, duplicate email
        await expect(AccountService.RegisterUser(user.accountName + "blabla", displayName, pass, user.email))
            .rejects.toBeDefined();
    });

    it("LoginUser fails with wrong passwords and non-existent users", async () => {
        // Register user
        const user: UserMicro = await MakeSomeUserAndRegister();

        // Passes, correct password and existing user
        await expect(AccountService.LoginUser(user.accountName, pass)).resolves.toBeDefined();
        // Fails, wrong password
        await expect(AccountService.LoginUser(user.accountName, "wrongpass")).rejects.toBeDefined();
        // Fails, user doesn't exist
        await expect(AccountService.LoginUser("notexists", pass)).rejects.toBeDefined();
    });

    it("AlterUser alters a user, not if duplicate email", async () => {
        // Register user
        const user: UserMicro = MakeSomeUser();
        await AccountService.RegisterUser(user.accountName, displayName, "87654321", "svc@test.com");

        // Find user in database and their previous hash
        const dbUser1: UserFull | null = await UserRepository.SelectUser(user.accountName);
        const prevPassHash: string | undefined = dbUser1?.passwordHash;

        // Alter user data and check the returned object
        const altered: UserPublic = await AccountService.AlterUser(user.accountName, undefined, true, pass, user.email);
        expect(altered).not.toBeNull();
        expect(altered.accountName).toBe(user.accountName);
        expect(altered.isPrivate).toBe(true);

        // Check if data in the database matches expectations
        const dbUser2: UserFull | null = await UserRepository.SelectUser(user.accountName);
        CheckUserAux(dbUser2, user.accountName, user.email);
        expect(dbUser2?.passwordHash).not.toBe(prevPassHash);

        // Fails, duplicate email
        const otherEmail: string = "otheremail@test.com";
        await AccountService.RegisterUser("username2", "OTHER USER", "18273645", otherEmail);
        await expect(AccountService.AlterUser(user.accountName, undefined, true, pass, otherEmail)).rejects.toBeDefined();
    });

    it("DeleteUser removes a user", async () => {
        // Register user
        const user: UserMicro = await MakeSomeUserAndRegister();
        
        // Find user in database and check its data
        const dbUser1: UserFull | null = await UserRepository.SelectUser(user.accountName);
        CheckUserAux(dbUser1, user.accountName, user.email);

        // Remove user and make sure it's gone from the database
        await AccountService.RemoveUser(user.accountName);
        const dbUser2: UserFull | null = await UserRepository.SelectUser(user.accountName);
        expect(dbUser2).toBeNull();
    });

    it("FindByUsername correctly finds a user, not if non-existent", async () => {
        const users: UserPublic[] = [];
        const size: number = 8;
        // Register several users
        for (var i = 0; i < size; i++) {
            const user: UserMicro = MakeSomeUser();
            users.push(await AccountService.RegisterUser(user.accountName, "display" + i, "password" + i, user.email));
        }

        // Check the result of FindByUsername against all users
        for (var i = 0; i < size; i++) {
            const found: UserPublic | UserPrivate = await AccountService.FindByUsername(users[i].accountName);
            expect(found).not.toBeNull();
            expect(found.accountName).toBe(users[i].accountName);
            expect(found.isPrivate).toBe(users[i].isPrivate);
        }
    });
});
