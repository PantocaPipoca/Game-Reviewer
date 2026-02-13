import {prisma} from "../prisma"
import {ReviewType} from "../types/Types"
import {ERR_ACC_NOTEXISTS, ERR_GAME_NOTEXISTS, ERR_REV_DUPLICATE, ERR_REV_ISE_DEL, ERR_REV_ISE_NEW, ERR_REV_ISE_UPD, ERR_REV_NOTEXISTS} from "../utils/UsualErrorMessage"

// Throws if either the user or the game don't exist
async function CheckUserAndGame(accountName: string, gameName: string): Promise<void> {
    if (!(await prisma.user.findUnique({where: {accountName}})))
        ERR_ACC_NOTEXISTS.Throw()
    if (!(await prisma.game.findUnique({where: {gameName}})))
        ERR_GAME_NOTEXISTS.Throw()
}

// Finds a review given a user and a game
async function FetchReview(accountName: string, gameName: string): Promise<ReviewType> {
    return await prisma.review.findUnique({where: {reviewer: accountName, reviewed: gameName}})
}

export class ReviewService {
    static async FindReview(accountName: string, gameName: string): Promise<ReviewType> {
        CheckUserAndGame(accountName, gameName)
        const review: ReviewType = await FetchReview(accountName, gameName)
        if (!review) ERR_REV_NOTEXISTS.Throw()
        return review
    }

    static async PublishReview(accountName: string, gameName: string, text: string, score: number): Promise<ReviewType> {
        CheckUserAndGame(accountName, gameName)
        if (await FetchReview(accountName, gameName)) ERR_REV_DUPLICATE.Throw()
        const time: Date            = new Date(Date.now())
        const review: ReviewType    = {reviewer: accountName, reviewed: gameName, text, score, createdAt: time, updatedAt: time}
        if (!(await prisma.review.create({data: review}))) ERR_REV_ISE_NEW.Throw()
        return review
    }

    static async AlterReview(accountName: string, gameName: string, text?: string, score?: number): Promise<ReviewType> {
        CheckUserAndGame(accountName, gameName)
        const review: ReviewType = await FetchReview(accountName, gameName)
        if (!review) ERR_REV_NOTEXISTS.Throw()
        
        if (text!)  review.text = text
        if (score!) review.score = score
        review.updatedAt = new Date(Date.now())
        
        if (!(await prisma.review.update({
            where: {reviewer: accountName, reviewed: gameName},
            data: {text: review.text, score: review.score}
        }))) ERR_REV_ISE_UPD.Throw()
        return review
    }

    static async RemoveReview(accountName: string, gameName: string): Promise<ReviewType> {
        CheckUserAndGame(accountName, gameName)
        const review: ReviewType = await FetchReview(accountName, gameName)
        if (!review)                                                                                ERR_REV_NOTEXISTS.Throw()
        if (!(await prisma.review.delete({where: {reviewer: accountName, reviewed: gameName}})))    ERR_REV_ISE_DEL.Throw()
        return review
    }
}
