import {Request, Response} from "express"
import {AsyncHandler, MakeSuccess, AppError} from "../utils/ErrorHandler"
import {StatusCodes} from "http-status-codes"
import {FollowerService} from "../services/FollowerService"
import * as ErrorMessage from "../utils/ErrorMessage"
import { FollowerFull } from "../types/Types"
import { AuthRequest, CurrentOptionalUser } from "../utils/auth"

export class FollowerController {
    static RequestFollower = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const followed: string | string[] | undefined   = req.params['followerName'];
        if (!followed || typeof followed !== 'string')
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);
        const currentUser: string | undefined                   = req.currentUser?.username;
        if (currentUser == undefined) throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.FOLLOW_REQUEST_CREATE_FAILED);
        
        const result = FollowerService.RequestFollower(currentUser, followed);
        return MakeSuccess(res, StatusCodes.CREATED, result);
    });

    static AcceptFollower = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const follows: string | string[] | undefined    = req.params['followerName'];
        if (!follows || typeof follows !== 'string')
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);
        const currentUser: string | undefined   = req.currentUser?.username;
        if (currentUser == undefined) throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.FOLLOW_REQUEST_ACCEPT_FAILED);

        const result = FollowerService.AcceptFollower(currentUser, follows);
        return MakeSuccess(res, StatusCodes.ACCEPTED, result);
    });

    static RemoveFollower = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const follows: string | string[] | undefined       = req.params['username'];
        const followed: string | string[] | undefined   = req.params['followerName'];
        if (!follows || !followed || typeof follows !== 'string' || typeof followed !== 'string')
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);
        const currentUser: string | undefined   = req.currentUser?.username;
        if (currentUser == undefined) throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.FOLLOWER_DELETE_FAILED);
        
        const result = FollowerService.RemoveFollower(currentUser, follows, followed);
        return MakeSuccess(res, StatusCodes.ACCEPTED, result)
    });

    static GetFollowers = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const username: string | string[] | undefined = req.params['username']
        if (!username || typeof username !== 'string')
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);
        
        const result = FollowerService.GetFollowers(username, CurrentOptionalUser(req))
        return MakeSuccess(res, StatusCodes.OK, result)
    });

    static GetFollowingByUser = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const username: string | string[] | undefined = req.params['username']
        if (!username || typeof username !== 'string')
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED)

        const result = FollowerService.GetFollowing(username, CurrentOptionalUser(req))
        return MakeSuccess(res, StatusCodes.OK, result)
    });

    static GetPendingRequests = AsyncHandler(async (req: Request, res: Response) => {
        const username: string | string[] | undefined = req.params['username']
        if (!username || typeof username !== 'string')
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);
        
        const result = FollowerService.GetPendingRequests(username)
        return MakeSuccess(res, StatusCodes.OK, result)
    });
}
