import {Request, Response, NextFunction} from "express"

export class AppError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
        this.name = "AppError";
    }
}

export const AsyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => 
        Promise.resolve(fn(req, res, next)).catch(next)
}

export function MakeSuccess(res: Response, code: number, result: any): Response {
    return res.status(code).json({status: 'success', data: result})
}
