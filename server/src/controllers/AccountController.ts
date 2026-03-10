import {Request, Response} from "express"
import {AppError, AsyncHandler, MakeSuccess} from "../utils/ErrorHandler"
import * as ErrorMessage from "../utils/ErrorMessage"
import {StatusCodes} from "http-status-codes"
import {AccountService} from "../services/AccountService"
import { AuthResponse, UserPublic } from "../types/Types"
import { AuthRequest, ExtractLoggedUser, JwtPayload } from "../utils/auth"

// REGEX that tests whether an email is valid
const EMAIL_REGEX: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


export class AccountController {

    /**
     * Registers a new user
     * Used by POST /api/users/
     * Does not require previous authentication
     */
    static Register: any = AsyncHandler(async (req: Request, res: Response) => {
        const {accountName, displayName, password, email} = req.body;
        if (!accountName)
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);
        if (!displayName)
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.DISPLAY_NAME_REQUIRED);
        if (!password)
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.PASSWORD_REQUIRED);
        if (!email)
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.EMAIL_REQUIRED);
        if (accountName.length < 3)
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_TOO_SHORT);
        if (password.length < 8)
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.PASSWORD_TOO_SHORT);
        if (!EMAIL_REGEX.test(email))
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.EMAIL_INVALID);

        const result: AuthResponse = await AccountService.RegisterUser(accountName, displayName, password, email);
        return MakeSuccess(res, StatusCodes.CREATED, result);
    })

    /**
     * Logins a new user
     * Used by POST /api/users/login
     * Does not require previous authentication
     */
    static Login: any = AsyncHandler(async (req: Request, res: Response) => {
        const {accountName, password} = req.body;
        if (!accountName)
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);
        if (!password)
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.PASSWORD_REQUIRED);

        const result: AuthResponse = await AccountService.LoginUser(accountName, password);
        return MakeSuccess(res, StatusCodes.OK, result);
    })

    /**
     * Gets the currently logged in user
     * Used by GET /api/users/me
     * Requires previous authentication
     */
    static GetCurrentUser: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string = ExtractLoggedUser(req);
        
        const result: UserPublic = await AccountService.GetCurrentUser(currentUser);
        return MakeSuccess(res, StatusCodes.OK, result);
    })
    
    /**
     * Changes a user information
     * Used by PUT /api/users/me
     * Requires previous authentication
     */
    static Alter: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string = ExtractLoggedUser(req);

        const {isPrivate: isPrivate, password: password, email: email, userData: userData} = req.body;
        if(password != undefined){
            if (typeof password !== "string" || password.length < 8)
                throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.PASSWORD_TOO_SHORT);
        }
        if(email != undefined){
            if (typeof email !== "string" || !EMAIL_REGEX.test(email))
                throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.EMAIL_INVALID);
        }
        const result: UserPublic = await AccountService.AlterUser(currentUser, isPrivate, password, email, userData);
        return MakeSuccess(res, StatusCodes.OK, result);
    })

    /**
     * Removes a user
     * Used by DELETE /api/users/me
     * Requires previous authentication
     */
    static Remove: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string = ExtractLoggedUser(req);

        const result: UserPublic = await AccountService.RemoveUser(currentUser);
        return MakeSuccess(res, StatusCodes.OK, result);
    })

    /**
     * Finds a user by username
     * Used by GET /api/users/:username
     * (optional authentication)
     */
    static FindByUsername: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const currentUser: string | undefined = req.currentUser?.username;
        
        const username: string | string[] | undefined = req.params['username'];
        if (!username || typeof username !== 'string')
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);

        const result: UserPublic = await AccountService.FindByUsername(username, currentUser);
        return MakeSuccess(res, StatusCodes.OK, result);
    });
    

    /**
     * Searches users by username
     * Used by GET /api/users/search?query=...
     * (optional authentication)
     */
    static Search: any = AsyncHandler(async (req: AuthRequest, res: Response) => {
        const filter: any = req.query['query'];
        if (typeof filter !== 'string')
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.UNAUTHORIZED_ACTION);

        const currentUser: string | undefined = req.currentUser?.username;
        const result: UserPublic[] = await AccountService.SearchUsersByName(filter, currentUser);
        return MakeSuccess(res, StatusCodes.OK, result);
    });
}
