import {prisma} from "../prisma"
import {UserType} from "../types/Types"
import {ERR_ACC_BAD_PASS, ERR_ACC_DUPLICATE, ERR_ACC_ISE_DEL, ERR_ACC_ISE_NEW,
    ERR_ACC_ISE_UPD, ERR_ACC_NOTEXISTS} from "../utils/UsualErrorMessage"
import bcrypt from "bcrypt"

// Finds a user by name
async function FetchUser(accountName: string): Promise<UserType> {
    return await prisma.user.findUnique({where: {accountName}})
}

export class AccountService {
    static async RegisterUser(accountName: string, displayName: string, password: string, email: string): Promise<UserType> {
        if (await FetchUser(accountName)) ERR_ACC_DUPLICATE.Throw()

        const passwordHash: string  = await bcrypt.hash(password, 10)
        const time: Date            = new Date(Date.now())
        const user: UserType        = {accountName, passwordHash, email, createdAt: time, updatedAt: time, userData: {displayName}}

        if (!(await prisma.user.create({data: user}))) ERR_ACC_ISE_NEW.Throw()
        return user
    }

    static async LoginUser(accountName: string, password: string): Promise<UserType> {
        const user: UserType = await FetchUser(accountName)
        if (!user)                                                  ERR_ACC_NOTEXISTS.Throw()
        if (!(await bcrypt.compare(password, user.passwordHash)))   ERR_ACC_BAD_PASS.Throw()
        return user
    }

    static async AlterUser(accountName: string, displayName?: string, password?: string, email?: string): Promise<UserType> {
        const user: UserType = await FetchUser(accountName)
        if (!user) ERR_ACC_NOTEXISTS.Throw()

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
        }))) ERR_ACC_ISE_UPD.Throw()
        return user
    }

    static async RemoveUser(accountName: string): Promise<UserType> {
        const user: UserType = await FetchUser(accountName)
        if (!user)                                                  ERR_ACC_NOTEXISTS.Throw()
        if (!(await prisma.user.delete({where: {accountName}})))    ERR_ACC_ISE_DEL.Throw()
        return user
    }
}
