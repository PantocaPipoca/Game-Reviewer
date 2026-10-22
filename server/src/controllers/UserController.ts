import { Request, Response } from "express";
import { AppError, asyncHandler, makeSuccess } from "../utils/ErrorHandler";
import * as ErrorMessage from "../utils/ErrorMessage";
import { StatusCodes } from "http-status-codes";
import { AccountService } from "../services/UserService";
import { AuthResponse, UserMe, UserPrivate, UserPublic } from "../types/Types";
import { AuthRequest, clearAuthCookie, extractLoggedUser, setAuthCookie } from "../utils/Auth";
import { sanitizeString } from "../utils/Sanitize";

// REGEX that tests whether an email is valid
const USER_REGEX: RegExp = /^[a-zA-Z0-9_]+$/;
const EMAIL_REGEX: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Lengths of inputs
export const NAME_MIN_LEN: number = 3;
export const NAME_MAX_LEN: number = 26;
export const PASS_MIN_LEN: number = 8;
export const PASS_MAX_LEN: number = 50;
export const EMAIL_MAX_LEN: number = 70;
export const GEND_MAX_LEN: number = 20;
export const BIO_MAX_LEN: number = 1000;

export class AccountController {
    /**
     * Registers a new user
     * Used by POST /api/users/
     * Does not require previous authentication
     */
    static register = asyncHandler(async (req: Request, res: Response) => {
        const { username, displayName, password, email } = req.body;
        if (!username) throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);
        if (!displayName) throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.DISPLAY_NAME_REQUIRED);
        if (!password) throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.PASSWORD_REQUIRED);
        if (!email) throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.EMAIL_REQUIRED);
        if (!USER_REGEX.test(username)) throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_INVALID);
        if (username.length < NAME_MIN_LEN)
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_TOO_SHORT);
        if (username.length > NAME_MAX_LEN)
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_TOO_LONG);
        if (displayName.length > NAME_MAX_LEN)
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.DISPLAY_NAME_TOO_LONG);
        if (password.length < PASS_MIN_LEN)
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.PASSWORD_TOO_SHORT);
        if (password.length > PASS_MAX_LEN) throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.PASSWORD_TOO_LONG);
        if (!EMAIL_REGEX.test(email)) throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.EMAIL_INVALID);
        if (email.length > EMAIL_MAX_LEN) throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.EMAIL_TOO_LONG);

        const result: string | AuthResponse = await AccountService.registerUser(
            username,
            displayName,
            password,
            email,
            process.env["NODE_ENV"] === "test" // only validate email in tests
        );
        return makeSuccess(res, StatusCodes.CREATED, result);
    });

    /**
     * Validates a registered user
     * Used by GET /api/users/verification
     * Does not require previous authentication
     */
    static validate = asyncHandler(async (req: Request, res: Response) => {
        const { user, code } = req.query;
        if (typeof user !== "string" || typeof code !== "number") {
            throw new AppError(StatusCodes.BAD_REQUEST, "invalid parameters");
        }

        const codeNum: number = Number.parseInt(code);
        if (!Number.isInteger(codeNum)) throw new AppError(StatusCodes.BAD_REQUEST, "invalid parameters");
        const result: AuthResponse = await AccountService.verify(user, codeNum);
        setAuthCookie(res, result.token);
        return makeSuccess(res, StatusCodes.OK, result);
    });

    /**
     * Logins a new user
     * Used by POST /api/users/login
     * Does not require previous authentication
     */
    static login = asyncHandler(async (req: Request, res: Response) => {
        const { username, password } = req.body;
        if (!username) throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);
        if (!password) throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.PASSWORD_REQUIRED);

        const sanitizedName = sanitizeString(username);
        const result: AuthResponse = await AccountService.loginUser(sanitizedName, password);
        setAuthCookie(res, result.token);
        return makeSuccess(res, StatusCodes.OK, result);
    });

    /**
     * Logouts a user
     * Used by POST /api/users/logout
     * Requires previous authentication
     */
    static logout = asyncHandler(async (_: AuthRequest, res: Response) => {
        clearAuthCookie(res);
        res.status(StatusCodes.OK).json({ status: "success", data: null });
    });

    /**
     * Gets the currently logged in user
     * Used by GET /api/users/me
     * Requires previous authentication
     */
    static getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string = extractLoggedUser(req);

        const result: UserMe = await AccountService.getCurrentUser(currentUser);
        return makeSuccess(res, StatusCodes.OK, result);
    });

    /**
     * Changes a user information
     * Used by PUT /api/users/me
     * Requires previous authentication
     */
    static update = asyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string = extractLoggedUser(req);
        const { profilePic, isPrivate, password, email, userData } = req.body;

        if (isPrivate === undefined || email === undefined || userData === undefined)
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);
        if (email !== undefined) {
            if (typeof email !== "string" || !EMAIL_REGEX.test(email))
                throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.EMAIL_INVALID);
            if (email.length > EMAIL_MAX_LEN) throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.EMAIL_TOO_LONG);
        }
        if (password !== undefined) {
            if (typeof password !== "string" || password.length < PASS_MIN_LEN)
                throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.PASSWORD_TOO_SHORT);
            if (password.length > PASS_MAX_LEN)
                throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.PASSWORD_TOO_LONG);
        }
        if (userData !== undefined && userData !== null) {
            if (
                userData.displayName !== undefined &&
                userData.displayName !== null &&
                userData.displayName.length > NAME_MAX_LEN
            )
                throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_TOO_LONG);
            if (userData.gender !== undefined && userData.gender !== null && userData.gender.length > GEND_MAX_LEN)
                throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.GENDER_TOO_LONG);
            if (userData.bio !== undefined && userData.bio !== null && userData.bio.length > BIO_MAX_LEN)
                throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.BIO_TOO_LONG);
        }

        const result: UserMe = await AccountService.updateUser(
            currentUser,
            isPrivate,
            email,
            userData,
            password,
            profilePic
        );
        return makeSuccess(res, StatusCodes.OK, result);
    });

    /**
     * Removes a user
     * Used by DELETE /api/users/me
     * Requires previous authentication
     */
    static remove = asyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string = extractLoggedUser(req);

        const result: UserPublic = await AccountService.removeUser(currentUser);
        return makeSuccess(res, StatusCodes.OK, result);
    });

    /**
     * Finds a user by username
     * Used by GET /api/users/:username
     * (optional authentication)
     */
    static findByUsername = asyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string | undefined = req.currentUser?.username;

        const username: string | string[] | undefined = req.params["username"];
        if (!username || typeof username !== "string")
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);

        const result: UserPublic | UserPrivate = await AccountService.findByUsername(username, currentUser);
        return makeSuccess(res, StatusCodes.OK, result);
    });

    /**
     * Searches users by username
     * Used by GET /api/users/search?query=...
     * (optional authentication)
     */
    static search = asyncHandler(async (req: AuthRequest, res: Response) => {
        let query: any = req.query["query"];
        const offset: any = req.query["offset"];
        const limit: any = req.query["limit"];

        if (typeof query !== "string") throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.UNAUTHORIZED_ACTION);

        try {
            query = decodeURIComponent(query);
        } catch (_) {}

        const sanitized: string = sanitizeString(query);
        if (sanitized.length === 0) throw new AppError(StatusCodes.BAD_REQUEST, "Invalid query");

        const currentUser: string | undefined = req.currentUser?.username;
        const parsedOffset = offset ? parseInt(offset, 10) : undefined;
        const parsedLimit = limit ? parseInt(limit, 10) : undefined;

        const result: (UserPublic | UserPrivate)[] = await AccountService.searchUsersByName(
            sanitized,
            currentUser,
            parsedOffset,
            parsedLimit
        );
        return makeSuccess(res, StatusCodes.OK, result);
    });

    static uploadAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser = extractLoggedUser(req);
        if (!req.file) throw new AppError(StatusCodes.BAD_REQUEST, "No file provided");
        const url = await AccountService.uploadAvatar(currentUser, req.file.buffer);
        return makeSuccess(res, StatusCodes.OK, { url });
    });

    static getAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
        const username = req.params["username"];
        if (!username || typeof username !== "string")
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);
        const url = await AccountService.getAvatar(username);
        res.redirect(url);
    });

    static grantPasswordReset = asyncHandler(async (req: Request, res: Response) => {
        const { username } = req.body;
        if (typeof username !== "string") {
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);
        }
        try {
            await AccountService.grantPasswordReset(username, true);
        } catch (err) {
            if (err instanceof AppError) {
                throw err;
            }
            throw new AppError(StatusCodes.BAD_REQUEST, "magical error");
        }
        return makeSuccess(res, StatusCodes.OK, "email sent");
    });

    static usePasswordReset = asyncHandler(async (req: Request, res: Response) => {
        const { username, passResetCode, password } = req.body;
        if (typeof username !== "string") {
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);
        }
        if (typeof password !== "string") {
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.PASSWORD_REQUIRED);
        }
        if (typeof passResetCode !== "number") {
            throw new AppError(StatusCodes.BAD_REQUEST, "passResetCode required");
        }
        try {
            await AccountService.usePasswordReset(username, passResetCode, password);
        } catch (err) {
            if (err instanceof AppError) {
                throw err;
            }
            throw new AppError(StatusCodes.BAD_REQUEST, "magical error");
        }
        return makeSuccess(res, StatusCodes.OK, "password reset");
    });
}
