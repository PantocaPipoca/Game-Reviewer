import {StatusCodes} from "http-status-codes"
import {SelectFollower, InsertFollower, UpdateFollower, DeleteFollower, SelectAllFollowersOfUser, SelectAllFollowedByUser} from "../Repository/FollowerRepository"
import {FetchUser, CanViewUser} from "./AccountService"
import {FollowerResponse, UserData} from "../types/Types"
import {AppError} from "../utils/ErrorHandler"
import * as ErrorMessage from "../utils/ErrorMessage"

// checks if both exist, throwing an exception if any dont exist
async function CheckBothUsers(user1: string, user2: string): Promise<void> {
    const userOne = await FetchUser(user1)
    const userTwo = await FetchUser(user2)
}

export class FollowerService {
    /**
     * Creates a follow request from one user to another
     * @param currentUser - Username of the user making the request (should match follows)
     * @param follows - Username of the user requesting to follow
     * @param followed - Username of the user to be followed
     * @returns Created follower object
     */
    static async RequestFollower(currentUser: string, follows: string, followed: string): Promise<FollowerResponse> {
        // user auth verification
        if (currentUser !== follows) {
            throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.UNAUTHORIZED_ACTION)
        }

        await CheckBothUsers(follows, followed)

        // check if request already exists
        const existingRequest = await SelectFollower({follows, followed})
        if (existingRequest) {
            throw new AppError(StatusCodes.CONFLICT, ErrorMessage.FOLLOW_REQUEST_EXISTS)
        }

        // get the followed users privacy setting
        const followedUser = await FetchUser(followed)
        const userData: UserData = followedUser.userData as UserData
        const isPrivate = userData?.isPrivate || false

        // create follower request (accept auto for public accounts)
        const follower = await InsertFollower({
            follows,
            followed,
            accepted: !isPrivate
        })

        return {
            follows: follower.follows,
            followed: follower.followed,
            accepted: follower.accepted,
            createdAt: follower.createdAt,
            updatedAt: follower.updatedAt
        }
    }

    /**
     * Accepts a follow request (for private accounts)
     * @param currentUser - user authenticated
     * @param follows - username of the follower
     * @param followed - username of the followed user
     * @returns updated follower object
     */
    static async AcceptFollower(currentUser: string, follows: string, followed: string): Promise<FollowerResponse> {
        // user auth verification
        if (currentUser !== followed) {
            throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.UNAUTHORIZED_ACTION)
        }

        await CheckBothUsers(follows, followed)

        // check if request exists
        const existingRequest = await SelectFollower({follows, followed})
        if (!existingRequest) {
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.FOLLOW_REQUEST_NOT_FOUND)
        }

        // check if already accepted
        if (existingRequest.accepted) {
            throw new AppError(StatusCodes.CONFLICT, ErrorMessage.FOLLOW_ALREADY_ACCEPTED)
        }

        const updatedFollower = await UpdateFollower({
            follows,
            followed,
            accepted: true
        })

        return {
            follows: updatedFollower.follows,
            followed: updatedFollower.followed,
            accepted: updatedFollower.accepted,
            createdAt: updatedFollower.createdAt,
            updatedAt: updatedFollower.updatedAt
        }
    }

    /**
     * Removes a follower relationship
     * @param currentUser - currentUser
     * @param follows - Username of the follower
     * @param followed - Username of the followed user
     * @returns Deleted follower object
     */
    static async RemoveFollower(currentUser: string, follows: string, followed: string): Promise<any> {
        // user auth verification
        if (currentUser !== follows && currentUser !== followed) {
            throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.UNAUTHORIZED_ACTION)
        }

        await CheckBothUsers(follows, followed)

        const existingRequest = await SelectFollower({follows, followed})
        if (!existingRequest) {
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.FOLLOWER_NOT_FOUND)
        }

        const deletedFollower = await DeleteFollower({
            follows,
            followed,
            accepted: existingRequest.accepted
        })

        return {
            follows: deletedFollower.follows,
            followed: deletedFollower.followed,
            accepted: deletedFollower.accepted,
            createdAt: deletedFollower.createdAt,
            updatedAt: deletedFollower.updatedAt
        }
    }

    /**
     * Gets all followers of a user
     * @param accountName - username to get followers
     * @param currentUser - authenticated username (if authenticated)
     * @returns Array of follower objects
            */
    static async GetFollowers(accountName: string, currentUser?: string): Promise<any[]> {
        // Verify user exists
        await FetchUser(accountName)

        // Check if currentUser can view followers list
        const canView = await CanViewUser(accountName, currentUser)
        if (!canView) {
            return [] // return empty list if not authorized to view
        }

        const followers = await SelectAllFollowersOfUser(accountName)

        // ONLY return accepted followers
        const acceptedFollowers = followers.filter(f => f.accepted)

        return acceptedFollowers.map(follower => ({
            follows: follower.follows,
            followed: follower.followed,
            accepted: follower.accepted,
            createdAt: follower.createdAt,
            updatedAt: follower.updatedAt
        }))
    }

    /**
     * Gets all users that a user is following
     * @param accountName - username to get following
     * @param currentUser - authenticated username (if authenticated)
     * @returns Array of follower objects
     * @throws ERR_ACC_NOTEXISTS if user doesn't exist
     */
    static async GetFollowing(accountName: string, currentUser?: string): Promise<any[]> {
        await FetchUser(accountName)

        // check if currentUser can view following list
        const canView = await CanViewUser(accountName, currentUser)
        if (!canView) {
            throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.UNAUTHORIZED_ACTION)
        }

        const following = await SelectAllFollowedByUser(accountName)

        // only return accepted follows
        const acceptedFollowing = following.filter(f => f.accepted)

        return acceptedFollowing.map(follower => ({
            follows: follower.follows,
            followed: follower.followed,
            accepted: follower.accepted,
            createdAt: follower.createdAt,
            updatedAt: follower.updatedAt
        }))
    }

    /**
     * Gets pending follow requests for a user (for private accounts)
     * @param accountName - Username to get pending requests for
     * @param currentUser - authenticated username (if authenticated)
     * @returns Array of pending follower objects
     */
    static async GetPendingRequests(accountName: string, currentUser?: string): Promise<any[]> {
        // only the owner can see pending requests
        if (currentUser !== accountName) {
            throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.UNAUTHORIZED_ACTION)
        }

        await FetchUser(accountName)

        const followers = await SelectAllFollowersOfUser(accountName)
        const pendingRequests = followers.filter(f => !f.accepted)

        return pendingRequests.map(follower => ({
            follows: follower.follows,
            followed: follower.followed,
            accepted: follower.accepted,
            createdAt: follower.createdAt,
            updatedAt: follower.updatedAt
        }))
    }
}
