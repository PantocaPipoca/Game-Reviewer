import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
    constructor(
        public status: number,
        message: string
    ) {
        super(message);
        this.name = "AppError";
    }
}

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export function makeSuccess(res: Response, code: number, result: any): Response {
    return res.status(code).json({ status: "success", data: result });
}
