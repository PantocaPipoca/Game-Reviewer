import { prisma } from "../prisma";
import { UserFull, UserShort, UserPK } from "../types/Types";


// select user
export function SelectUser(userPK: UserPK): Promise<UserFull | null> {
    return prisma.user.findUnique({
        where: { accountName: userPK }
    });
}

// insert user
export function InsertUser(user: UserShort): Promise<UserFull> {
    return prisma.user.create({
        data: user
    });
}

// update user
export function UpdateUser(user: UserShort): Promise<UserFull> {
    return prisma.user.update({
        where: { accountName: user.accountName },
        data: {
            passwordHash: user.passwordHash,
            userData: user.userData,
            email: user.email,
        }
    });
}

// delete user
export function DeleteUser(userPK: UserPK): Promise<UserFull> {
    return prisma.user.delete({
        where: { accountName: userPK }
    });
}




// select users of similar name
// all results will contain nameFilter in the accountName
export function SelectUsersOfSimilarName(nameFilter: string): Promise<UserFull[]> {
    return prisma.user.findMany({
        where: {
            accountName: {
                contains: nameFilter,
                mode: "insensitive"
            }
        }
    });
}
