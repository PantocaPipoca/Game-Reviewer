import {prisma} from "../prisma"
import {ReviewType} from "../types/Types"
import {StatusCodes} from "http-status-codes"
import {internalServerError} from "../utils/utils"

// Error messages
const err_acc_missing_name: string  = "No user name provided"
const err_acc_nonexistent: string   = "User doesn't exist"
const err_game_missing_name: string = "No game name provided"
const err_game_nonexistent: string  = "Game doesn't exist"
const err_rev_nonexistent: string   = "User has not reviewed the game"
const err_rev_missing_text: string  = "No critique provided"
const err_rev_missing_score: string = "No score provided"
const err_rev_invalid_score: string = "Invalid score"
const err_rev_duplicate: string     = "User already has reviewed the game"
const err_rev_ise_new: string       = "ISE: Create review"
const err_rev_ise_upd: string       = "ISE: Update review"
const err_rev_ise_del: string       = "ISE: Delete review"

// Throws if either the user or the game don't exist
async function check_user_and_game(accountName: string, gameName: string): Promise<void> {
    if (!accountName) throw {statusCode: StatusCodes.BAD_REQUEST, message: err_acc_missing_name}
    if (!gameName) throw {statusCode: StatusCodes.BAD_REQUEST, message: err_game_missing_name}

    if (!(await prisma.user.findUnique({where: {accountName}})))
        throw {statusCode: StatusCodes.NOT_FOUND, message: err_acc_nonexistent}
    if (!(await prisma.game.findUnique({where: {gameName}})))
        throw {statusCode: StatusCodes.NOT_FOUND, message: err_game_nonexistent}
}

// Throws if score is invalid
function check_score(score: any): void {
    if (typeof score !== 'number' || score < 0 || score > 10)
        throw {statusCode: StatusCodes.BAD_REQUEST, message: err_rev_invalid_score}
}

// Finds a review given a user and a game
async function fetch_review(accountName: string, gameName: string): Promise<ReviewType> {
    return await prisma.review.findUnique({where: {reviewer: accountName, reviewed: gameName}})
}

export class ReviewService {
    static async find_review(data: ReviewType) {
        const {reviewer, reviewed} = data
        check_user_and_game(reviewer, reviewed)

        const review: ReviewType = await fetch_review(reviewer, reviewed)
        if (!review) throw {statusCode: StatusCodes.NOT_FOUND, message: err_rev_nonexistent}

        return review
    }

    static async publish_review(data: ReviewType) {
        const {reviewer, reviewed, text, score} = data
        if (!text)  throw {statusCode: StatusCodes.BAD_REQUEST, message: err_rev_missing_text}
        if (!score) throw {statusCode: StatusCodes.BAD_REQUEST, message: err_rev_missing_score}
        check_score(score)
        check_user_and_game(reviewer, reviewed)

        if (await fetch_review(reviewer, reviewed))
            throw {statusCode: StatusCodes.CONFLICT, message: err_rev_duplicate}

        const time: Date            = new Date(Date.now())
        const review: ReviewType    = {reviewer, reviewed, text, score, createdAt: time, updatedAt: time}
        if (!(await prisma.review.create({data: review})))
            internalServerError(err_rev_ise_new)

        return review
    }

    static async alter_review(data: ReviewType) {
        const {reviewer, reviewed, text, score} = data
        if (score!) check_score(score)
        check_user_and_game(reviewer, reviewed)

        const review: ReviewType = await fetch_review(reviewer, reviewed)
        if (!review) throw {statusCode: StatusCodes.NOT_FOUND, message: err_rev_nonexistent}

        if (text!)  review.text = text
        if (score!) review.score = score
        review.updatedAt = new Date(Date.now())

        if (!(await prisma.review.update({
            where: {reviewer, reviewed},
            data: {text: review.text, score: review.score}
        })))
            internalServerError(err_rev_ise_upd)

        return review
    }

    static async remove_review(data: ReviewType) {
        const {reviewer, reviewed} = data
        check_user_and_game(reviewer, reviewed)

        const review: ReviewType = await fetch_review(reviewer, reviewed)
        if (!review) throw {statusCode: StatusCodes.NOT_FOUND, message: err_rev_nonexistent}

        if (!(await prisma.review.delete({where: {reviewer, reviewed}})))
            internalServerError(err_rev_ise_del)

        return review
    }
}