export const AUTH_VALIDATION = {
    minUserNameLength: 3,
    minPasswordLength: 8,
    emailRegex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
} as const;

export const AUTH_ERRORS = {
    requiredFields: "All fields are required.",
    invalidEmail: "Invalid email format.",
    userNameTooShort: `Username must be at least ${AUTH_VALIDATION.minUserNameLength} characters.`,
    passwordTooShort: `Password must be at least ${AUTH_VALIDATION.minPasswordLength} characters.`,
    passwordsDoNotMatch: "Passwords do not match.",
    loginFailed: "Login failed. Please try again.",
    registerFailed: "Registration failed. Please try again.",
} as const;
