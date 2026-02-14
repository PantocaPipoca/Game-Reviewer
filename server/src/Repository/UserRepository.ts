import { prisma } from "../prisma";
import type { User } from "../generated/prisma/client";
export { User };

export type user = {
    accountName: string;
    passwordHash: string;
    userData: any;
    email: string;
}

export type userPK = string;

// select user
export function SelectUser(userPK: userPK): Promise<User | null> {
    return prisma.user.findUnique({
        where: { accountName: userPK }
    });
}

// insert user
export function InsertUser(user: user): Promise<User> {
    return prisma.user.create({
        data: user
    });
}

// update user
export function UpdateUser(user: user): Promise<User> {
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
export function DeleteUser(userPK: userPK): Promise<User> {
    return prisma.user.delete({
        where: { accountName: userPK }
    });
}




// select users of similar name
// all results will contain nameFilter in the accountName
export function SelectUsersOfSimilarName(nameFilter: string): Promise<User[]> {
    return prisma.user.findMany({
        where: {
            accountName: {
                contains: nameFilter,
                mode: "insensitive"
            }
        }
    });
}
