import {Request, Response} from "express"
import {AsyncHandler, MakeSuccess} from "../utils/ErrorHandler"
import {StatusCodes} from "http-status-codes"
import {ERR_ACC_BAD_EMAIL, ERR_ACC_MISSING_DISP, ERR_ACC_MISSING_EMAIL, ERR_ACC_MISSING_NAME, ERR_ACC_MISSING_PASS,
    ERR_ACC_SHORT_NAME, ERR_ACC_SHORT_PASS} from "../utils/ErrorMessage"
import {AccountService} from "../services/AccountService"

// REGEX that tests whether an email is valid
const email_regex: RegExp = /^[a-zA-Z0-9]+@[a-zA-Z0-9_.+-]+\.[a-zA-Z0-9_.+-]+$/

export class AccountController {
    static Register: any = AsyncHandler(async (req: Request, res: Response) => {
        const {accountName, displayName, password, email} = req.body
        if (!accountName)               ERR_ACC_MISSING_NAME.Throw()
        if (!displayName)               ERR_ACC_MISSING_DISP.Throw()
        if (!password)                  ERR_ACC_MISSING_PASS.Throw()
        if (!email)                     ERR_ACC_MISSING_EMAIL.Throw()
        if (accountName.length < 3)     ERR_ACC_SHORT_NAME.Throw()
        if (password.length < 8)        ERR_ACC_SHORT_PASS.Throw()
        if (!email_regex.test(email))   ERR_ACC_BAD_EMAIL.Throw()
        const result: any = await AccountService.RegisterUser(accountName, displayName, password, email)
        return MakeSuccess(res, StatusCodes.CREATED, result)
    })

    static Login: any = AsyncHandler(async (req: Request, res: Response) => {
        const {accountName, password} = req.body
        if (!accountName)   ERR_ACC_MISSING_NAME.Throw()
        if (!password)      ERR_ACC_MISSING_PASS.Throw()
        const result: any = await AccountService.LoginUser(accountName, password)
        return MakeSuccess(res, StatusCodes.OK, result)
    })

    static Alter: any = AsyncHandler(async (req: Request, res: Response) => {
        const {accountName, displayName, password, email} = req.body
        if (!accountName)                       ERR_ACC_MISSING_NAME.Throw()
        if (password! && password.length < 8)   ERR_ACC_SHORT_PASS.Throw()
        if (email! && !email_regex.test(email)) ERR_ACC_BAD_EMAIL.Throw()
        const result: any = await AccountService.AlterUser(accountName, displayName, password, email)
        return MakeSuccess(res, StatusCodes.ACCEPTED, result)
    })

    static Remove: any = AsyncHandler(async (req: Request, res: Response) => {
        const {accountName} = req.body
        if (!accountName) ERR_ACC_MISSING_NAME.Throw()
        const result: any = await AccountService.RemoveUser(accountName)
        return MakeSuccess(res, StatusCodes.ACCEPTED, result)
    })

    // Requires auth: TODO
    static GetCurrentUser: any = AsyncHandler(async (_: Request, res: Response) => {
        return MakeSuccess(res, StatusCodes.OK, {})
    })

    static FindByUsername: any = AsyncHandler(async (req: Request, res: Response) => {
    });

    static GetUsers: any = AsyncHandler(async (req: Request, res: Response) => {
    });
}
