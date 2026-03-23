import bcrypt from "bcrypt"
import {StatusCodes} from "http-status-codes"
import * as ErrorMessage from "../utils/ErrorMessage";
import {AppError} from "../utils/ErrorHandler"
import {generateToken} from "../utils/auth"
import {UserRepository} from "../Repository/UserRepository"
import {UserData, UserFull, UserPK, AuthResponse, UserPublic, UserPrivate} from "../types/Types"
import {FollowerRepository} from "../Repository/FollowerRepository"

const SALT_ROUNDS = 10; // number of iterations for bcrypt password hashing

/**
 * Gets a user full object by username and throws an error if the user doesn't exist
 * @param username - username of the user to fetch
 * @returns Full User object if found
 * @throws AppError if the user doesn't exist (HTTP 404)
*/
export async function FetchFullUser(username: UserPK): Promise<UserFull> {
    const user : UserFull | null = await UserRepository.SelectUser(username);
    
    if (!user)
        throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.ACCOUNT_NOT_FOUND);
    
    return user;
}

/**
 * Gets a user public object by username (only public fields)
 * @param username - username of the user to fetch
 * @returns Public User object if found
 * @throws AppError if the user doesn't exist (HTTP 404)
 * 
 */
export async function FetchPublicUser(username: UserPK): Promise<UserPublic> {
    const user: UserFull = await FetchFullUser(username);

    return UserFullToPublic(user);
}

/**
 * Removes non-public info from a user object
 * @param user the user with all their info
 * @returns the user with only their public info
 */
export function UserFullToPublic(user: UserFull): UserPublic {
    return {
        accountName: user.accountName,
        profilePic: user.profilePic,
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
export async function CanViewUser(targetUser: UserPublic, currentUser?: UserPK): Promise<boolean> {
    const isPrivate: boolean = targetUser.isPrivate;
    
    if (!isPrivate) // public account
        return true;
    
    // not authenticated - cant view private accounts
    if (!currentUser)
        return false;
    
    // own account - always visible
    if (targetUser.accountName === currentUser)
        return true;
    
    // check if currentUser follows targetUser
    const followRelation = await FollowerRepository.SelectFollower({
        follows: currentUser,
        followed: targetUser.accountName
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
        const existingUser: UserFull | null = await UserRepository.SelectUser(username);
        if (existingUser)
            throw new AppError(StatusCodes.CONFLICT, ErrorMessage.ACCOUNT_ALREADY_EXISTS);

        const existingEmail: UserFull | null = await UserRepository.SelectUserByEmail(email);
        if (existingEmail)
            throw new AppError(StatusCodes.CONFLICT, ErrorMessage.EMAIL_ALREADY_EXISTS);

        const passwordHash: string = await bcrypt.hash(password, SALT_ROUNDS);

        // create userData JSON object
        const userData: UserData = {
            displayName: displayName,
            gender: null,
            bio: null
        };

        const newUser: UserFull = await UserRepository.InsertUser({
            accountName: username,
            profilePic: null,
            isPrivate: false, // default to public account
            passwordHash,
            userData,
            email
        });

        // generate JWT token
        const token: string = generateToken(newUser.accountName); 

        return {
            accountName: newUser.accountName,
            isPrivate: newUser.isPrivate,
            userData: newUser.userData as UserData,
            createdAt: newUser.createdAt,
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
        const user : UserFull | null = await UserRepository.SelectUser(username);
        // verify user
        if (!user)
            throw new AppError(StatusCodes.UNAUTHORIZED, ErrorMessage.INVALID_CREDENTIALS);
    
        const isValid: boolean = await bcrypt.compare(password, user.passwordHash)
        // Verify password
        if (!isValid)
            throw new AppError(StatusCodes.UNAUTHORIZED, ErrorMessage.INVALID_CREDENTIALS);

        // Generate JWT token
        const token: string = generateToken(user.accountName);

        return {
            accountName: user.accountName,
            isPrivate: user.isPrivate,
            userData: user.userData as UserData,
            createdAt: user.createdAt,
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
        const user: UserFull | null = await UserRepository.SelectUser(currentUser);

        if (!user)
            throw new AppError(StatusCodes.UNAUTHORIZED, ErrorMessage.INVALID_CREDENTIALS);

        return UserFullToPublic(user);
    }

    /**
     * Updates user account information
     * @param currentUser - username of the currently authenticated user (from JWT)
     * @param profilePic - the profile picture of the user (optional)
     * @param isPrivate - whether or not the user's account is private (optional)
     * @param password - new password (optional)
     * @param email - new email (optional)
     * @param userData - partial user data updates (optional)
     * @returns updated user data
     */
    static async AlterUser(currentUser: UserPK, profilePic?: Uint8Array<ArrayBuffer> | null, isPrivate?: boolean, password?: string, email?: string, userData?: Partial<UserData>): Promise<UserPublic> {
        const user: UserFull = await FetchFullUser(currentUser);

        const passwordHash: string = password
            ? await bcrypt.hash(password, SALT_ROUNDS) 
            : user.passwordHash;

        let updatedEmail: string = email ?? user.email;

        if (email) {
            const existingUser: UserFull | null = await UserRepository.SelectUserByEmail(email);
            if (existingUser)
                throw new AppError(StatusCodes.CONFLICT, ErrorMessage.EMAIL_ALREADY_EXISTS);
        }

        // merge current user data with provided user data updates
        const currentUserData: UserData = user.userData as UserData;
        const updatedUserData: UserData = {
            ...currentUserData,
            ...userData  // only override provided fields
        };

        const updated: UserFull = await UserRepository.UpdateUser({
            accountName: currentUser,
            profilePic: profilePic ?? user.profilePic,
            isPrivate: isPrivate ?? user.isPrivate,
            passwordHash, 
            userData: updatedUserData, 
            email: updatedEmail
        });

        return UserFullToPublic(updated);
    }

    /**
     * Deletes a user by username
     * @param currentUser - username of the currently authenticated user (from JWT)
     * @returns the deleted user's data
     */
    static async RemoveUser(currentUser: UserPK): Promise<UserPublic> {
        const user: UserFull = await FetchFullUser(currentUser);
        const deletedUser: UserFull = await UserRepository.DeleteUser(user.accountName);

        return UserFullToPublic(deletedUser);
    }


    // ===================== SEARCH USERS =====================

    /**
     * Gets a user by username
     * @param username - username to find
     * @param currentUser - username of the currently authenticated user (optional)
     * @returns Full Public user object if is visible (public or followed), if it's not visible returns only the username
     */
    static async FindByUsername(username: UserPK, currentUser?: UserPK): Promise<UserPublic | UserPrivate> {
        const user: UserPublic = await FetchPublicUser(username);
        
        // check if currentUser can view this profile
        const canView: boolean = await CanViewUser(user, currentUser);

        if (await CanViewUser(user, currentUser)) {
            return {
                accountName: user.accountName,
                profilePic: user.profilePic,
                isPrivate: user.isPrivate,
                userData: canView ? user.userData as UserData : null,
                createdAt: canView ? user.createdAt : null
            } as UserPublic;
        } else {
            return {
                accountName: user.accountName,
                profilePic: user.profilePic,
                isPrivate: user.isPrivate
            } as UserPrivate;
        }
    }

    /**
     * Searches for users by name or similar names
     * @param nameFilter - search string
     * @param currentUser - authenticated user making the request (optional)
     */
    static async SearchUsersByName(nameFilter: string, currentUser?: UserPK): Promise<(UserPublic | UserPrivate)[]> {
        const usersFull: UserFull[] = await UserRepository.SelectUsersOfSimilarName(nameFilter);
        const users: UserPublic[] = usersFull.map(UserFullToPublic);
        const canViewList: boolean[] = await Promise.all(
            users.map(u => CanViewUser(u, currentUser))
        );

        return users.map((u, i) => {
            if (canViewList[i]) {
                return {
                    accountName: u.accountName,
                    profilePic: u.profilePic,
                    isPrivate: u.isPrivate,
                    userData: u.userData as UserData,
                    createdAt: u.createdAt,
                } as UserPublic;
            }
            return {
                accountName: u.accountName,
                profilePic: u.profilePic,
                isPrivate: u.isPrivate
            } as UserPrivate;
        });
    }
}