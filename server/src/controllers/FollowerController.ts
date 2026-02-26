import {Request, Response} from "express"
import {AsyncHandler, MakeSuccess, AppError} from "../utils/ErrorHandler"
import {StatusCodes} from "http-status-codes"
import {FollowerService} from "../services/FollowerService"
import * as ErrorMessage from "../utils/ErrorMessage"
import { FollowerFull } from "../types/Types"
import { AuthRequest, CurrentOptionalUser } from "../utils/auth"

export class FollowerController {
    /**
     * Makes a follower request to an account
     * Used by POST /api/users/:username/followers/:followerName
     */
    static RequestFollower: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const followed: string | string[] | undefined  = req.params['followerName'];
        if (!followed || typeof followed !== 'string')
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);

        const currentUser: string | undefined = req.currentUser?.username;
        if (currentUser == undefined)
            throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.FOLLOW_REQUEST_CREATE_FAILED);
        
        const result: FollowerFull = await FollowerService.RequestFollower(currentUser, followed);
        return MakeSuccess(res, StatusCodes.CREATED, result);
    });

    /**
     * Accepts a follower request to an account
     * Used by PUT /api/users/:username/followers/:followerName
     */
    static AcceptFollower: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const follows: string | string[] | undefined = req.params['followerName'];
        if (!follows || typeof follows !== 'string')
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);

        const currentUser: string | undefined   = req.currentUser?.username;
        if (currentUser == undefined)
            throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.FOLLOW_REQUEST_ACCEPT_FAILED);

        const result: FollowerFull = await FollowerService.AcceptFollower(currentUser, follows);
        return MakeSuccess(res, StatusCodes.ACCEPTED, result);
    });

    /**
     * Removes a follower to an account
     * Used by DELETE /api/users/:username/followers/:followerName
     */
    static RemoveFollower: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const follows: string | string[] | undefined = req.params['username'];
        const followed: string | string[] | undefined = req.params['followerName'];
        if (!follows || !followed || typeof follows !== 'string' || typeof followed !== 'string')
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);

        const currentUser: string | undefined = req.currentUser?.username;
        if (currentUser == undefined)
            throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.FOLLOWER_DELETE_FAILED);
        
        const result: FollowerFull = await FollowerService.RemoveFollower(currentUser, follows, followed);
        return MakeSuccess(res, StatusCodes.ACCEPTED, result)
    });

    /**
     * Gets the followers of an account
     * Used by GET /api/users/:username/followers
     */
    static GetFollowers: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const username: string | string[] | undefined = req.params['username']
        if (!username || typeof username !== 'string')
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);
        
        const result: FollowerFull[] = await FollowerService.GetFollowers(username, CurrentOptionalUser(req))
        return MakeSuccess(res, StatusCodes.OK, result)
    });

    /**
     * Gets the users followed by a user, if it's private only returns followed users if the current user follows it
     * Used by GET /api/users/:username/following
     */
    static GetFollowingByUser: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const username: string | string[] | undefined = req.params['username']
        if (!username || typeof username !== 'string')
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED)

        const result: FollowerFull[] = await FollowerService.GetFollowing(username, CurrentOptionalUser(req))
        return MakeSuccess(res, StatusCodes.OK, result)
    });

    /**
     * Gets the pending follower requests for a user
     * Used by GET /api/users/:username/followers/pending
     */
    static GetPendingRequests: any = AsyncHandler(async (req: Request, res: Response) => {
        const username: string | string[] | undefined = req.params['username']
        if (!username || typeof username !== 'string')
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);
        
        const result: FollowerFull[] = await FollowerService.GetPendingRequests(username)
        return MakeSuccess(res, StatusCodes.OK, result)
    });
}
