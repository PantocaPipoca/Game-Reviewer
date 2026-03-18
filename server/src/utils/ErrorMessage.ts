// ========== VALIDATION ERRORS (400) ==========
export const ACCOUNT_NAME_REQUIRED: string  = "Missing user name field"
export const ACCOUNT_NAME_TOO_SHORT: string = "User name is too short"
export const DISPLAY_NAME_REQUIRED: string  = "Missing display name field"
export const PASSWORD_REQUIRED: string      = "Missing password field"
export const PASSWORD_TOO_SHORT: string     = "Password is too short"
export const EMAIL_REQUIRED: string         = "Missing email field"
export const EMAIL_INVALID: string          = "Email provided is invalid"

export const FOLLOWER_NAME_REQUIRED: string = "Missing follower name field"
export const FOLLOWED_NAME_REQUIRED: string = "Missing followed name field"

export const GAME_ID_REQUIRED: string     = "Missing gameID field"

export const REVIEW_TEXT_REQUIRED: string   = "Missing critique provided field"
export const REVIEW_SCORE_REQUIRED: string  = "Missing score field"
export const REVIEW_SCORE_INVALID: string   = "Invalid score field"

export const COMMENT_TEXT_REQUIRED: string  = "Missing comment provided field"
export const COMMENT_ID_REQUIRED: string    = "Missing comment ID field"
export const COMMENT_ID_INVALID: string    = "Invalid comment ID field"

// ========== NOT AUTHORIZED ERRORS (401) ==========
export const INVALID_CREDENTIALS: string = "Invalid credentials"

// ========== AUTHENTICATION ERRORS (403) ==========
export const PASSWORD_INCORRECT: string     = "Wrong password"
export const UNAUTHORIZED_ACTION: string    = "Not authorized to perform this action"

// ========== NOT FOUND ERRORS (404) ==========
export const ACCOUNT_NOT_FOUND: string  = "User name doesn't exist"
export const GAME_NOT_FOUND: string     = "Game doesn't exist"
export const REVIEW_NOT_FOUND: string   = "User has not reviewed the game"
export const COMMENT_NOT_FOUND: string  = "Comment doesn't exist"
export const REACTION_NOT_FOUND: string = "Reaction not found"

// ========== CONFLICT ERRORS (409) ==========
export const ACCOUNT_ALREADY_EXISTS: string     = "User name is already taken"
export const EMAIL_ALREADY_EXISTS: string        = "Email is already taken"

export const FOLLOW_REQUEST_EXISTS: string      = "User already requested to follow user"
export const FOLLOW_REQUEST_NOT_FOUND: string   = "User didn't request to follow user"
export const FOLLOW_ALREADY_ACCEPTED: string    = "User already accepted follower request"
export const FOLLOWER_NOT_FOUND: string         = "User doesn't follow user yet"
export const CANNOT_FOLLOW_YOURSELF: string     = "You can't follow yourself"
export const REVIEW_ALREADY_EXISTS: string      = "User already has reviewed the game"

// ========== SERVER ERRORS (500) ==========
export const ACCOUNT_CREATE_FAILED: string          = "Couldn't create account"
export const ACCOUNT_UPDATE_FAILED: string          = "Couldn't update account"
export const ACCOUNT_DELETE_FAILED: string          = "Couldn't remove account"
export const FOLLOW_REQUEST_CREATE_FAILED: string   = "Couldn't create follower request"
export const FOLLOW_REQUEST_ACCEPT_FAILED: string   = "Couldn't accept follower request"
export const FOLLOWER_DELETE_FAILED: string         = "Couldn't remove follower"
export const REVIEW_CREATE_FAILED: string           = "Couldn't create review"
export const REVIEW_UPDATE_FAILED: string           = "Couldn't update review"
export const REVIEW_DELETE_FAILED: string           = "Couldn't remove review"
