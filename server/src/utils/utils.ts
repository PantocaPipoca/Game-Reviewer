import {Request, Response, NextFunction} from "express"
import {StatusCodes} from "http-status-codes"

export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => Promise.resolve(fn(req, res, next)).catch(next)
}

export function makeSuccess(res: Response, code: number, result: any) {
    return res.status(code).json({status: 'success', data: result})
}

export function internalServerError(message: string) {
    throw {statusCode: StatusCodes.INTERNAL_SERVER_ERROR, message}
}