import bcrypt from "bcrypt"
import { StatusCodes } from "http-status-codes"

import * as ErrorMessage from "../utils/ErrorMessage";
import { AppError } from "../utils/ErrorHandler"
import {generateToken} from "../utils/auth"
import {SelectUser, InsertUser, UpdateUser, DeleteUser, SelectUsersOfSimilarName, User} from "../Repository/UserRepository"
import { SelectFollower } from "../Repository/FollowerRepository"
import {UserData, AuthResponse, UserResponse} from "../types/Types"

const SALT_ROUNDS = 10; // number of iterations for bcrypt hashing

/**
 * Fetches a user by username and throws an error if the user doesn't exist
 * @param accountName - username of the user to fetch
 * @returns User object if found, null otherwise
 */
export async function FetchUser(accountName: string): Promise<User> {
    const user : User | null = await SelectUser(accountName);
    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.ACCOUNT_NOT_FOUND);
    }
    return user;
}

/**
 * Checks if a user can view another user's profile based on privacy settings
 * @param targetUser - the user being viewed
 * @param currentUser - the user requesting (undefined if not authenticated) - confirmed by auth middleware
 * @returns true if user can view, false otherwise
 */
export async function CanViewUser(targetUser: string, currentUser?: string): Promise<boolean> {
    const user = await FetchUser(targetUser);
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
     * @param accountName - username of the new account
     * @param displayName - display name for the user profile
     * @param password - plaintext password to be hashed and stored
     * @param email - email address of the user
     * @returns AuthResponse object with token and user data
     */
    static async RegisterUser(accountName: string, displayName: string, password: string, email: string): Promise<AuthResponse> {
        // Check if username is being used
        const existingUser: User | null = await SelectUser(accountName);
        if (existingUser) {
            throw new AppError(StatusCodes.CONFLICT, ErrorMessage.ACCOUNT_ALREADY_EXISTS);
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // create userData JSON object
        const userData: UserData = {
            displayName: displayName,
            isPrivate: false, // default to public account
            gender: null,
            bio: null 
        };

        const newUser = await InsertUser({
            accountName,
            passwordHash,
            userData,
            email
        });

        // generate JWT token
        const token = generateToken(newUser.accountName, newUser.email); 

        return {
            accountName: newUser.accountName,
            email: newUser.email,
            userData: newUser.userData,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
            token
        };
    }

    /**
     * Login user by verifying password and generating JWT token
     * @param accountName - username of the account to login
     * @param password - plaintext password to verify against stored hash
     * @returns AuthResponse object with token and user data
     */
    static async LoginUser(accountName: string, password: string): Promise<AuthResponse> {
        const user: User = await FetchUser(accountName)

        // Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash)
        if (!isValid) {
            throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.PASSWORD_INCORRECT);
        }

        // Generate JWT token
        const token = generateToken(user.accountName, user.email);

        return {
            accountName: user.accountName,
            email: user.email,
            userData: user.userData,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            token
        };
    }

    
    // ===================== USER MANAGEMENT =====================

    /**
     * Gets the currently authenticated user's data
     * @param currentUser - username of the currently authenticated user (from JWT)
     * @returns User object
     */
    static async GetCurrentUser(currentUser: string): Promise<UserResponse> {
        const user: User = await FetchUser(currentUser);

        return {
            accountName: user.accountName,
            email: user.email,
            userData: user.userData,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    /**
     * Updates user account information
     * @param currentUser - username of the currently authenticated user (from JWT)
     * @param password - new password (optional)
     * @param email - new email (optional)
     * @param userData - partial user data updates (optional)
     * @returns updated user data
     */
    static async AlterUser(currentUser: string, password?: string, email?: string, userData?: Partial<UserData>): Promise<UserResponse> {
        const user = await FetchUser(currentUser)

        const passwordHash = password 
            ? await bcrypt.hash(password, SALT_ROUNDS) 
            : user.passwordHash

        const updatedEmail = email ?? user.email

        // merge current user data with provided user data updates
        const currentUserData = user.userData as UserData
        const updatedUserData: UserData = {
            ...currentUserData,
            ...userData  // only override provided fields
        }

        const updated: User = await UpdateUser({accountName: currentUser, passwordHash, userData: updatedUserData, email: updatedEmail})

        return {
            accountName: updated.accountName,
            email: updated.email,
            userData: updated.userData,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt
        }
    }

    /**
     * Deletes a user by username
     * @param currentUser - username of the currently authenticated user (from JWT)
     * @returns the deleted user's data
     */
    static async RemoveUser(currentUser: string): Promise<UserResponse> {
        const deletedUser = await DeleteUser(currentUser);

        return {
            accountName: deletedUser.accountName,
            email: deletedUser.email,
            userData: deletedUser.userData,
            createdAt: deletedUser.createdAt,
            updatedAt: deletedUser.updatedAt
        };
    }


    // ===================== SEARCH USERS =====================

    /**
     * Gets a user by username
     * @param accountName - username to find
     * @param currentUser - username of the currently authenticated user (optional)
     * @returns User object
     */
    static async FindByUsername(accountName: string, currentUser?: string): Promise<UserResponse | null> {
        const user = await FetchUser(accountName);
        
        // check if currentUser can view this profile
        const canView = await CanViewUser(user.accountName, currentUser);
        if (!canView) {
            return null;
        }

        return {
            accountName: user.accountName,
            email: user.email,
            userData: user.userData,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    /**
     * Searches for users by name
     * Filters out private accounts that currentUser doesn't follow
     * @param nameFilter - search string
     * @param currentUser - authenticated user making the request (optional)
     */
    static async SearchUsersByName(nameFilter: string, currentUser?: string): Promise<UserResponse[]> {
        const users = await SelectUsersOfSimilarName(nameFilter);
        
        const visibleUsers: UserResponse[] = [];
        
        for (const user of users) {
            const canView = await CanViewUser(user.accountName, currentUser);
            if (canView) {
                visibleUsers.push({
                    accountName: user.accountName,
                    email: user.email,
                    userData: user.userData,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                });
            }
        }
        
        return visibleUsers;
    }
}