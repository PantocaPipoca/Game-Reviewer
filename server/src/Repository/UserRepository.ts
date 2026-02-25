import { prisma } from "../prisma";
import { UserFull, UserShort, UserPK } from "../types/Types";

export class UserRepository {

    /**
     * @description Selects a User from the database
     * @param userPK primary key of User
     * @returns a promise of the table entry which contains the given primary key, if nothing is found the promise resolves to null
     */
    public static SelectUser(userPK: UserPK): Promise<UserFull | null> {
        return prisma.user.findUnique({
            where: { accountName: userPK }
        });
    }

    /**
     * @description Inserts a User in the database
     * @param user json with all fields of User that need to be manually set
     * @returns a promise of the table entry which contains the full inserted User
     */
    public static InsertUser(user: UserShort): Promise<UserFull> {
        return prisma.user.create({
            data: user
        });
    }

    /**
     * @description Updates a User in the database with the primary key given in user, with the rest of the values given
     * @param user json with all fields of User that need to be manually set
     * @returns a promise of the updated table entry of the User with the corresponding primary key
     */
    public static UpdateUser(user: UserShort): Promise<UserFull> {
        return prisma.user.update({
            where: { accountName: user.accountName },
            data: {
                passwordHash: user.passwordHash,
                userData: user.userData,
                isPrivate: user.isPrivate,
                email: user.email,
            }
        });
    }

    /**
     * @description Deletes a User from the database
     * @param userPK primary key of User
     * @returns a promise of the deleted entry
     */
    public static DeleteUser(userPK: UserPK): Promise<UserFull> {
        return prisma.user.delete({
            where: { accountName: userPK }
        });
    }




    /**
     * @description Selects all the Users whose name contains the given string
     * @param nameFilter string that filters the Users
     * @returns a promise of an array of Users
     */
    public static SelectUsersOfSimilarName(nameFilter: string): Promise<UserFull[]> {
        return prisma.user.findMany({
            where: {
                accountName: {
                    contains: nameFilter,
                    mode: "insensitive"
                }
            }
        });
    }

}
