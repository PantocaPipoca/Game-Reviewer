import {Request, Response, NextFunction} from "express"
import jwt from "jsonwebtoken"
import {StatusCodes} from "http-status-codes"
import dotenv from "dotenv"

import { AppError } from "./ErrorHandler";
import { UserPK } from "../types/Types";
import * as ErrorMessage from "./ErrorMessage";

dotenv.config();

// JWT payload structure (data stored in token)
export type JwtPayload = {
    username: string;
}

// Extended Request type with optional user info from JWT
export interface AuthRequest extends Request {
    currentUser?: JwtPayload;
}

const JWT_SECRET: string = process.env["JWT_SECRET"] ?? (() => { 
    throw new Error("JWT_SECRET must be set")
})();

const JWT_EXPIRES_IN: string = process.env["JWT_EXPIRES_IN"] || "7d";

/**
 * Generates a JWT token for a given username and email
 * The token will contain the username and email in its payload and will be signed with a secret key
 * The token will also have an expiration time defined by JWT_EXPIRES_IN
 * @param username name of the user 
 * @param email email of the user
 * @returns  the generated JWT token
 */
export function generateToken(username: string): string {
    return jwt.sign(
        {username},
        JWT_SECRET, 
        { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions // type assertion to satisfy TS
    );
}

/**
 * Middleware to verify JWT token and authenticate user
 * If valid, attaches user info to req.user and calls next()
 * If invalid/missing, responds with appropriate error status
 * @param req  - Request object, expected to have Authorization header with Bearer token
 * @param res  - Response object, used to send error responses if token is invalid/missing
 * @param next - Next function to call if authentication is successful
 * @returns    void (sends response if auth fails, otherwise calls next())
 */
export function auth(req: AuthRequest, res: Response, next: NextFunction): void {
    const token: string | undefined = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        res.status(StatusCodes.UNAUTHORIZED).json({error: "Token required"});
        return;
    }

    try {
        req.currentUser = jwt.verify(token, JWT_SECRET) as JwtPayload;
        next();
    } catch (error) {
        res.status(StatusCodes.UNAUTHORIZED).json({error: "Invalid token"});
    }
}

/**
 * Middleware to optionally verify JWT token if provided
 * If token is valid, attaches user info to req.user
 * If token is invalid/missing, simply calls next() without attaching user info
 * This allows routes to access req.user if authenticated, but also work for unauthenticated users
 * @param req  - Request object, may have Authorization header with Bearer token
 * @param res  - Response object, not used in this middleware but required for signature
 * @param next - Next function to call after processing token (regardless of validity)
 * @returns    void (always calls next(), never sends response)
 */
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
    const token: string | undefined = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
        try {
            req.currentUser = jwt.verify(token, JWT_SECRET) as JwtPayload;
        } catch {} // ignore invalid tokens without errors
    }
    
    next()
}

export function ExtractLoggedUser(req: AuthRequest): UserPK {
    const currentUser: string | undefined = req.currentUser?.username;
    if (!currentUser) 
        throw new AppError(StatusCodes.UNAUTHORIZED, ErrorMessage.UNAUTHORIZED_ACTION);
    return currentUser;
}