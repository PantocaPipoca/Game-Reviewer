import { describe, it, expect } from "@jest/globals";
import { UserRepository } from "../../../src/Repository/UserRepository";
import { UserFull, UserShort } from "../../../src/types/Types";

describe("UserRepository (integration)", () => {
    // Auxiliary function, inserts a user
    async function insertAux(): Promise<UserFull> {
        const username: string = `repo_user_${Date.now()}`;
        return await UserRepository.insertUser({
            username,
            avatar: null,
            passwordHash: "hash",
            userData: { displayName: "Repo", gender: null, bio: null },
            isPrivate: false,
            email: `${username}@test.com`,
        });
    }

    // Auxiliary function, checks a user's data against expected values
    function checkUserAux(user: UserFull | null, name: string, email: string | null): void {
        expect(user).not.toBeNull();
        expect(user?.username).toBe(name);
        expect(user?.email).toBe(email);
    }

    it("Inserts and selects a user", async () => {
        // Inserts user
        const user: UserFull = await insertAux();

        // Checks whether the user exists and checks
        const found: UserFull | null = await UserRepository.selectUser(user.username);
        checkUserAux(found, user.username, user.email);

        // Fails, duplicate user
        await expect(
            UserRepository.insertUser({
                username: user.username,
                passwordHash: "",
                email: "",
                isPrivate: true,
            } as UserShort)
        ).rejects.toBeDefined();
    });

    it("Inserts and verifies a user", async () => {
        const user: UserFull = await insertAux();

        expect(user.emailValidation).not.toBeNull();
        expect(UserRepository.verify(user.username, -1)).rejects.toBeDefined();
        const validatedUser = await UserRepository.verify(user.username, user.emailValidation as number);
        expect(validatedUser.emailValidation).toBeNull();
    });

    it("Inserts and updates a user", async () => {
        // Inserts user
        const user: UserFull = await insertAux();
        const passwordHash: string = "newhash";
        const newEmail: string = "another@test.com";

        // Updates user with new data and checks
        const found: UserFull = await UserRepository.updateUser({
            username: user.username,
            avatar: null,
            passwordHash,
            userData: { displayName: "Repo", gender: null, bio: null },
            isPrivate: true,
            email: newEmail,
        });
        checkUserAux(found, user.username, newEmail);
        expect(found.passwordHash).toBe(passwordHash);
        expect(found.isPrivate).toBe(true);

        // Checks if the same is true for the result of selectUser
        const found2: UserFull | null = await UserRepository.selectUser(user.username);
        checkUserAux(found2, user.username, newEmail);
        expect(found2?.passwordHash).toBe(passwordHash);
        expect(found2?.isPrivate).toBe(true);
    });

    it("Inserts and deletes a user", async () => {
        // Inserts user
        const user: UserFull = await insertAux();
        await UserRepository.updateUser({
            username: user.username,
            passwordHash: user.passwordHash,
            avatar: null,
            userData: {},
            isPrivate: true,
            email: user.email,
        });

        // Deletes user and checks if the data matches the old
        const found: UserFull = await UserRepository.deleteUser(user.username);
        checkUserAux(found, user.username, user.email);

        // Checks whether the user doesn't exist
        const notFound: UserFull | null = await UserRepository.selectUser(user.username);
        expect(notFound).toBeNull();
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

        const user: UserFull = await UserRepository.grantPasswordReset("test", 123);
        const sameuser: UserFull | null = await UserRepository.selectUser("test");

        if (sameuser === null) {
            throw new Error("if you are reading this we are having a joints problem on prisma");
        }
        expect(user.passwordRecover).toBe(sameuser.passwordRecover);
        expect(user.passwordRecover).toBe(123);
    });

    it("checks grantPasswordReset is working", async () => {
        await UserRepository.insertUser({
            username: "test",
            email: "test@test.com",
            passwordHash: "test1",
            avatar: null,
            isPrivate: false,
            userData: {
                displayName: "test",
                gender: null,
                bio: null,
            },
        });

        await UserRepository.grantPasswordReset("test", 123);
        const user: UserFull = await UserRepository.usePasswordReset("test", 123, "test2");
        await expect(UserRepository.usePasswordReset("test", 1234, "test2")).rejects.toThrow("wrong code");
        const sameuser: UserFull | null = await UserRepository.selectUser("test");
        if (sameuser === null) {
            throw new Error("if you are reading this we are having a joints problem on prisma");
        }
        expect(user.passwordRecover).toBeNull();
        expect(sameuser.passwordRecover).toBeNull();
        expect(user.passwordHash).toBe(sameuser.passwordHash);
        expect(user.passwordHash).toBe("test2");
    });

    it("updateProfilePic sets a profile picture URL", async () => {
        const user: UserFull = await insertAux();
        const url = "https://res.cloudinary.com/test/avatars/test.jpg";

        await UserRepository.updateAvatar(user.username, url);

        const found: UserFull | null = await UserRepository.selectUser(user.username);
        expect(found).not.toBeNull();
        expect(found?.avatar).toBe(url);
    });

    it("updateProfilePic overwrites an existing profile picture", async () => {
        const user: UserFull = await insertAux();
        const url1 = "https://res.cloudinary.com/test/avatars/first.jpg";
        const url2 = "https://res.cloudinary.com/test/avatars/second.jpg";

        await UserRepository.updateAvatar(user.username, url1);
        await UserRepository.updateAvatar(user.username, url2);

        const found: UserFull | null = await UserRepository.selectUser(user.username);
        expect(found?.avatar).toBe(url2);
    });

    it("getAvatar returns null if no picture is set", async () => {
        const user: UserFull = await insertAux();

        const pic = await UserRepository.getAvatar(user.username);
        expect(pic).toBeNull();
    });

    it("getAvatar returns the URL after it is set", async () => {
        const user: UserFull = await insertAux();
        const url = "https://res.cloudinary.com/test/avatars/test.jpg";

        await UserRepository.updateAvatar(user.username, url);
        const pic = await UserRepository.getAvatar(user.username);

        expect(pic).toBe(url);
    });

    it("getAvatar returns null for a non-existent user", async () => {
        const pic = await UserRepository.getAvatar("definitely_does_not_exist");
        expect(pic).toBeNull();
    });
});
