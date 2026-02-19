import {Request, Response} from "express"
import {AppError, AsyncHandler, MakeSuccess} from "../utils/ErrorHandler"
import * as ErrorMessage from "../utils/ErrorMessage"
import {StatusCodes} from "http-status-codes"
import {AccountService} from "../services/AccountService"
import { AuthResponse } from "../types/Types"

// REGEX that tests whether an email is valid
const email_regex: RegExp = /^[a-zA-Z0-9]+@[a-zA-Z0-9_.+-]+\.[a-zA-Z0-9_.+-]+$/;

export class AccountController {

    /**
     * Registers a new user
     * Used by POST /api/users/register
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
        if (!email_regex.test(email))   
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.EMAIL_INVALID);

        const result: any = await AccountService.RegisterUser(accountName, displayName, password, email);

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
    static GetCurrentUser: any = AsyncHandler(async (_: Request, res: Response) => {
        
    })
    

    /**
     * Changes a user information
     * Used by PUT /api/users/me
     * Requires previous authentication
     */
    static Alter: any = AsyncHandler(async (req: Request, res: Response) => {
        const {accountName, displayName, password, email} = req.body;
        if (!accountName)
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);
        if (password! && password.length < 8)
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.PASSWORD_TOO_SHORT);
        if (email! && !email_regex.test(email))
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.EMAIL_INVALID);

        const result: any = await AccountService.AlterUser(accountName, displayName, password, email);

        return MakeSuccess(res, StatusCodes.ACCEPTED, result)
    })

    /**
     * Removes a user
     * Used by DELETE /api/users/me
     * Requires previous authentication
     */
    static Remove: any = AsyncHandler(async (req: Request, res: Response) => {
        const {accountName} = req.body;
        if (!accountName)
            throw new AppError(StatusCodes.BAD_REQUEST, ErrorMessage.ACCOUNT_NAME_REQUIRED);

        const result: any = await AccountService.RemoveUser(accountName);

        return MakeSuccess(res, StatusCodes.ACCEPTED, result);
    })

    /**
     * Finds a user by username
     * Used by GET /api/users/:username
     * (optional authentication)
     */
    static FindByUsername: any = AsyncHandler(async (req: Request, res: Response) => {
    });
    


    // TODO Later
    /**
     * Searches users by username
     * Used by GET /api/users/search?query=...
     * (optional authentication)
     */
    static Search: any = AsyncHandler(async (req: Request, res: Response) => {
    });

}
