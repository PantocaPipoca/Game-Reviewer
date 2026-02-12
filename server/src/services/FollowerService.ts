import {prisma} from "../prisma"
import {FollowerType} from "../types/Types"
import {StatusCodes} from "http-status-codes"
import {internalServerError} from "../utils/utils"

// Error messages
const err_acc_nonexistent: string   = "User doesn't exist"
const err_fol_name1: string         = "No follower name provided"
const err_fol_name2: string         = "No followed name provided"
const err_fol_duplicate: string     = "User already requested to follow user"
const err_fol_norequest: string     = "User didn't request to follow user"
const err_fol_dupaccept: string     = "User already accepted follower request"
const err_fol_nonexistent: string   = "User doesn't follow user yet"
const err_fol_ise_new: string       = "ISE: Create follower request"
const err_fol_ise_upd: string       = "ISE: Accept follower request"
const err_fol_ise_del: string       = "ISE: Remove follower"

// Checks whether either user doesn't exist, throwing an exception if either doesn't
async function check_both_users(user1: string, user2: string) {
    if (!(await prisma.user.findUnique({where: {accountName: user1}}))
            || !(await prisma.user.findUnique({where: {accountName: user2}})))
        throw {statusCode: StatusCodes.NOT_FOUND, message: err_acc_nonexistent}
}

// Finds a follower request given two users
async function fetch_request(follows: string, followed: string): Promise<FollowerType> {
    return await prisma.follower.findUnique({where: {follows, followed}})
}

export class FollowerService {
    static async request_follower(data: FollowerType) {
        const {follows, followed} = data
        if (!follows)   throw {statusCode: StatusCodes.BAD_REQUEST, message: err_fol_name1}
        if (!followed)  throw {statusCode: StatusCodes.BAD_REQUEST, message: err_fol_name2}

        check_both_users(follows, followed)

        if (await fetch_request(follows, followed))
            throw {statusCode: StatusCodes.CONFLICT, message: err_fol_duplicate}

        const createdAt: Date = new Date(Date.now())
        if (!(await prisma.follower.create({data: {follows, followed, createdAt, acceptedAt: null, accepted: false}})))
            internalServerError(err_fol_ise_new)

        return {follows, followed, createdAt}
    }

    static async accept_follower(data: FollowerType) {
        const {follows, followed} = data
        if (!follows)   throw {statusCode: StatusCodes.BAD_REQUEST, message: err_fol_name1}
        if (!followed)  throw {statusCode: StatusCodes.BAD_REQUEST, message: err_fol_name2}

        check_both_users(follows, followed)
        
        const folreq: FollowerType = await fetch_request(follows, followed)
        if (!folreq)            throw {statusCode: StatusCodes.CONFLICT, message: err_fol_norequest}
        if (folreq.accepted)    throw {statusCode: StatusCodes.CONFLICT, message: err_fol_dupaccept}

        const acceptedAt: Date = new Date(Date.now())
        if (!(await prisma.follower.update({where: {follows, followed}, data: {acceptedAt, accepted: true}})))
            internalServerError(err_fol_ise_upd)

        return {follows, followed, createdAt: folreq.createdAt, acceptedAt}
    }

    static async remove_follower(data: FollowerType) {
        const {follows, followed} = data
        if (!follows)   throw {statusCode: StatusCodes.BAD_REQUEST, message: err_fol_name1}
        if (!followed)  throw {statusCode: StatusCodes.BAD_REQUEST, message: err_fol_name2}

        check_both_users(follows, followed)

        if (!(await fetch_request(follows, followed)))
            throw {statusCode: StatusCodes.CONFLICT, message: err_fol_nonexistent}

        if (!(await prisma.follower.delete({where: {follows, followed}})))
            internalServerError(err_fol_ise_del)

        return {follows, followed}
    }
}