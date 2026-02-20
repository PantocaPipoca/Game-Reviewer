import {StatusCodes} from "http-status-codes"
import {SelectFollower, InsertFollower, UpdateFollower, DeleteFollower, SelectAllFollowersOfUser, SelectAllFollowedByUser} from "../Repository/FollowerRepository"
import {FetchUser, CanViewUser} from "./AccountService"
import {FollowerFull, UserData, UserFull, UserPK} from "../types/Types"
import {AppError} from "../utils/ErrorHandler"
import * as ErrorMessage from "../utils/ErrorMessage"

// checks if both exist, throwing an exception if any dont exist
async function CheckBothUsers(user1: UserPK, user2: UserPK): Promise<void> {
    await FetchUser(user1);
    await FetchUser(user2);
}

export class FollowerService {
    /**
     * Creates a follow request from one user to another
     * @param currentUser - Username of the user making the request (should match follows)
     * @param follows - Username of the user requesting to follow
     * @param followed - Username of the user to be followed
     * @returns Created follower object
     */
    static async RequestFollower(currentUser: UserPK, followed: UserPK): Promise<FollowerFull> {
        await CheckBothUsers(currentUser, followed);

        // check if request already exists
        const existingRequest = await SelectFollower({follows: currentUser, followed});
        if (existingRequest)
            throw new AppError(StatusCodes.CONFLICT, ErrorMessage.FOLLOW_REQUEST_EXISTS);

        // get the followed users privacy setting
        const followedUser: UserFull = await FetchUser(followed);
        const userData: UserData = followedUser.userData as UserData;
        const isPrivate: boolean = userData?.isPrivate || false;

        // create follower request (accept auto for public accounts)
        const follower: FollowerFull = await InsertFollower({
            follows: currentUser,
            followed,
            accepted: !isPrivate
        });

        return {
            follows: follower.follows,
            followed: follower.followed,
            accepted: follower.accepted,
            createdAt: follower.createdAt,
            updatedAt: follower.updatedAt
        } as FollowerFull;
    }

    /**
     * Accepts a follow request (for private accounts)
     * @param currentUser - user authenticated
     * @param follows - username of the follower
     * @param followed - username of the followed user
     * @returns updated follower object
     */
    static async AcceptFollower(currentUser: UserPK, follows: UserPK): Promise<FollowerFull> {
        await CheckBothUsers(follows, currentUser);

        // check if request exists
        const existingRequest: FollowerFull | null = await SelectFollower({follows, followed: currentUser});
        if (!existingRequest)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.FOLLOW_REQUEST_NOT_FOUND);

        // check if already accepted
        if (existingRequest.accepted)
            throw new AppError(StatusCodes.CONFLICT, ErrorMessage.FOLLOW_ALREADY_ACCEPTED);

        const updatedFollower: FollowerFull = await UpdateFollower({
            follows,
            followed: currentUser,
            accepted: true
        });

        return {
            follows: updatedFollower.follows,
            followed: updatedFollower.followed,
            accepted: updatedFollower.accepted,
            createdAt: updatedFollower.createdAt,
            updatedAt: updatedFollower.updatedAt
        } as FollowerFull;
    }

    /**
     * Removes a follower relationship
     * @param currentUser - currentUser
     * @param follows - Username of the follower
     * @param followed - Username of the followed user
     * @returns Deleted follower object
     */
    static async RemoveFollower(currentUser: UserPK, follows: UserPK, followed: UserPK): Promise<FollowerFull> {
        if (currentUser !== follows && currentUser !== followed)
            throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.UNAUTHORIZED_ACTION);

        await CheckBothUsers(follows, followed);

        const existingRequest: FollowerFull | null = await SelectFollower({follows, followed});
        if (!existingRequest)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.FOLLOWER_NOT_FOUND);

        const deletedFollower: FollowerFull = await DeleteFollower({
            follows,
            followed,
            accepted: existingRequest.accepted
        });

        return {
            follows: deletedFollower.follows,
            followed: deletedFollower.followed,
            accepted: deletedFollower.accepted,
            createdAt: deletedFollower.createdAt,
            updatedAt: deletedFollower.updatedAt
        } as FollowerFull;
    }

    /**
     * Gets all followers of a user
     * @param username - username to get followers
     * @param currentUser - authenticated username (if authenticated)
     * @returns Array of follower objects
            */
    static async GetFollowers(username: UserPK, currentUser?: UserPK): Promise<FollowerFull[]> {
        await FetchUser(username)

        // check if currentUser can view followers list
        if (!(await CanViewUser(username, currentUser)))
            return [] // return empty list if not authorized to view

        const followers: FollowerFull[] = await SelectAllFollowersOfUser(username);

        // ONLY return accepted followers
        const acceptedFollowers: FollowerFull[] = followers.filter(f => f.accepted);

        return acceptedFollowers.map(follower => ({
            follows: follower.follows,
            followed: follower.followed,
            accepted: follower.accepted,
            createdAt: follower.createdAt,
            updatedAt: follower.updatedAt
        })) as FollowerFull[];
    }

    /**
     * Gets all users that a user is following
     * @param username - username to get following
     * @param currentUser - authenticated username (if authenticated)
     * @returns Array of follower objects
     * @throws ERR_ACC_NOTEXISTS if user doesn't exist
     */
    static async GetFollowing(username: UserPK, currentUser?: UserPK): Promise<FollowerFull[]> {
        await FetchUser(username);

        // check if currentUser can view following list
        if (!(await CanViewUser(username, currentUser)))
            return [] // return empty list if not authorized to view

        const following: FollowerFull[] = await SelectAllFollowedByUser(username);

        // only return accepted follows
        const acceptedFollowing: FollowerFull[] = following.filter(f => f.accepted);

        return acceptedFollowing.map(follower => ({
            follows: follower.follows,
            followed: follower.followed,
            accepted: follower.accepted,
            createdAt: follower.createdAt,
            updatedAt: follower.updatedAt
        })) as FollowerFull[];
    }

    /**
     * Gets pending follow requests for a user (for private accounts)
     * @param username - Username to get pending requests for
     * @param currentUser - authenticated username (if authenticated)
     * @returns Array of pending follower objects
     */
    static async GetPendingRequests(currentUser: UserPK): Promise<FollowerFull[]> {
        await FetchUser(currentUser);

        const followers: FollowerFull[] = await SelectAllFollowersOfUser(currentUser);
        const pendingRequests: FollowerFull[] = followers.filter(f => !f.accepted);

        return pendingRequests.map(follower => ({
            follows: follower.follows,
            followed: follower.followed,
            accepted: follower.accepted,
            createdAt: follower.createdAt,
            updatedAt: follower.updatedAt
        })) as FollowerFull[];
    }
}
