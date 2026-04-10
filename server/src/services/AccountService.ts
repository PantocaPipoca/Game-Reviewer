import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import * as ErrorMessage from "../utils/ErrorMessage";
import { AppError } from "../utils/ErrorHandler";
import { generateToken } from "../utils/Auth";
import { UserRepository } from "../Repository/UserRepository";
import { UserData, UserFull, UserPK, AuthResponse, UserPublic, UserPrivate, UserMe } from "../types/Types";
import { FollowerRepository } from "../Repository/FollowerRepository";
import { uploadAvatar } from "../utils/Cloudinary";

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
     * hashes the password, and generates a JWT token for authentication
     * @param username - username of the new account
     * @param displayName - display name for the user profile
     * @param password - plaintext password to be hashed and stored
     * @param email - email address of the user
     * @returns AuthResponse object with token and user data
     */
    static async registerUser(
        // this will create a pending user instead
        // there will be a new route to officialize that user
        username: UserPK,
        displayName: string,
        password: string,
        email: string
    ): Promise<AuthResponse> {
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

        // generate JWT token
        const token: string = generateToken(newUser.accountName);
        // dont generate token tho

        return {
            accountName: newUser.accountName,
            isPrivate: newUser.isPrivate,
            userData: newUser.userData as UserData,
            createdAt: newUser.createdAt,
            token,
        } as AuthResponse;
        // return `a confirmation has been sent to ${newUser.email}`
    }

    /**
     * Verifies a user
     * @returns auth response with token or failed verification
     */
    static async verify(accountName: string, codeNum: number) {
        await UserRepository.verify(accountName, codeNum)
            .then((validatedUser) => {
                const token = generateToken(validatedUser.accountName);
                return {
                    accountName: validatedUser.accountName,
                    isPrivate: validatedUser.isPrivate,
                    userData: validatedUser.userData as UserData,
                    createdAt: validatedUser.createdAt,
                    token,
                } as AuthResponse;
            })
            .catch((err) => {
                throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.INVALID_CREDENTIALS);
            });
    }

    /**
     * Login user by verifying password and generating JWT token
     * @param username - username of the account to login
     * @param password - plaintext password to verify against stored hash
     * @returns AuthResponse object with token and user data
     */
    static async loginUser(username: UserPK, password: string): Promise<AuthResponse> {
        const user: UserFull | null = await UserRepository.selectUser(username);
        // verify user
        if (!user) throw new AppError(StatusCodes.UNAUTHORIZED, ErrorMessage.INVALID_CREDENTIALS);

        const isValid: boolean = await bcrypt.compare(password, user.passwordHash);
        // Verify password
        if (!isValid) throw new AppError(StatusCodes.UNAUTHORIZED, ErrorMessage.INVALID_CREDENTIALS);

        // Generate JWT token
        const token: string = generateToken(user.accountName);

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
    static async searchUsersByName(nameFilter: string, currentUser?: UserPK): Promise<(UserPublic | UserPrivate)[]> {
        const usersFull: UserFull[] = await UserRepository.selectUsersOfSimilarName(nameFilter);
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
}
