import {Request, Response} from "express"
import {AsyncHandler, MakeSuccess, AppError} from "../utils/ErrorHandler"
import {StatusCodes} from "http-status-codes"
import {FollowerService} from "../services/FollowerService"
import * as ErrorMessage from "../utils/ErrorMessage"
import { FollowerFull } from "../types/Types"
import { AuthRequest, ExtractLoggedUser } from "../utils/auth"

function ExtractUsername(req: AuthRequest): string {
    const username = req.params['username'];
    if (!username || typeof username !== 'string') throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);
    return username;
}

export class FollowerController {
    /**
     * Makes a follower request to an account
     * Used by POST /api/users/:username/followers/
     */
    static RequestFollower: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string = ExtractLoggedUser(req);
        const username: string = ExtractUsername(req);

        const result = await FollowerService.RequestFollower(currentUser, username);
        return MakeSuccess(res, StatusCodes.CREATED, result);
    });

    /**
     * Removes a follower request to an account
     * Used by DELETE /api/users/:username/followers/
     */
    static UnfollowUser = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string = ExtractLoggedUser(req);
        const username: string = ExtractUsername(req);

        // remove relation: follows=currentUser, followed=username
        const result = await FollowerService.RemoveFollower(currentUser, currentUser, username);
        return MakeSuccess(res, StatusCodes.ACCEPTED, result);
    }); 

    /**
     * Accepts a follower request to an account
     * Used by PUT /api/users/me/followers/requests/received/:username
     */
    static AcceptFollowerRequest: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser : string = ExtractLoggedUser(req);
        const username: string = ExtractUsername(req);
        
        const result = await FollowerService.AcceptFollower(currentUser, username);
        return MakeSuccess(res, StatusCodes.ACCEPTED, result);
    });

    /**
     * Removes a follower to an account
     * Used by DELETE /api/users/me/followers/requests/received/:username
     */
    static RejectFollowerRequest: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser : string = ExtractLoggedUser(req);
        const username: string = ExtractUsername(req);
        
        // delete relation: follows=username, followed=currentUser (pending request)
        const result = await FollowerService.RemoveFollower(currentUser, username, currentUser, false);
        return MakeSuccess(res, StatusCodes.ACCEPTED, result);
    });

    /**
     * Gets the followers of an account
     * Used by GET /api/users/:username/followers
     */
    static GetFollowers: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string | undefined = req.currentUser?.username;
        const username: string = ExtractUsername(req);
        
        const result: FollowerFull[] = await FollowerService.GetFollowers(username, currentUser)
        return MakeSuccess(res, StatusCodes.OK, result)
    });

    /**
     * Gets the users followed by a user, if it's private only returns followed users if the current user follows it
     * Used by GET /api/users/:username/following
     */
    static GetFollowingByUser: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string | undefined = req.currentUser?.username;
        const username: string = ExtractUsername(req);

        const result: FollowerFull[] = await FollowerService.GetFollowing(username, currentUser);
        return MakeSuccess(res, StatusCodes.OK, result)
    });

    /**
     * Gets the pending follower requests for a user
     * Used by GET /api/users/me/followers/requests/received
     */
    static GetPendingRequestsToUser = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser = ExtractLoggedUser(req);
        const result = await FollowerService.GetPendingRequestsToUser(currentUser);
        return MakeSuccess(res, StatusCodes.OK, result);
    });

    /**
     * Gets the pending follower requests for a user
     * Used by GET /api/users/me/followers/requests/sent
     */
    static GetPendingRequestsFromUser = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser = ExtractLoggedUser(req);
        const result = await FollowerService.GetPendingRequestsFromUser(currentUser);
        return MakeSuccess(res, StatusCodes.OK, result);
    });
}
