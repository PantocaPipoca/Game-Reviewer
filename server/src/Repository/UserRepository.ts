import { PRISMA } from "../Prisma";
import { UserFull, UserShort, UserPK } from "../types/Types";

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
            data: user,
        });
    }

    /**
     * @description Updates a User in the database with the primary key given in user, with the rest of the values given
     * @param user json with all fields of User that need to be manually set
     * @returns a promise of the updated table entry of the User with the corresponding primary key
     */
    public static updateUser(user: Omit<UserShort, "profilePic">): Promise<UserFull> {
        return PRISMA.user.update({
            where: { accountName: user.accountName },
            data: {
                passwordHash: user.passwordHash,
                userData: user.userData,
                isPrivate: user.isPrivate,
                email: user.email,
            },
        });
    }

    /**
     * @description Updates a User in the database with the primary key given in user, with the profile picture
     * @param user User account name
     * @param profilePic the new profile picture for the User
     * @returns a promise of the updated table entry of the User with the corresponding primary key
     */
    public static changeProfilePictureOfUser(
        user: UserPK,
        profilePic: Uint8Array<ArrayBuffer> | null
    ): Promise<UserFull> {
        if (profilePic == null)
            return PRISMA.user.update({
                where: { accountName: user },
                data: { profilePic: { set: null } },
            });
        return PRISMA.user.update({
            where: { accountName: user },
            data: { profilePic: { set: new Uint8Array(Object.values(profilePic)) } },
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
