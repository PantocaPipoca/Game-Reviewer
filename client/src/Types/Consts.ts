export const AUTH_VALIDATION = {
    minUserNameLength: 3,
    maxUserNameLength: 26,
    minPasswordLength: 8,
    maxPasswordLength: 50,
    userRegex: /^[a-zA-Z0-9_]+$/,
    emailRegex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    maxEmailLength: 70,
} as const;

export const maxLoginLength: number = Math.max(AUTH_VALIDATION.maxEmailLength, AUTH_VALIDATION.maxUserNameLength);

export const AUTH_ERRORS = {
    requiredFields: "All fields are required.",
    invalidUserName: "Invalid username format.",
    invalidEmail: "Invalid email format.",
    userNameTooShort: `Username must be at least ${AUTH_VALIDATION.minUserNameLength} characters long.`,
    userNameTooLong: `Username must be at most ${AUTH_VALIDATION.maxUserNameLength} characters long.`,
    displayNameTooLong: `Display name must be at most ${AUTH_VALIDATION.maxUserNameLength} characters long.`,
    passwordTooShort: `Password must be at least ${AUTH_VALIDATION.minPasswordLength} characters long.`,
    passwordTooLong: `Password must be at most ${AUTH_VALIDATION.maxPasswordLength} characters long.`,
    emailTooLong: `Email must be at most ${AUTH_VALIDATION.maxEmailLength} characters long.`,
    loginTooLong: `Email / UserName field accepts at most ${maxLoginLength} characters.`,
    passwordsDoNotMatch: "Passwords do not match.",
    loginFailed: "Login failed. Please try again.",
    registerFailed: "Registration failed. Please try again.",
} as const;

export const ACCOUNT_CONSTS = {
    maxGenderLength: 20,
    maxBioLength: 1000,
} as const;

export const ACCOUNT_ERRORS = {
    genderTooLong: `Gender must be at most ${ACCOUNT_CONSTS.maxGenderLength} characters long.`,
    bioTooLong: `Bio must be at most ${ACCOUNT_CONSTS.maxBioLength} characters long.`,
    failedSave: "Failed to save changes",
} as const;

export const REVIEW_CONSTS = {
    maxReviewLength: 3500,
    maxCommentLength: 1000,
} as const;

export const REVIEW_ERRORS = {
    missingGameId: "Missing game id.",
    noRatingPublish: "Select a rating before publishing.",
    noRatingAlter: "Select a rating before saving.",
    noReviewPublish: "Write a short review before publishing.",
    noReviewAlter: "Write a short review before saving",
    reviewTooLong: `Review must be at most ${REVIEW_CONSTS.maxReviewLength} characters long.`,
    failedCreate: "Failed to publish review.",
    failedSave: "Failed to save review.",
    failedDel: "Failed to delete review.",
} as const;
