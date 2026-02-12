import {prisma} from "../prisma"
import {LoginType, RegisterType, UserType} from "../types/Types"
import {StatusCodes} from "http-status-codes"
import bcrypt from "bcrypt"
import {internalServerError} from "../utils/utils"

// REGEX that tests whether an email is valid
const email_regex: RegExp = /^[a-zA-Z0-9]+@[a-zA-Z0-9_.+-]+\.[a-zA-Z0-9_.+-]+$/

// Error messages
const err_acc_missing_name: string          = "No user name provided"
const err_acc_missing_disp: string          = "No display name provided"
const err_acc_missing_pass: string          = "No password provided"
const err_acc_missing_email: string         = "No email provided"
const err_acc_short_name: string            = "User name too short"
const err_acc_short_pass: string            = "Password too short"
const err_acc_bad_email: string             = "Email provided is invalid"
const err_acc_new_duplicate_name: string    = "Name is already used"
const err_acc_nonexistent: string           = "User doesn't exist"
const err_acc_bad_pass: string              = "Wrong password"
const err_acc_ise_new: string               = "ISE: Create account"
const err_acc_ise_upd: string               = "ISE: Update account"
const err_acc_ise_del: string               = "ISE: Delete account"

export class AccountService {
    static async register(data: RegisterType) {
        const {accountName, displayName, password, email} = data
        if (!accountName)               throw {statusCode: StatusCodes.BAD_REQUEST, message: err_acc_missing_name}
        if (!displayName)               throw {statusCode: StatusCodes.BAD_REQUEST, message: err_acc_missing_disp}
        if (!password)                  throw {statusCode: StatusCodes.BAD_REQUEST, message: err_acc_missing_pass}
        if (!email)                     throw {statusCode: StatusCodes.BAD_REQUEST, message: err_acc_missing_email}
        if (accountName.length < 3)     throw {statusCode: StatusCodes.BAD_REQUEST, message: err_acc_short_name}
        if (password.length < 8)        throw {statusCode: StatusCodes.BAD_REQUEST, message: err_acc_short_pass}
        if (!email_regex.test(email))   throw {statusCode: StatusCodes.BAD_REQUEST, message: err_acc_bad_email}

        if (await prisma.user.findUnique({where: {accountName}}))
            throw {statusCode: StatusCodes.CONFLICT, message: err_acc_new_duplicate_name}   

        const passwordHash: string  = await bcrypt.hash(password, 10)
        const time: Date            = new Date(Date.now())
        const user: UserType        = {accountName, passwordHash, email, createdAt: time, updatedAt: time, userData: {displayName}}

        if (!(await prisma.user.create({data: user})))
            internalServerError(err_acc_ise_new)

        return user
    }

    static async login(data: LoginType) {
        const {accountName, password} = data
        if (!accountName)   throw {statusCode: StatusCodes.BAD_REQUEST, message: err_acc_missing_name}
        if (!password)      throw {statusCode: StatusCodes.BAD_REQUEST, message: err_acc_missing_pass}

        const user: UserType = await prisma.user.findUnique({where: {accountName}})
        if (!user) throw {statusCode: StatusCodes.NOT_FOUND, message: err_acc_nonexistent}

        if (!(await bcrypt.compare(password, user.passwordHash)))
            throw {statusCode: StatusCodes.FORBIDDEN, message: err_acc_bad_pass}

        return user
    }

    static async alter(data: RegisterType) {
        const {accountName, displayName, password, email} = data
        if (!accountName)                       throw {statusCode: StatusCodes.BAD_REQUEST, message: err_acc_missing_name}
        if (password! && password.length < 8)   throw {statusCode: StatusCodes.BAD_REQUEST, message: err_acc_short_pass}
        if (email! && !email_regex.test(email)) throw {statusCode: StatusCodes.BAD_REQUEST, message: err_acc_bad_email}

        const user: UserType = await prisma.user.findUnique({where: {accountName}})
        if (!user) throw {statusCode: StatusCodes.NOT_FOUND, message: err_acc_nonexistent}

        if (displayName!)   user.userData.displayName = displayName
        if (password!)      user.passwordHash = await bcrypt.hash(password, 10)
        if (email!)         user.email = email
        user.updatedAt = new Date(Date.now())

        if (!(await prisma.user.update({
            where: {accountName},
            data: {
                passwordHash: user.passwordHash,
                email: user.email,
                updateAt: user.updatedAt,
                userData: {
                    displayName: user.userData.displayName
                }
            }
        }))) internalServerError(err_acc_ise_upd)
        
        return user
    }

    static async remove(data: UserType) {
        const {accountName} = data
        if (!accountName) throw {statusCode: StatusCodes.BAD_REQUEST, message: err_acc_missing_name}

        const user = await prisma.user.findUnique({where: {accountName}})
        if (!user) throw {statusCode: StatusCodes.NOT_FOUND, message: err_acc_nonexistent}

        if (!(await prisma.user.delete({where: {accountName}})))
            internalServerError(err_acc_ise_del)

        return user
    }
}