import {StatusCodes} from "http-status-codes"
import {AppError} from "../utils/ErrorHandler"
import {FetchFullUser, CanViewUser, FetchPublicUser} from "./AccountService"
import {FollowerFull, UserPK, UserPublic} from "../types/Types"
import {FollowerRepository} from "../Repository/FollowerRepository"
import * as ErrorMessage from "../utils/ErrorMessage"

export class FollowerService {
    /**
     * Creates a follow request from one user to another
     * @param currentUser - username of the user making the request (the one who follows)
     * @param followed - username of the user to be followed
     * @returns Created follower relation object
     */
    static async RequestFollower(currentUser: UserPK, followed: UserPK): Promise<FollowerFull> {
        const followedUser: UserPublic = await FetchPublicUser(followed);

        if(currentUser === followed)
            throw new AppError(StatusCodes.CONFLICT, ErrorMessage.CANNOT_FOLLOW_YOURSELF);

        // check if request already exists
        const existingRequest: FollowerFull | null = await FollowerRepository.SelectFollower({follows: currentUser, followed});
        if (existingRequest)
            throw new AppError(StatusCodes.CONFLICT, ErrorMessage.FOLLOW_REQUEST_EXISTS);

        // create follower request (accept auto for public accounts)
        const follower: FollowerFull = await FollowerRepository.InsertFollower({
            follows: currentUser,
            followed,
            accepted: !followedUser.isPrivate
        });

        return follower;
    }

    /**
     * Accepts a follow request (for private accounts)
     * @param currentUser - user authenticated
     * @param follows - username of the follower
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
     * @param expectedAccepted - expected accepted status - true is for removing followers, false is for declining follow requests, undefined either
     * @returns Deleted follower relation object
     */
    static async RemoveFollower(follows: UserPK, followed: UserPK, expectedAccepted?: boolean): Promise<FollowerFull> {
        await FetchFullUser(follows);
        await FetchFullUser(followed);

        const existing: FollowerFull | null = await FollowerRepository.SelectFollower({ follows, followed });
        if (!existing)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.FOLLOWER_NOT_FOUND);

        if (expectedAccepted !== undefined && existing.accepted !== expectedAccepted) {
            throw new AppError(
                StatusCodes.NOT_FOUND,
                expectedAccepted ? ErrorMessage.FOLLOWER_NOT_FOUND : ErrorMessage.FOLLOW_REQUEST_NOT_FOUND
            );
        }

        return await FollowerRepository.DeleteFollower({ follows, followed });
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
            throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.UNAUTHORIZED_ACTION);

        const followers: FollowerFull[] = await FollowerRepository.SelectAllFollowersOfUser(username);
        return followers;
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
        return following;
    }

    /**
     * Gets pending follow requests to a user (for private accounts) - must be logged in
     * @param currentUser - Username to get pending follow requests to
     * @returns Array of pending follower objects
     */
    static async GetPendingRequestsToUser(currentUser: UserPK): Promise<FollowerFull[]> {
        await FetchPublicUser(currentUser);

        const requests: FollowerFull[] = await FollowerRepository.SelectAllRequestsToUser(currentUser);
        return requests;
    }

    /**
     * Gets pending follow requests from a user (for private accounts) - must be logged in
     * @param currentUser - Username to get the pending follow requests made by
     * @returns Array of pending follower objects
     */
    static async GetPendingRequestsFromUser(currentUser: UserPK): Promise<FollowerFull[]> {
        await FetchPublicUser(currentUser);

        const requests: FollowerFull[] = await FollowerRepository.SelectAllRequestsFromUser(currentUser);
        return requests;
    }
}
