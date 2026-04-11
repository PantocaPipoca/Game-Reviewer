import { PRISMA } from "../Prisma";
import { FollowerFull, FollowerShort, FollowerPK, UserPK, FollowerPublic } from "../types/Types";

export class FollowerRepository {
    /**
     * @description Selects a Follower from the database
     * @param followerPK primary key of Follower
     * @returns a promise of the table entry which contains the given primary key, if nothing is found the promise resolves to null
     */
    public static selectFollower(followerPK: FollowerPK): Promise<FollowerFull | null> {
        return PRISMA.follower.findUnique({
            where: { follows_followed: followerPK },
        });
    }

    /**
     * @description Inserts a Follower in the database
     * @param follower json with all fields of Follower that need to be manually set
     * @returns a promise of the table entry which contains the full inserted Follower
     */
    public static insertFollower(follower: FollowerShort): Promise<FollowerFull> {
        return PRISMA.follower.create({
            data: follower,
        });
    }

    /**
     * @description Updates a Follower in the database with the primary key given in follower, with the rest of the values given
     * @param follower json with all fields of Follower that need to be manually set
     * @returns a promise of the updated table entry of the Follower with the corresponding primary key
     */
    public static updateFollower(follower: FollowerShort): Promise<FollowerFull> {
        const followerPK: FollowerPK = {
            follows: follower.follows,
            followed: follower.followed,
        };
        return PRISMA.follower.update({
            where: { follows_followed: followerPK },
            data: { accepted: follower.accepted },
        });
    }

    /**
     * @description Deletes a Follower from the database
     * @param followerPK primary key of Follower
     * @returns a promise of the deleted entry
     */
    public static deleteFollower(followerPK: FollowerPK): Promise<FollowerFull> {
        return PRISMA.follower.delete({
            where: { follows_followed: followerPK },
        });
    }

    /**
     * @description Selects all Followers of a given User
     * @param userPK primary key of the User we want the Followers of
     * @returns a promise of the array of Followers that follow the given User
     */
    public static selectAllFollowersOfUser(userPK: UserPK): Promise<FollowerPublic[]> {
        return PRISMA.follower.findMany({
            include: {
                followsUser: { select: { avatar: true } },
            },
            where: {
                followed: userPK,
                accepted: true,
            },
        });
    }

    /**
     * @description Selects all Followers a User follows
     * @param userPK primary key of the User that follows the others
     * @returns a promise of the array of Followers that the given User follows
     */
    public static selectAllFollowedByUser(userPK: UserPK): Promise<FollowerPublic[]> {
        return PRISMA.follower.findMany({
            include: {
                followedUser: { select: { avatar: true } },
            },
            where: {
                follows: userPK,
                accepted: true,
            },
        });
    }

    /**
     * @description Selects all follow requests addressed to a given User
     * @param userPK primary key of the User that the requests were addressed to
     * @returns a promise of the array of follow requests that are addressed the given User
     */
    public static selectAllRequestsToUser(userPK: UserPK): Promise<FollowerPublic[]> {
        return PRISMA.follower.findMany({
            include: {
                followsUser: { select: { avatar: true } },
            },
            where: {
                followed: userPK,
                accepted: false,
            },
        });
    }

    /**
     * @description Selects all follow requests made from a given User
     * @param userPK primary key of the User we want the follow requests made by
     * @returns a promise of the array of follow requests made from the given User
     */
    public static selectAllRequestsFromUser(userPK: UserPK): Promise<FollowerPublic[]> {
        return PRISMA.follower.findMany({
            include: {
                followedUser: { select: { avatar: true } },
            },
            where: {
                follows: userPK,
                accepted: false,
            },
        });
    }
}
