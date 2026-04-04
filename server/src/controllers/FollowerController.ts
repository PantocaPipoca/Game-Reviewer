import { Response } from "express";
import { asyncHandler, makeSuccess, AppError } from "../utils/ErrorHandler";
import { StatusCodes } from "http-status-codes";
import { FollowerService } from "../services/FollowerService";
import * as ErrorMessage from "../utils/ErrorMessage";
import { FollowerFull } from "../types/Types";
import { AuthRequest, extractLoggedUser } from "../utils/Auth";

function extractUsername(req: AuthRequest): string {
    const username = req.params["username"];
    if (!username || typeof username !== "string")
        throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);
    return username;
}

export class FollowerController {
    /**
     * Makes a follower request to an account
     * Used by POST /api/users/:username/followers/
     */
    static requestFollower: any = asyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string = extractLoggedUser(req);
        const username: string = extractUsername(req);

        const result = await FollowerService.requestFollower(currentUser, username);
        return makeSuccess(res, StatusCodes.CREATED, result);
    });

    /**
     * Unfollow / Removes a follower request to an account
     * Used by DELETE /api/users/:username/followers/
     */
    static unfollowOrCancelFollowRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string = extractLoggedUser(req);
        const username: string = extractUsername(req);

        // remove relation: follows=currentUser, followed=username
        const result = await FollowerService.removeFollower(currentUser, username);
        return makeSuccess(res, StatusCodes.ACCEPTED, result);
    });

    /**
     * Removes a follower from the current user's followers
     * Used by DELETE /api/users/me/followers/:username
     */
    static removeFollowerOrRejectRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string = extractLoggedUser(req);
        const username: string = extractUsername(req);

        // remove relation: follows=username, followed=currentUser
        const result = await FollowerService.removeFollower(username, currentUser);
        return makeSuccess(res, StatusCodes.ACCEPTED, result);
    });

    /**
     * Accepts a follower request to an account
     * Used by PUT /api/users/me/followers/requests/received/:username
     */
    static acceptFollowerRequest: any = asyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string = extractLoggedUser(req);
        const username: string = extractUsername(req);

        const result = await FollowerService.acceptFollower(currentUser, username);
        return makeSuccess(res, StatusCodes.ACCEPTED, result);
    });

    /**
     * Gets the followers of an account
     * Used by GET /api/users/:username/followers
     */
    static getFollowers: any = asyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string | undefined = req.currentUser?.username;
        const username: string = extractUsername(req);

        const result: FollowerFull[] = await FollowerService.getFollowers(username, currentUser);
        return makeSuccess(res, StatusCodes.OK, result);
    });

    /**
     * Gets the users followed by a user, if it's private only returns followed users if the current user follows it
     * Used by GET /api/users/:username/following
     */
    static getFollowingByUser: any = asyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string | undefined = req.currentUser?.username;
        const username: string = extractUsername(req);

        const result: FollowerFull[] = await FollowerService.getFollowing(username, currentUser);
        return makeSuccess(res, StatusCodes.OK, result);
    });

    /**
     * Gets the pending follower requests for a user
     * Used by GET /api/users/me/followers/requests/received
     */
    static getPendingRequestsToUser = asyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser = extractLoggedUser(req);
        const result = await FollowerService.getPendingRequestsToUser(currentUser);
        return makeSuccess(res, StatusCodes.OK, result);
    });

    /**
     * Gets the pending follower requests for a user
     * Used by GET /api/users/me/followers/requests/sent
     */
    static getPendingRequestsFromUser = asyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser = extractLoggedUser(req);
        const result = await FollowerService.getPendingRequestsFromUser(currentUser);
        return makeSuccess(res, StatusCodes.OK, result);
    });
}
