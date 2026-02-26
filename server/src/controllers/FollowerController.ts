import {Request, Response} from "express"
import {AsyncHandler, MakeSuccess, AppError} from "../utils/ErrorHandler"
import {StatusCodes} from "http-status-codes"
import {FollowerService} from "../services/FollowerService"

// Primary key for a follower
interface FollowerPrimaryKey {
    follows: string;
    followed: string;
}

// Returns a FollowerPrimaryKey based on a request, throwing if either field is missing
function ExtractUserNames(req: Request): FollowerPrimaryKey {
    const {follows, followed} = req.body
    return {follows, followed}
}

export class FollowerController {
    static RequestFollower = AsyncHandler(async (req: Request, res: Response) => {
    });

    static AcceptFollower = AsyncHandler(async (req: Request, res: Response) => {
    });

    static RemoveFollower = AsyncHandler(async (req: Request, res: Response) => {
    });

    static GetFollowers = AsyncHandler(async (req: Request, res: Response) => {
    });

    static GetFollowingByUser = AsyncHandler(async (req: Request, res: Response) => {
    });

    static GetPendingRequests = AsyncHandler(async (req: Request, res: Response) => {
    });
}
