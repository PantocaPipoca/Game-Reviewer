import {StatusCodes} from "http-status-codes"

class UsualErrorMessage {
    statusCode: number;
    message: string;

    constructor(statusCode: number, message: string) {
        this.statusCode = statusCode
        this.message = message
    }

    Throw(): void {
        throw {statusCode: this.statusCode, message: this.message}
    }
}

// 400 BAD REQUEST
export const ERR_ACC_MISSING_NAME: UsualErrorMessage   = new UsualErrorMessage(StatusCodes.BAD_REQUEST, "Missing user name field")
export const ERR_ACC_MISSING_DISP: UsualErrorMessage   = new UsualErrorMessage(StatusCodes.BAD_REQUEST, "Missing display name field")
export const ERR_ACC_MISSING_PASS: UsualErrorMessage   = new UsualErrorMessage(StatusCodes.BAD_REQUEST, "Missing password field")
export const ERR_ACC_MISSING_EMAIL: UsualErrorMessage  = new UsualErrorMessage(StatusCodes.BAD_REQUEST, "Missing email field")
export const ERR_ACC_SHORT_NAME: UsualErrorMessage     = new UsualErrorMessage(StatusCodes.BAD_REQUEST, "User name is too short")
export const ERR_ACC_SHORT_PASS: UsualErrorMessage     = new UsualErrorMessage(StatusCodes.BAD_REQUEST, "Password is too short")
export const ERR_ACC_BAD_EMAIL: UsualErrorMessage      = new UsualErrorMessage(StatusCodes.BAD_REQUEST, "Email provided is invalid")
export const ERR_FOL_MISSING_NAME1: UsualErrorMessage  = new UsualErrorMessage(StatusCodes.BAD_REQUEST, "Missing follower name field")
export const ERR_FOL_MISSING_NAME2: UsualErrorMessage  = new UsualErrorMessage(StatusCodes.BAD_REQUEST, "Missing followed name field")
export const ERR_GAME_MISSING_NAME: UsualErrorMessage  = new UsualErrorMessage(StatusCodes.BAD_REQUEST, "Missing game name field")
export const ERR_REV_MISSING_TEXT: UsualErrorMessage   = new UsualErrorMessage(StatusCodes.BAD_REQUEST, "Missing critique provided field")
export const ERR_REV_MISSING_SCORE: UsualErrorMessage  = new UsualErrorMessage(StatusCodes.BAD_REQUEST, "Missing score field")
export const ERR_REV_BAD_SCORE: UsualErrorMessage      = new UsualErrorMessage(StatusCodes.BAD_REQUEST, "Invalid score field")

// 403 FORBIDDEN
export const ERR_ACC_BAD_PASS: UsualErrorMessage       = new UsualErrorMessage(StatusCodes.FORBIDDEN, "Wrong password")

// 404 NOT FOUND
export const ERR_ACC_NOTEXISTS: UsualErrorMessage      = new UsualErrorMessage(StatusCodes.NOT_FOUND, "User name doesn't exist")
export const ERR_GAME_NOTEXISTS: UsualErrorMessage     = new UsualErrorMessage(StatusCodes.NOT_FOUND, "Game doesn't exist")
export const ERR_REV_NOTEXISTS: UsualErrorMessage      = new UsualErrorMessage(StatusCodes.NOT_FOUND, "User has not reviewed the game")

// 409 CONFLICT
export const ERR_ACC_DUPLICATE: UsualErrorMessage      = new UsualErrorMessage(StatusCodes.CONFLICT, "User name is already used")
export const ERR_FOL_DUP_REQUEST: UsualErrorMessage    = new UsualErrorMessage(StatusCodes.CONFLICT, "User already requested to follow user")
export const ERR_FOL_NOREQUEST: UsualErrorMessage      = new UsualErrorMessage(StatusCodes.CONFLICT, "User didn't request to follow user")
export const ERR_FOL_DUP_ACCEPT: UsualErrorMessage     = new UsualErrorMessage(StatusCodes.CONFLICT, "User already accepted follower request")
export const ERR_FOL_NOTEXISTS: UsualErrorMessage      = new UsualErrorMessage(StatusCodes.CONFLICT, "User doesn't follow user yet")
export const ERR_REV_DUPLICATE: UsualErrorMessage      = new UsualErrorMessage(StatusCodes.CONFLICT, "User already has reviewed the game")

// 500 INTERNAL SERVER ERROR
export const ERR_ACC_ISE_NEW: UsualErrorMessage        = new UsualErrorMessage(StatusCodes.INTERNAL_SERVER_ERROR, "Couldn't create account")
export const ERR_ACC_ISE_UPD: UsualErrorMessage        = new UsualErrorMessage(StatusCodes.INTERNAL_SERVER_ERROR, "Couldn't update account")
export const ERR_ACC_ISE_DEL: UsualErrorMessage        = new UsualErrorMessage(StatusCodes.INTERNAL_SERVER_ERROR, "Couldn't remove account")
export const ERR_FOL_ISE_NEW: UsualErrorMessage        = new UsualErrorMessage(StatusCodes.INTERNAL_SERVER_ERROR, "Couldn't create follower request")
export const ERR_FOL_ISE_UPD: UsualErrorMessage        = new UsualErrorMessage(StatusCodes.INTERNAL_SERVER_ERROR, "Couldn't cccept follower request")
export const ERR_FOL_ISE_DEL: UsualErrorMessage        = new UsualErrorMessage(StatusCodes.INTERNAL_SERVER_ERROR, "Couldn't remove follower")
export const ERR_REV_ISE_NEW: UsualErrorMessage        = new UsualErrorMessage(StatusCodes.INTERNAL_SERVER_ERROR, "Couldn't create review")
export const ERR_REV_ISE_UPD: UsualErrorMessage        = new UsualErrorMessage(StatusCodes.INTERNAL_SERVER_ERROR, "Couldn't update review")
export const ERR_REV_ISE_DEL: UsualErrorMessage        = new UsualErrorMessage(StatusCodes.INTERNAL_SERVER_ERROR, "Couldn't remove review")
