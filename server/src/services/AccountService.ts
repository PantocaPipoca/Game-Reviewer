import bcrypt from "bcrypt"
import { StatusCodes } from "http-status-codes"

import * as ErrorMessage from "../utils/ErrorMessage";
import { AppError } from "../utils/ErrorHandler"
import {generateToken} from "../utils/auth"
import {SelectUser, InsertUser, UpdateUser, DeleteUser, SelectUsersOfSimilarName} from "../Repository/UserRepository"
import { SelectFollower } from "../Repository/FollowerRepository"
import {UserData, UserFull, UserPK, AuthResponse, UserShort, UserPublic} from "../types/Types"
import { Prisma } from "../generated/prisma/browser";

const SALT_ROUNDS = 10; // number of iterations for bcrypt hashing

/**
 * Fetches a user by username and throws an error if the user doesn't exist
 * @param username - username of the user to fetch
 * @returns User object if found, null otherwise
 */
export async function FetchUser(username: UserPK): Promise<UserFull> {
    const user : UserFull | null = await SelectUser(username);
    if (!user) throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.ACCOUNT_NOT_FOUND);
    return user;
}

/**
 * Checks if a user can view another user's profile based on privacy settings
 * @param targetUser - the user being viewed
 * @param currentUser - the user requesting (undefined if not authenticated) - confirmed by auth middleware
 * @returns true if user can view, false otherwise
 */
export async function CanViewUser(targetUser: UserPK, currentUser?: UserPK): Promise<boolean> {
    const user: UserFull = await FetchUser(targetUser);
    const userData: UserData = user.userData as UserData;
    
    if (!userData.isPrivate) {
        return true;
    }
    
    // not authenticated - cant view private accounts
    if (!currentUser) {
        return false;
    }
    
    // own account - always visible
    if (targetUser === currentUser) {
        return true;
    }
    
    // check if currentUser follows targetUser
    const followRelation = await SelectFollower({
        follows: currentUser,
        followed: targetUser
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
    static async RegisterUser(username: UserPK, displayName: string, password: string, email: string): Promise<AuthResponse> {
        // Check if username is being used
        const existingUser: UserFull | null = await SelectUser(username);
        if (existingUser)
            throw new AppError(StatusCodes.CONFLICT, ErrorMessage.ACCOUNT_ALREADY_EXISTS);

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // create userData JSON object
        const userData: UserData = {
            displayName: displayName,
            isPrivate: false, // default to public account
            gender: null,
            bio: null
        };

        const newUser: UserFull = await InsertUser({
            accountName: username,
            passwordHash,
            userData,
            email
        });

        // generate JWT token
        const token: string = generateToken(newUser.accountName); 

        return {
            accountName: newUser.accountName,
            userData: newUser.userData as UserData,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
            token
        } as AuthResponse;
    }

    /**
     * Login user by verifying password and generating JWT token
     * @param username - username of the account to login
     * @param password - plaintext password to verify against stored hash
     * @returns AuthResponse object with token and user data
     */
    static async LoginUser(username: UserPK, password: string): Promise<AuthResponse> {
        const user: UserFull = await FetchUser(username)

        // Verify password
        const isValid: boolean = await bcrypt.compare(password, user.passwordHash)
        if (!isValid) {
            throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.PASSWORD_INCORRECT);
        }

        // Generate JWT token
        const token: string = generateToken(user.accountName);

        return {
            accountName: user.accountName,
            userData: user.userData as UserData,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            token
        } as AuthResponse;
    }

    
    // ===================== USER MANAGEMENT =====================

    /**
     * Gets the currently authenticated user's data
     * @param currentUser - username of the currently authenticated user (from JWT)
     * @returns User object
     */
    static async GetCurrentUser(currentUser: UserPK): Promise<UserPublic> {
        const user: UserFull = await FetchUser(currentUser);

        return {
            accountName: user.accountName,
            userData: user.userData as UserData,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        } as UserPublic;
    }

    /**
     * Updates user account information
     * @param currentUser - username of the currently authenticated user (from JWT)
     * @param password - new password (optional)
     * @param email - new email (optional)
     * @param userData - partial user data updates (optional)
     * @returns updated user data
     */
    static async AlterUser(currentUser: UserPK, password?: string, email?: string, userData?: Partial<UserData>): Promise<UserPublic> {
        const user: UserFull = await FetchUser(currentUser);

        const passwordHash = password
            ? await bcrypt.hash(password, SALT_ROUNDS) 
            : user.passwordHash;

        const updatedEmail: string = email ?? user.email;

        // merge current user data with provided user data updates
        const currentUserData: UserData = user.userData as UserData;
        const updatedUserData: UserData = {
            ...currentUserData,
            ...userData  // only override provided fields
        };

        const updated: UserFull = await UpdateUser({accountName: currentUser, passwordHash, userData: updatedUserData, email: updatedEmail})

        return {
            accountName: updated.accountName,
            userData: updated.userData as UserData,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt
        } as UserPublic;
    }

    /**
     * Deletes a user by username
     * @param currentUser - username of the currently authenticated user (from JWT)
     * @returns the deleted user's data
     */
    static async RemoveUser(currentUser: UserPK): Promise<UserPublic> {
        const user: UserFull = await FetchUser(currentUser);
        const deletedUser: UserFull = await DeleteUser(user.accountName);

        return {
            accountName: deletedUser.accountName,
            userData: deletedUser.userData as UserData,
            createdAt: deletedUser.createdAt,
            updatedAt: deletedUser.updatedAt
        } as UserPublic;
    }


    // ===================== SEARCH USERS =====================

    /**
     * Gets a user by username
     * @param username - username to find
     * @param currentUser - username of the currently authenticated user (optional)
     * @returns User object
     */
    static async FindByUsername(username: UserPK, currentUser?: UserPK): Promise<UserPublic | null> {
        const user: UserFull = await FetchUser(username);
        
        // check if currentUser can view this profile
        const canView: boolean = await CanViewUser(user.accountName, currentUser);
        if (!canView)
            return null;

        return {
            accountName: user.accountName,
            userData: user.userData as UserData,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        } as UserPublic;
    }

    /**
     * Searches for users by name
     * Filters out private accounts that currentUser doesn't follow
     * @param nameFilter - search string
     * @param currentUser - authenticated user making the request (optional)
     */
    static async SearchUsersByName(nameFilter: string, currentUser?: UserPK): Promise<UserPublic[]> {
        const users: UserFull[] = await SelectUsersOfSimilarName(nameFilter);
        
        const visibleUsers: UserPublic[] = [];

        for (const user of users){
            const canView = await CanViewUser(user.accountName, currentUser);
            if (canView) {
                visibleUsers.push({
                    accountName: user.accountName,
                    userData: user.userData as UserData,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                });
            }
        }
        
        return visibleUsers;
    }
}