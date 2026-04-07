import { PRISMA } from "../Prisma";
import { UserFull, UserShort, UserPK } from "../types/Types";
import { randomInt } from "node:crypto";

// userData: { path: ["verificationNumber"], equals: 0 }

export class UserRepository {
    /**
     * @description Selects a User from the database
     * @param userPK primary key of User
     * @returns a promise of the table entry which contains the given primary key, if nothing is found the promise resolves to null
     */
    public static selectUser(userPK: UserPK): Promise<UserFull | null> {
        return PRISMA.user.findUnique({
            where: { accountName: userPK },
        });
    }

    /**
     * @description Inserts a User in the database
     * @param user json with all fields of User that need to be manually set
     * @returns a promise of the table entry which contains the full inserted User
     */
    public static insertUser(user: UserShort): Promise<UserFull> {
        return PRISMA.user.create({
            data: { ...user, emailValidation: randomInt(0, 999999) },
        });
    }

    /**
     * @description Updates a User in the database with the primary key given in user, with the rest of the values given
     * @param user json with all fields of User that need to be manually set
     * @returns a promise of the updated table entry of the User with the corresponding primary key
     */
    public static updateUser(user: UserShort): Promise<UserFull> {
        return PRISMA.user.update({
            where: { accountName: user.accountName },
            data: {
                passwordHash: user.passwordHash,
                profilePic: user.profilePic,
                userData: user.userData,
                isPrivate: user.isPrivate,
                email: user.email,
            },
        });
    }

    public static selectUserByEmail(email: string): Promise<UserFull | null> {
        return PRISMA.user.findUnique({
            where: { email: email },
        });
    }

    /**
     * @description Deletes a User from the database
     * @param userPK primary key of User
     * @returns a promise of the deleted entry
     */
    public static deleteUser(userPK: UserPK): Promise<UserFull> {
        return PRISMA.user.delete({
            where: { accountName: userPK },
        });
    }

    /**
     * @description verifies a User in the database
     * @param accountName primary key of User
     * @param codeNum secret code that proves the email is valid
     * @returns a promise of the verified User
     */
    public static verify(accountName: UserPK, codeNum: number): Promise<UserFull> {
        return PRISMA.user.update({
            where: { accountName: accountName, emailValidation: codeNum },
            data: {
                emailValidation: null,
            },
        });
    }

    /**
     * @description clears non verified users that are older than timeLimit
     */
    public static cleanupNonVerifiedUsers(): void {
        const timeLimit = 60 * 60 * 1000;
        PRISMA.user.deleteMany({
            where: {
                emailValidation: {
                    not: null,
                },
                createdAt: {
                    lt: new Date(Date.now() - timeLimit),
                },
            },
        });
    }

    /**
     * @description Selects all the Users whose name contains the given string
     * @param nameFilter string that filters the Users
     * @returns a promise of an array of Users
     */
    public static selectUsersOfSimilarName(nameFilter: string): Promise<UserFull[]> {
        return PRISMA.user.findMany({
            where: {
                accountName: {
                    contains: nameFilter,
                    mode: "insensitive",
                },
            },
        });
    }
}
