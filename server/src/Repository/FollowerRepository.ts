import { prisma } from "../prisma";
import type { Follower } from "../generated/prisma/client";
export { Follower };

export type follower = {
    follows: string;
    followed: string;
    accepted: boolean;
}

export type followerPK = {
    follows: string;
    followed: string;
}

// select follower
export function SelectFollower(followerPK: followerPK): Promise<Follower | null> {
    return prisma.follower.findUnique({
        where: { follows_followed: followerPK }
    });
}

// insert follower
export function InsertFollower(follower: follower): Promise<Follower> {
    return prisma.follower.create({
        data: follower
    });
}

// update follower (use to accept)
export function UpdateFollower(follower: follower): Promise<Follower> {
    const followerPK: followerPK = {
        follows: follower.follows,
        followed: follower.followed,
    }
    return prisma.follower.update({
        where: { follows_followed: followerPK },
        data: { accepted: follower.accepted }
    });
}

// delete follower
export function DeleteFollower(follower: follower): Promise<Follower> {
    return prisma.follower.delete({
        where: { follows_followed: follower }
    });
}



// select all followers of a user
export function SelectAllFollowersOfUser(userPK: string): Promise<Follower[]> {
    return prisma.follower.findMany({
        where: { followed: userPK }
    });
}

// select all followed by a user
export function SelectAllFollowedbyUser(userPK: string): Promise<Follower[]> {
    return prisma.follower.findMany({
        where: { follows: userPK }
    });
}
