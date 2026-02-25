import { prisma } from "../prisma";
import { FollowerFull, FollowerShort, FollowerPK, UserPK } from "../types/Types";


/**
 * @description Selects a Follower from the database
 * @param followerPK primary key of Follower
 * @returns a promise of the table entry which contains the given primary key, if nothing is found the promise resolves to null
 */
export function SelectFollower(followerPK: FollowerPK): Promise<FollowerFull | null> {
    return prisma.follower.findUnique({
        where: { follows_followed: followerPK }
    });
}

/**
 * @description Inserts a Follower in the database
 * @param follower json with all fields of Follower that need to be manually set
 * @returns a promise of the table entry which contains the full inserted Follower
 */
export function InsertFollower(follower: FollowerShort): Promise<FollowerFull> {
    return prisma.follower.create({
        data: follower
    });
}

/**
 * @description Updates a Follower in the database with the primary key given in follower, with the rest of the values given
 * @param follower json with all fields of Follower that need to be manually set
 * @returns a promise of the updated table entry of the Follower with the corresponding primary key
 */
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

/**
 * @description Deletes a Follower from the database
 * @param followerPK primary key of Follower
 * @returns a promise of the deleted entry
 */
export function DeleteFollower(followerPK: FollowerPK): Promise<FollowerFull> {
    return prisma.follower.delete({
        where: { follows_followed: followerPK }
    });
}



/**
 * @description Selects all Followers of a given User
 * @param userPK primary key of the User we want the Followers of
 * @returns a promise of the array of Followers that follow the given User
 */
export function SelectAllFollowersOfUser(userPK: UserPK): Promise<FollowerFull[]> {
    return prisma.follower.findMany({
        where: {
            followed: userPK,
            accepted: true
        }
    });
}

/**
 * @description Selects all Followers a User follows
 * @param userPK primary key of the User that follows the others
 * @returns a promise of the array of Followers that the given User follows
 */
export function SelectAllFollowedByUser(userPK: UserPK): Promise<FollowerFull[]> {
    return prisma.follower.findMany({
        where: {
            follows: userPK,
            accepted: true
        }
    });
}

/**
 * @description Selects all follow requests addressed to a given User
 * @param userPK primary key of the User that the requests were addressed to
 * @returns a promise of the array of follow requests that are addressed the given User
 */
export function SelectAllRequestsToUser(userPK: UserPK): Promise<FollowerFull[]> {
    return prisma.follower.findMany({
        where: {
            followed: userPK,
            accepted: false
        }
    });
}

/**
 * @description Selects all follow requests made from a given User
 * @param userPK primary key of the User we want the follow requests made by
 * @returns a promise of the array of follow requests made from the given User
 */
export function SelectAllRequestsFromUser(userPK: UserPK): Promise<FollowerFull[]> {
    return prisma.follower.findMany({
        where: {
            follows: userPK,
            accepted: false
        }
    });
}
