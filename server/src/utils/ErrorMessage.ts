// ========== VALIDATION ERRORS (400) ==========
export const ACCOUNT_NAME_REQUIRED = "Missing user name field"
export const ACCOUNT_NAME_TOO_SHORT = "User name is too short"
export const DISPLAY_NAME_REQUIRED = "Missing display name field"
export const PASSWORD_REQUIRED = "Missing password field"
export const PASSWORD_TOO_SHORT = "Password is too short"
export const EMAIL_REQUIRED = "Missing email field"
export const EMAIL_INVALID = "Email provided is invalid"

export const FOLLOWER_NAME_REQUIRED = "Missing follower name field"
export const FOLLOWED_NAME_REQUIRED = "Missing followed name field"

export const GAME_NAME_REQUIRED = "Missing game name field"

export const REVIEW_TEXT_REQUIRED = "Missing critique provided field"
export const REVIEW_SCORE_REQUIRED = "Missing score field"
export const REVIEW_SCORE_INVALID = "Invalid score field"

// ========== AUTHENTICATION ERRORS (403) ==========
export const PASSWORD_INCORRECT = "Wrong password"
export const UNAUTHORIZED_ACTION = "Not authorized to perform this action"

// ========== NOT FOUND ERRORS (404) ==========
export const ACCOUNT_NOT_FOUND = "User name doesn't exist"
export const GAME_NOT_FOUND = "Game doesn't exist"
export const REVIEW_NOT_FOUND = "User has not reviewed the game"

// ========== CONFLICT ERRORS (409) ==========
export const ACCOUNT_ALREADY_EXISTS = "User name is already used"
export const FOLLOW_REQUEST_EXISTS = "User already requested to follow user"
export const FOLLOW_REQUEST_NOT_FOUND = "User didn't request to follow user"
export const FOLLOW_ALREADY_ACCEPTED = "User already accepted follower request"
export const FOLLOWER_NOT_FOUND = "User doesn't follow user yet"
export const REVIEW_ALREADY_EXISTS = "User already has reviewed the game"

// ========== SERVER ERRORS (500) ==========
export const ACCOUNT_CREATE_FAILED = "Couldn't create account"
export const ACCOUNT_UPDATE_FAILED = "Couldn't update account"
export const ACCOUNT_DELETE_FAILED = "Couldn't remove account"
export const FOLLOW_REQUEST_CREATE_FAILED = "Couldn't create follower request"
export const FOLLOW_REQUEST_ACCEPT_FAILED = "Couldn't accept follower request"
export const FOLLOWER_DELETE_FAILED = "Couldn't remove follower"
export const REVIEW_CREATE_FAILED = "Couldn't create review"
export const REVIEW_UPDATE_FAILED = "Couldn't update review"
export const REVIEW_DELETE_FAILED = "Couldn't remove review"