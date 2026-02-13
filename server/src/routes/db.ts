// Database manager

// TODO

// Creates a new user
// Returns a structured type with the user's info, or an empty structured type iff the user doesn't exist
export async function create_user(username: string, display_name: string, password: string, email: string): Promise<void> {
    // INSERT INTO User (username, display_name, password, email) VALUES (..., ..., ..., ...)
}

// Gets a user
// Returns a structured type with the user's info, or an empty structured type iff the user doesn't exist
export async function get_user(username: string): Promise<any> {
    // SELECT * FROM User WHERE username = ...
}

// Changes a user's info
// Returns true iff the user doesn't exist
export async function alter_user(data: any): Promise<boolean> {
    // UPDATE User SET display_name = ..., password = ..., email = ... WHERE username = ...
    return new Promise((_, __) => false)
}

// Deletes a user
// Returns true iff the user doesn't exist
export async function delete_user(username: string): Promise<boolean> {
    // DELETE FROM User WHERE username = ...
    return new Promise((_, __) => false)
}

// Checks whether two users exist
// This function is important as it turns two queries into one
export async function both_users_exist(username1: string, username2: string): Promise<boolean> {
    // 2 == (SELECT COUNT(username) FROM User WHERE username = ... OR username = ...)
    return new Promise((_, __) => false)   
}

// Adds a follower
// Returns true iff username1 already follows username2
export async function add_follower(username1: string, username2: string): Promise<boolean> {
    // INSERT INTO Follower (username1, username2) VALUES (..., ...)
    return new Promise((_, __) => false)
}

// Deletes a follower
// Returns true iff username1 doesn't follow username2 yet
export async function delete_follower(username1: string, username2: string): Promise<boolean> {
    // DELETE FROM Follower WHERE username1 = ... AND username2 = ...
    return new Promise((_, __) => false)
}

// Gets a game
export async function get_game(gamename: string): Promise<any> {
    // SELECT * FROM Game WHERE gamename = ...
}

// Finds all reviews on a game
export async function get_reviews_for(gamename: string): Promise<any> {
    // SELECT * FROM Review WHERE gamename = ...
}

// Creates a new review on a game
// Returns true iff the the user already reviewed the game
export async function create_review(username: string, gamename: string, text: string, score: number): Promise<boolean> {
    // INSERT INTO Review (username, gamename, text, score) VALUES (..., ..., ..., ...)
    return new Promise((_, __) => 0)
}

// Changes a review on a game
export async function alter_review(data: any): Promise<void> {
    // UPDATE Review SET text = ..., score = ... WHERE username = ... AND gamename = ...
}

// Deletes a review
export async function delete_review(username: string, gamename: string): Promise<void> {
    // DELETE FROM Review WHERE username = ... AND gamename = ...
}