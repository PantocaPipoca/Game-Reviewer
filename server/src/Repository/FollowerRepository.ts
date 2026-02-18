import { prisma } from "../prisma";
import { FollowerFull, FollowerShort, FollowerPK, UserPK } from "../types/Types";


// select follower
export function SelectFollower(followerPK: FollowerPK): Promise<FollowerFull | null> {
    return prisma.follower.findUnique({
        where: { follows_followed: followerPK }
    });
}

// insert follower
export function InsertFollower(follower: FollowerShort): Promise<FollowerFull> {
    return prisma.follower.create({
        data: follower
    });
}

// update follower (use to accept)
export function UpdateFollower(follower: FollowerShort): Promise<FollowerFull> {
    const followerPK: FollowerPK = {
        follows: follower.follows,
        followed: follower.followed,
    }
    return prisma.follower.update({
        where: { follows_followed: followerPK },
        data: { accepted: follower.accepted }
    });
}

// delete follower
export function DeleteFollower(follower: FollowerShort): Promise<FollowerFull> {
    return prisma.follower.delete({
        where: { follows_followed: follower }
    });
}



// select all followers of a user
export function SelectAllFollowersOfUser(userPK: UserPK): Promise<FollowerFull[]> {
    return prisma.follower.findMany({
        where: {
            followed: userPK,
            accepted: true
        }
    });
}

// select all followed by a user
export function SelectAllFollowedByUser(userPK: UserPK): Promise<FollowerFull[]> {
    return prisma.follower.findMany({
        where: {
            follows: userPK,
            accepted: true
        }
    });
}

// select all follow requests to a user
export function SelectAllRequestsToUser(userPK: UserPK): Promise<FollowerFull[]> {
    return prisma.follower.findMany({
        where: {
            followed: userPK,
            accepted: false
        }
    });
}

// select all follow requests from a user
export function SelectAllRequestsFromUser(userPK: UserPK): Promise<FollowerFull[]> {
    return prisma.follower.findMany({
        where: {
            follows: userPK,
            accepted: false
        }
    });
}
