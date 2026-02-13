import {prisma} from "../prisma"
import {FollowerType} from "../types/Types"
import {ERR_ACC_NOTEXISTS, ERR_FOL_DUP_ACCEPT, ERR_FOL_DUP_REQUEST, ERR_FOL_ISE_DEL,
    ERR_FOL_ISE_NEW, ERR_FOL_ISE_UPD, ERR_FOL_NOREQUEST, ERR_FOL_NOTEXISTS} from "../utils/UsualErrorMessage"

// Checks whether either user doesn't exist, throwing an exception if either doesn't
async function CheckBothUsers(user1: string, user2: string): Promise<void> {
    if (!(await prisma.user.findUnique({where: {accountName: user1}}))
            || !(await prisma.user.findUnique({where: {accountName: user2}})))
        ERR_ACC_NOTEXISTS.Throw()
}

// Finds a follower request given two users
async function FetchRequest(follows: string, followed: string): Promise<FollowerType> {
    return await prisma.follower.findUnique({where: {follows, followed}})
}

export class FollowerService {
    static async RequestFollower(follows: string, followed: string): Promise<any> {
        CheckBothUsers(follows, followed)
        if (await FetchRequest(follows, followed)) ERR_FOL_DUP_REQUEST.Throw()

        const createdAt: Date = new Date(Date.now())
        if (!(await prisma.follower.create({data: {follows, followed, createdAt, acceptedAt: null, accepted: false}})))
            ERR_FOL_ISE_NEW.Throw()

        return {follows, followed, createdAt}
    }

    static async AcceptFollower(follows: string, followed: string): Promise<any> {
        CheckBothUsers(follows, followed)

        const request: FollowerType = await FetchRequest(follows, followed)
        if (!request)            ERR_FOL_NOREQUEST.Throw()
        if (request.accepted)    ERR_FOL_DUP_ACCEPT.Throw()

        const acceptedAt: Date = new Date(Date.now())
        if (!(await prisma.follower.update({where: {follows, followed}, data: {acceptedAt, accepted: true}})))
            ERR_FOL_ISE_UPD.Throw()

        return {follows, followed, createdAt: request.createdAt, acceptedAt}
    }

    static async RemoveFollower(follows: string, followed: string): Promise<any> {
        CheckBothUsers(follows, followed)
        if (!(await FetchRequest(follows, followed)))                       ERR_FOL_NOTEXISTS.Throw()
        if (!(await prisma.follower.delete({where: {follows, followed}})))  ERR_FOL_ISE_DEL.Throw()
        return {follows, followed}
    }
}
