import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/ErrorHandler";
import { fetchFullUser, canViewUser, fetchPublicUser } from "./AccountService";
import { FollowerFull, UserPK, UserPublic } from "../types/Types";
import { FollowerRepository } from "../Repository/FollowerRepository";
import * as ErrorMessage from "../utils/ErrorMessage";

export class FollowerService {
    /**
     * Creates a follow request from one user to another
     * @param currentUser - username of the user making the request (the one who follows)
     * @param followed - username of the user to be followed
     * @returns Created follower relation object
     */
    static async requestFollower(currentUser: UserPK, followed: UserPK): Promise<FollowerFull> {
        const followedUser: UserPublic = await fetchPublicUser(followed);

        if (currentUser === followed) throw new AppError(StatusCodes.CONFLICT, ErrorMessage.CANNOT_FOLLOW_YOURSELF);

        // check if request already exists
        const existingRequest: FollowerFull | null = await FollowerRepository.selectFollower({
            follows: currentUser,
            followed,
        });
        if (existingRequest) throw new AppError(StatusCodes.CONFLICT, ErrorMessage.FOLLOW_REQUEST_EXISTS);

        // create follower request (accept auto for public accounts)
        const follower: FollowerFull = await FollowerRepository.insertFollower({
            follows: currentUser,
            followed,
            accepted: !followedUser.isPrivate,
        });

        return follower;
    }

    /**
     * Accepts a follow request (for private accounts)
     * @param currentUser - user authenticated
     * @param follows - username of the follower
     * @returns updated follower relation object
     */
    static async acceptFollower(currentUser: UserPK, follows: UserPK): Promise<FollowerFull> {
        await fetchFullUser(currentUser);
        await fetchFullUser(follows);

        // check if request exists
        const existingRequest: FollowerFull | null = await FollowerRepository.selectFollower({
            follows,
            followed: currentUser,
        });
        if (!existingRequest) throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.FOLLOW_REQUEST_NOT_FOUND);

        // check if already accepted
        if (existingRequest.accepted) throw new AppError(StatusCodes.CONFLICT, ErrorMessage.FOLLOW_ALREADY_ACCEPTED);

        const updatedFollower: FollowerFull = await FollowerRepository.updateFollower({
            follows,
            followed: currentUser,
            accepted: true,
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
    static async removeFollower(follows: UserPK, followed: UserPK, expectedAccepted?: boolean): Promise<FollowerFull> {
        await fetchFullUser(follows);
        await fetchFullUser(followed);

        const existing: FollowerFull | null = await FollowerRepository.selectFollower({ follows, followed });
        if (!existing) throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.FOLLOWER_NOT_FOUND);

        if (expectedAccepted !== undefined && existing.accepted !== expectedAccepted) { // not used anymore but kept for backwards compatibility
            throw new AppError(
                StatusCodes.NOT_FOUND,
                expectedAccepted ? ErrorMessage.FOLLOWER_NOT_FOUND : ErrorMessage.FOLLOW_REQUEST_NOT_FOUND
            );
        }

        return await FollowerRepository.deleteFollower({ follows, followed });
    }

    /**
     * Gets all followers of a user
     * @param username - username to get followers
     * @param currentUser - authenticated user (if authenticated)
     * @returns Array of follower objects
     */
    static async getFollowers(username: UserPK, currentUser?: UserPK): Promise<FollowerFull[]> {
        const user: UserPublic = await fetchPublicUser(username);

        // check if currentUser can view followers list
        const canView: boolean = await canViewUser(user, currentUser);
        if (!canView) throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.UNAUTHORIZED_ACTION);

        const followers: FollowerFull[] = await FollowerRepository.selectAllFollowersOfUser(username);
        return followers;
    }

    /**
     * Gets all users that a user is following
     * @param username - username to get following
     * @param currentUser - authenticated username (if authenticated)
     * @returns Array of follower objects
     */
    static async getFollowing(username: UserPK, currentUser?: UserPK): Promise<FollowerFull[]> {
        const user: UserPublic = await fetchPublicUser(username);

        // check if currentUser can view following list
        const canView: boolean = await canViewUser(user, currentUser);
        if (!canView) throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.UNAUTHORIZED_ACTION);

        const following: FollowerFull[] = await FollowerRepository.selectAllFollowedByUser(username);
        return following;
    }

    /**
     * Gets pending follow requests to a user (for private accounts) - must be logged in
     * @param currentUser - Username to get pending follow requests to
     * @returns Array of pending follower objects
     */
    static async getPendingRequestsToUser(currentUser: UserPK): Promise<FollowerFull[]> {
        await fetchPublicUser(currentUser);

        const requests: FollowerFull[] = await FollowerRepository.selectAllRequestsToUser(currentUser);
        return requests;
    }

    /**
     * Gets pending follow requests from a user (for private accounts) - must be logged in
     * @param currentUser - Username to get the pending follow requests made by
     * @returns Array of pending follower objects
     */
    static async getPendingRequestsFromUser(currentUser: UserPK): Promise<FollowerFull[]> {
        await fetchPublicUser(currentUser);

        const requests: FollowerFull[] = await FollowerRepository.selectAllRequestsFromUser(currentUser);
        return requests;
    }
}
