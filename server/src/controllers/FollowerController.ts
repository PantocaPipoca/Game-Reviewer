import {Request, Response} from "express"
import {AsyncHandler, MakeSuccess} from "../utils/utils"
import {StatusCodes} from "http-status-codes"
import {ERR_FOL_MISSING_NAME1, ERR_FOL_MISSING_NAME2} from "../utils/UsualErrorMessage"
import {FollowerService} from "../services/FollowerService"

// Primary key for a follower
interface FollowerPrimaryKey {
    follows: string;
    followed: string;
}

// Returns a FollowerPrimaryKey based on a request, throwing if either field is missing
function ExtractUserNames(req: Request): FollowerPrimaryKey {
    const {follows, followed} = req.body
    if (!follows)   ERR_FOL_MISSING_NAME1.Throw()
    if (!followed)  ERR_FOL_MISSING_NAME2.Throw()
    return {follows, followed}
}

export class FollowerController {
    static RequestFollower = AsyncHandler(async (req: Request, res: Response) => {
        const pair: FollowerPrimaryKey  = ExtractUserNames(req);
        const result: any               = await FollowerService.RequestFollower(pair.follows, pair.followed);
        return MakeSuccess(res, StatusCodes.CREATED, result);
    });

    static AcceptFollower = AsyncHandler(async (req: Request, res: Response) => {
        const pair: FollowerPrimaryKey  = ExtractUserNames(req);
        const result: any               = await FollowerService.AcceptFollower(pair.follows, pair.followed);
        return MakeSuccess(res, StatusCodes.ACCEPTED, result);
    });

    static RemoveFollower = AsyncHandler(async (req: Request, res: Response) => {
        const pair: FollowerPrimaryKey  = ExtractUserNames(req);
        const result: any               = await FollowerService.RemoveFollower(pair.follows, pair.followed);
        return MakeSuccess(res, StatusCodes.ACCEPTED, result);
    });

    static GetFollowers = AsyncHandler(async (req: Request, res: Response) => {
    });
}
