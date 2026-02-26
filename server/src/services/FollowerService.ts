import {StatusCodes} from "http-status-codes"
import {AppError} from "../utils/ErrorHandler"
import {FetchFullUser, CanViewUser, FetchPublicUser} from "./AccountService"
import {FollowerFull, FollowerShort, UserData, UserPK, UserPublic} from "../types/Types"
import { FollowerRepository } from "../Repository/FollowerRepository"
import * as ErrorMessage from "../utils/ErrorMessage"

export class FollowerService {

    /**
     * Creates a follow request from one user to another
     * @param currentUser - username of the user making the request (the one who follows)
     * @param followed - username of the user to be followed
     * @returns Created follower relation object
     */
    static async RequestFollower(currentUser: UserPK, followed: UserPK): Promise<FollowerFull> {
        await FetchPublicUser(currentUser);
        const followedUser: UserPublic = await FetchPublicUser(followed);

        // check if request already exists
        const existingRequest: FollowerFull | null = await FollowerRepository.SelectFollower({follows: currentUser, followed});
        if (existingRequest)
            throw new AppError(StatusCodes.CONFLICT, ErrorMessage.FOLLOW_REQUEST_EXISTS);

        // get the followed users privacy setting
        const isPrivate: boolean = followedUser.isPrivate;

        // create follower request (accept auto for public accounts)
        const follower: FollowerFull = await FollowerRepository.InsertFollower({
            follows: currentUser,
            followed,
            accepted: !isPrivate
        });

        return follower;
    }

    /**
     * Accepts a follow request (for private accounts)
     * @param currentUser - user authenticated
     * @param follows - username of the follower
     * @param followed - username of the followed user
     * @returns updated follower relation object
     */
    static async AcceptFollower(currentUser: UserPK, follows: UserPK): Promise<FollowerFull> {
        await FetchFullUser(currentUser);
        await FetchFullUser(follows);

        // check if request exists
        const existingRequest: FollowerFull | null = await FollowerRepository.SelectFollower({follows, followed: currentUser});
        if (!existingRequest)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.FOLLOW_REQUEST_NOT_FOUND);

        // check if already accepted
        if (existingRequest.accepted)
            throw new AppError(StatusCodes.CONFLICT, ErrorMessage.FOLLOW_ALREADY_ACCEPTED);

        const updatedFollower: FollowerFull = await FollowerRepository.UpdateFollower({
            follows,
            followed: currentUser,
            accepted: true
        });

        return updatedFollower;
    }

    /**
     * Removes a follower relationship
     * @param currentUser - currentUser
     * @param follows - username of the follower
     * @param followed - username of the followed user
     * @returns Deleted follower relation object
     */
    static async RemoveFollower(currentUser: UserPK, follows: UserPK, followed: UserPK): Promise<FollowerFull> {
        await FetchFullUser(follows);
        await FetchFullUser(followed);

        if (currentUser !== follows && currentUser !== followed)
            throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.UNAUTHORIZED_ACTION);

        const existingRequest: FollowerFull | null = await FollowerRepository.SelectFollower({follows, followed});
        if (!existingRequest)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.FOLLOWER_NOT_FOUND);

        const deletedFollower: FollowerFull = await FollowerRepository.DeleteFollower({
            follows,
            followed,
        });

        return deletedFollower;
    }

    /**
     * Gets all followers of a user
     * @param username - username to get followers
     * @param currentUser - authenticated user (if authenticated)
     * @returns Array of follower objects
     */
    static async GetFollowers(username: UserPK, currentUser?: UserPK): Promise<FollowerFull[]> {
        const user: UserPublic = await FetchPublicUser(username);

        // check if currentUser can view followers list
        const canView: boolean = await CanViewUser(user, currentUser);
        if (!canView)
            return [] // return empty list if not authorized to view

        const followers: FollowerFull[] = await FollowerRepository.SelectAllFollowersOfUser(username);

        // ONLY return accepted followers
        const acceptedFollowers: FollowerFull[] = followers.filter(f => f.accepted);

        return acceptedFollowers;
    }

    /**
     * Gets all users that a user is following
     * @param username - username to get following
     * @param currentUser - authenticated username (if authenticated)
     * @returns Array of follower objects
     */
    static async GetFollowing(username: UserPK, currentUser?: UserPK): Promise<FollowerFull[]> {
        const user: UserPublic =await FetchPublicUser(username);
        
        // check if currentUser can view following list
        const canView: boolean = await CanViewUser(user, currentUser);
        if (!canView)
            throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.UNAUTHORIZED_ACTION);

        const following: FollowerFull[] = await FollowerRepository.SelectAllFollowedByUser(username);

        // only return accepted follows
        const acceptedFollowing: FollowerFull[] = following.filter(f => f.accepted);

        return acceptedFollowing;
    }

    /**
     * Gets pending follow requests for a user (for private accounts)
     * @param username - Username to get pending requests for
     * @param currentUser - authenticated username (if authenticated)
     * @returns Array of pending follower objects
     */
    static async GetPendingRequests(currentUser: UserPK): Promise<FollowerFull[]> {
        await FetchPublicUser(currentUser);

        const followers: FollowerFull[] = await FollowerRepository.SelectAllFollowersOfUser(currentUser);
        const pendingRequests: FollowerFull[] = followers.filter(f => !f.accepted);

        return pendingRequests;
    }
}
