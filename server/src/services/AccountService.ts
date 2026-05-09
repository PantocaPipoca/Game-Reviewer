import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import * as ErrorMessage from "../utils/ErrorMessage";
import { AppError } from "../utils/ErrorHandler";
import { generateToken } from "../utils/Auth";
import { UserRepository } from "../Repository/UserRepository";
import { UserData, UserFull, UserPK, AuthResponse, UserPublic, UserPrivate, UserMe } from "../types/Types";
import { FollowerRepository } from "../Repository/FollowerRepository";
import { uploadAvatar } from "../utils/Cloudinary";

import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { randomInt } from "node:crypto";
import logger from "../utils/Logger";
dotenv.config();

const EMAIL = process.env["EMAIL"];
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: EMAIL,
        pass: process.env["EMAIL_PASSWORD"],
    },
});

const SALT_ROUNDS = 10; // number of iterations for bcrypt password hashing

/**
 * Gets a user full object by username and throws an error if the user doesn't exist
 * @param username - username of the user to fetch
 * @returns Full User object if found
 * @throws AppError if the user doesn't exist (HTTP 404)
 */
export async function fetchFullUser(username: UserPK): Promise<UserFull> {
    const user: UserFull | null = await UserRepository.selectUser(username);

    if (!user) throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.ACCOUNT_NOT_FOUND);

    return user;
}

/**
 * Gets a user public object by username (only public fields)
 * @param username - username of the user to fetch
 * @returns Public User object if found
 * @throws AppError if the user doesn't exist (HTTP 404)
 *
 */
export async function fetchPublicUser(username: UserPK): Promise<UserPublic> {
    const user: UserFull = await fetchFullUser(username);

    return userFullToPublic(user);
}

/**
 * Removes non-public info from a user object
 * @param user the user with all their info
 * @returns the user with only their public info
 */
export function userFullToPublic(user: UserFull): UserPublic {
    return {
        accountName: user.accountName,
        avatar: user.avatar,
        isPrivate: user.isPrivate,
        userData: user.userData as UserData,
        createdAt: user.createdAt,
    };
}

/**
 * Checks if a user can view another user's profile based on privacy settings
 * @param targetUser the user being viewed
 * @param currentUser the user requesting (undefined if not authenticated) - confirmed by auth middleware
 * @returns true if user can view, false otherwise
 */
export async function canViewUser(targetUser: UserPublic, currentUser?: UserPK): Promise<boolean> {
    const isPrivate: boolean = targetUser.isPrivate;

    if (!isPrivate)
        // public account
        return true;

    // not authenticated - cant view private accounts
    if (!currentUser) return false;

    // own account - always visible
    if (targetUser.accountName === currentUser) return true;

    // check if currentUser follows targetUser
    const followRelation = await FollowerRepository.selectFollower({
        follows: currentUser,
        followed: targetUser.accountName,
    });

    return followRelation !== null && followRelation.accepted; // has to be accepted
}

export class AccountService {
    // ===================== AUTHENTICATION =====================

    /**
     * Creates a new user account with the provided information,
     * hashes the password, and sends an email with the code for the verification process
     * @param username - username of the new account
     * @param displayName - display name for the user profile
     * @param password - plaintext password to be hashed and stored
     * @param email - email address of the user
     * @param requiresValidation - if false skips the verification and returns as a successful verification
     * @returns string stating an email has been sent or AuthResponse object with token and user data during certain tests
     */
    static async registerUser(
        username: UserPK,
        displayName: string,
        password: string,
        email: string,
        requiresValidation: boolean
    ): Promise<AuthResponse | string> {
        // Check if username is being used
        const existingUser: UserFull | null = await UserRepository.selectUser(username);
        if (existingUser) throw new AppError(StatusCodes.CONFLICT, ErrorMessage.ACCOUNT_ALREADY_EXISTS);

        const existingEmail: UserFull | null = await UserRepository.selectUserByEmail(email);
        if (existingEmail) throw new AppError(StatusCodes.CONFLICT, ErrorMessage.EMAIL_ALREADY_EXISTS);

        const passwordHash: string = await bcrypt.hash(password, SALT_ROUNDS);

        // create userData JSON object
        const userData: UserData = {
            displayName: displayName,
            gender: null,
            bio: null,
        };

        const newUser: UserFull = await UserRepository.insertUser({
            accountName: username,
            avatar: null,
            isPrivate: false, // default to public account
            passwordHash,
            userData,
            email,
        });

        // send email to newUser.email with newUser.emailValidation
        if (requiresValidation) {
            try {
                await transporter.sendMail({
                    to: newUser.email,
                    subject: "GameReviewer+ registration",
                    html: `<h1>${newUser.emailValidation}</h1>`,
                });
            } catch (err) {
                await UserRepository.deleteUser(newUser.accountName);
                logger.error({ err, username }, "Verification email failed to send");
                throw new AppError(
                    StatusCodes.SERVICE_UNAVAILABLE,
                    "gmail or connection to it is having some problems"
                );
            }
            logger.info({ username }, "New user registered");
            return newUser.accountName;
        } else {
            return AccountService.verify(newUser.accountName, newUser.emailValidation as number);
        }
    }

    /**
     * Verifies a previously registered user and returns an AuthResponse object with token
     * @param username - username of the new account
     * @param codeNum - code previously sent by email
     * @returns auth response with token
     */
    static async verify(accountName: string, codeNum: number): Promise<AuthResponse> {
        try {
            const validatedUser: UserFull = await UserRepository.verify(accountName, codeNum);
            const token = generateToken(validatedUser.accountName);
            return {
                accountName: validatedUser.accountName,
                isPrivate: validatedUser.isPrivate,
                userData: validatedUser.userData as UserData,
                createdAt: validatedUser.createdAt,
                token,
            } as AuthResponse;
        } catch (err) {
            logger.warn({ err, accountName }, "Verification failed");
            throw new AppError(StatusCodes.NOT_FOUND, "wrong code");
        }
    }

    /**
     * Login user by verifying password and if account is validated and generating JWT token
     * @param username - username of the account to login
     * @param password - plaintext password to verify against stored hash
     * @returns AuthResponse object with token and user data
     */
    static async loginUser(username: UserPK, password: string): Promise<AuthResponse> {
        let user: UserFull | null;
        if (username.includes("@")) {
            user = await UserRepository.selectUserByEmail(username);
        } else {
            user = await UserRepository.selectUser(username);
        }
        // verify user
        if (!user) {
            logger.warn({ username }, "Login failed - user not found");
            throw new AppError(StatusCodes.UNAUTHORIZED, ErrorMessage.INVALID_CREDENTIALS);
        }
        const isValid: boolean = await bcrypt.compare(password, user.passwordHash);
        // Verify password
        if (!isValid) {
            logger.warn({ username }, "Login failed - invalid password");
            throw new AppError(StatusCodes.UNAUTHORIZED, ErrorMessage.INVALID_CREDENTIALS);
        }

        if (user.emailValidation != null) {
            logger.warn({ username }, "Login failed - user not validated");
            throw new AppError(StatusCodes.PRECONDITION_REQUIRED, "user not validated");
        }

        // Generate JWT token
        const token: string = generateToken(user.accountName);
        logger.info({ username }, "User logged in");
        return {
            accountName: user.accountName,
            isPrivate: user.isPrivate,
            userData: user.userData as UserData,
            createdAt: user.createdAt,
            token,
        } as AuthResponse;
    }

    // ===================== USER MANAGEMENT =====================

    /**
     * Gets the currently authenticated user's data
     * @param currentUser - username of the currently authenticated user (from JWT)
     * @returns User object
     */
    static async getCurrentUser(currentUser: UserPK): Promise<UserMe> {
        const user: UserFull | null = await UserRepository.selectUser(currentUser);
        if (!user) throw new AppError(StatusCodes.UNAUTHORIZED, ErrorMessage.INVALID_CREDENTIALS);
        return {
            accountName: user.accountName,
            email: user.email,
            avatar: user.avatar,
            isPrivate: user.isPrivate,
            userData: user.userData as UserData,
            createdAt: user.createdAt,
        } as UserMe;
    }

    /**
     * Updates user account information
     * @param currentUser - username of the currently authenticated user (from JWT)
     * @param isPrivate - new privacy setting for the account
     * @param password - new password (optional)
     * @param email - new email (optional)
     * @param userData - partial user data updates (optional)
     * @param avatar - new avatar URL (optional)
     * @returns updated user data
     */
    static async alterUser(
        currentUser: UserPK,
        isPrivate: boolean,
        email: string,
        userData: UserData,
        password?: string,
        avatar?: string | null
    ): Promise<UserMe> {
        const user: UserFull = await fetchFullUser(currentUser);

        const passwordHash: string = password ? await bcrypt.hash(password, SALT_ROUNDS) : user.passwordHash;

        let updatedEmail: string = email ?? user.email;

        if (email && email !== user.email) {
            const existingUser: UserFull | null = await UserRepository.selectUserByEmail(email);
            if (existingUser) throw new AppError(StatusCodes.CONFLICT, ErrorMessage.EMAIL_ALREADY_EXISTS);
        }

        if (user.isPrivate === true && isPrivate === false)
            await FollowerRepository.acceptAllFollowerRequestsToUser(currentUser);

        // merge current user data with provided user data updates
        const currentUserData: UserData = user.userData as UserData;
        const updatedUserData: UserData = {
            ...currentUserData,
            ...userData, // only override provided fields
        };

        const updated: UserFull = await UserRepository.updateUser({
            accountName: currentUser,
            avatar: avatar ?? user.avatar,
            isPrivate: isPrivate ?? user.isPrivate,
            passwordHash,
            userData: updatedUserData,
            email: updatedEmail,
        });

        return updated as UserMe;
    }

    /**
     * Deletes a user by username
     * @param currentUser - username of the currently authenticated user (from JWT)
     * @returns the deleted user's data
     */
    static async removeUser(currentUser: UserPK): Promise<UserPublic> {
        const user: UserFull = await fetchFullUser(currentUser);
        const deletedUser: UserFull = await UserRepository.deleteUser(user.accountName);
        logger.info({ username: currentUser }, "User account deleted");
        return userFullToPublic(deletedUser);
    }

    // ===================== SEARCH USERS =====================

    /**
     * Gets a user by username
     * @param username - username to find
     * @param currentUser - username of the currently authenticated user (optional)
     * @returns Full Public user object if is visible (public or followed), if it's not visible returns only the username
     */
    static async findByUsername(username: UserPK, currentUser?: UserPK): Promise<UserPublic | UserPrivate> {
        const user: UserPublic = await fetchPublicUser(username);

        // check if currentUser can view this profile
        const canView: boolean = await canViewUser(user, currentUser);

        if (canView) {
            return {
                accountName: user.accountName,
                avatar: user.avatar,
                isPrivate: user.isPrivate,
                userData: user.userData as UserData,
                createdAt: user.createdAt,
            } as UserPublic;
        } else {
            return {
                accountName: user.accountName,
                avatar: user.avatar,
                isPrivate: user.isPrivate,
            } as UserPrivate;
        }
    }

    /**
     * Searches for users by name or similar names
     * @param nameFilter - search string
     * @param currentUser - authenticated user making the request (optional)
     */
    static async searchUsersByName(
        nameFilter: string,
        currentUser?: UserPK,
        offset?: number,
        limit?: number
    ): Promise<(UserPublic | UserPrivate)[]> {
        const usersFull: UserFull[] = await UserRepository.selectUsersOfSimilarName(nameFilter, offset, limit);
        const users: UserPublic[] = usersFull.map(userFullToPublic);
        const canViewList: boolean[] = await Promise.all(users.map((u) => canViewUser(u, currentUser)));

        return users.map((u, i) => {
            if (canViewList[i]) {
                return {
                    accountName: u.accountName,
                    avatar: u.avatar,
                    isPrivate: u.isPrivate,
                    userData: u.userData as UserData,
                    createdAt: u.createdAt,
                } as UserPublic;
            }
            return {
                accountName: u.accountName,
                avatar: u.avatar,
                isPrivate: u.isPrivate,
            } as UserPrivate;
        });
    }

    static async uploadAvatar(currentUser: UserPK, buffer: Buffer): Promise<string> {
        await fetchFullUser(currentUser);
        if (buffer.length > 5 * 1024 * 1024) throw new AppError(StatusCodes.BAD_REQUEST, "Image too large");
        const url = await uploadAvatar(buffer, currentUser);
        await UserRepository.updateAvatar(currentUser, url);
        return url;
    }

    static async getAvatar(username: UserPK): Promise<string> {
        await fetchFullUser(username);
        const url = await UserRepository.getAvatar(username);
        if (!url) throw new AppError(StatusCodes.NOT_FOUND, "No profile picture set");
        return url;
    }

    static async grantPasswordReset(username: UserPK, sendEmail: boolean): Promise<number> {
        const user: UserFull | null = await UserRepository.selectUser(username);
        if (user === null) {
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.ACCOUNT_NOT_FOUND);
        }
        const rng: number = randomInt(0, 999999);
        if (sendEmail) {
            try {
                await transporter.sendMail({
                    to: user.email,
                    subject: "GameReviewer+ Password Recover",
                    html: `
                    <h1>If you are not trying to reset your password someone might have inserted your username by mistake</h1>
                    <h1>If that is the case please ignore this email</h1>
                    <h2>${rng}</h2>
                `,
                });
            } catch (err) {
                throw new AppError(
                    StatusCodes.SERVICE_UNAVAILABLE,
                    "gmail or connection to it is having some problems"
                );
            }
        }
        await UserRepository.grantPasswordReset(username, rng);
        return rng;
    }

    static async usePasswordReset(username: UserPK, passwordResetCode: number, newPassword: string): Promise<void> {
        const user: UserFull | null = await UserRepository.selectUser(username);
        if (user === null) {
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.ACCOUNT_NOT_FOUND);
        }
        try {
            const passwordHash: string = await bcrypt.hash(newPassword, SALT_ROUNDS);
            await UserRepository.usePasswordReset(username, passwordResetCode, passwordHash);
        } catch (err) {
            throw new AppError(StatusCodes.UNAUTHORIZED, "wrong code");
        }
    }
}
