import {Router} from "express"
import {AccountController} from "../controllers/AccountController"
import { ReviewController } from "../controllers/ReviewController";
import { optionalAuth, auth } from "../utils/auth";
import { FollowerController } from "../controllers/FollowerController";
import FollowerRoutes from "./FollowerRoutes";

// Router object
const router: Router = Router();


// ===================== AUTHENTICATION =====================

/**
 * POST /api/users
 * Registers a new account
 * Body:
 *      accountName: string
 *      displayName: string
 *      password: string
 *      email: string
 * Response:
 *      201 CREATED
 *      {accountName, isPrivate, userData, createdAt, token}
 *      400 BAD REQUEST             if any of the required fields is missing
 *      400 BAD REQUEST             if the account name is shorter than 3 characters
 *      400 BAD REQUEST             if the password is shorter than 8 characters
 *      400 BAD REQUEST             if the email provided is invalid
 *      409 CONFLICT                if the user name provided already exists
 *      500 INTERNAL SERVER ERROR   if the account could not be created
 */
router.post('/', AccountController.Register);

/**
 * POST /api/users/login
 * Logs in an existing account
 * Body:
 *      accountName: string
 *      password: string
 * Response:
 *      200 OK
 *      {accountName, isPrivate, userData, createdAt, token}
 *      400 BAD REQUEST     if any of the required fields is missing
 *      404 NOT FOUND       if the provided user name doesn't exist
 *      403 FORBIDDEN       if the provided password is incorrect
 */
router.post('/login', AccountController.Login);


// ===================== USER MANAGEMENT =====================

/**
 * GET /api/users/me
 * Gets the currently logged in account
 * (Empty body)
 * Response:
 *      200 OK
 *      {accountName, isPrivate, userData, createdAt}
 *      401 UNAUTHORIZED    if no account is logged in
 *      404 NOT FOUND       if the username logged in doesn't exist
 */
router.get('/me', auth, AccountController.GetCurrentUser);

/**
 * PUT /api/users/me
 * Alters account details in an existing account
 * Body:
 *      accountName: string
 *      isPrivate?: boolean
 *      password?: string
 *      email?: string
 *      userData?: JSON
 * Response:
 *      202 ACCEPTED
 *      {accountName, isPrivate, userData, createdAt}
 *      400 BAD REQUEST             if the account's name is missing
 *      400 BAD REQUEST             if the password (if provided) is shorter than 8 characters
 *      400 BAD REQUEST             if the email (if provided) is invalid
 *      404 NOT FOUND               if the provided account's name doesn't exist
 *      500 INTERNAL SERVER ERROR   if the account could not be updated
 */
router.put('/me', auth, AccountController.Alter);

/**
 * DELETE /api/users/me
 * Deletes an existing account
 * Body:
 *      accountName: string
 * Response:
 *      202 ACCEPTED
 *      {accountName, isPrivate, userData, createdAt}
 *      400 BAD REQUEST             if the accountName field is missing
 *      404 NOT FOUND               if provided user name doesn't exist
 *      500 INTERNAL SERVER ERROR   if the account could not be deleted
 */
router.delete('/me', auth, AccountController.Remove);

/**
 * GET /api/users/me/followers/requests/received
 * Gets the pending follower requests for a user (for private accounts)
 * (Empty body)
 * Response:
 *      200 OK
 *      [{follows, followed, accepted, createdAt, updatedAt}]
 *      400 BAD REQUEST             if no user name was provided
 *      404 NOT FOUND               if the provided user name doesn't exist
 *      500 INTERNAL SERVER ERROR   if the followers couldn't be retrieved
 */
router.get('/me/followers/requests/received', auth, FollowerController.GetPendingRequestsToUser);

/**
 * GET /api/users/me/followers/requests/sent
 * Gets the pending follower requests made by a user (for private accounts)
 * (Empty body)
 * Response:
 *      200 OK
 *      [{follows, followed, accepted, createdAt, updatedAt}]
 *      400 BAD REQUEST             if no user name was provided
 *      404 NOT FOUND               if the provided user name doesn't exist
 *      500 INTERNAL SERVER ERROR   if the followers couldn't be retrieved
 */
router.get('/me/followers/requests/sent', auth, FollowerController.GetPendingRequestsFromUser);

/**
 * PUT /api/users/me/followers/requests/received/:username
 * Accepts a follower request from user ":username"
 * (Empty body)
 * Response:
 *      202 ACCEPTED
 *      {follows, followed, accepted, createdAt, updatedAt}
 *      400 BAD REQUEST             if either user name or followerName are missing
 *      403 FORBIDDEN               if no account is logged in
 *      404 NOT FOUND               if any of the provided user names don't exist
 *      404 NOT FOUND               if the first user didn't request to follow the second
 *      409 CONFLICT                if the second user already accepted the request
 *      500 INTERNAL SERVER ERROR   if the request couldn't be accepted
 */
router.put('/me/followers/requests/received/:username', auth, FollowerController.AcceptFollowerRequest);

/**
 * DELETE /api/users/me/followers/requests/received/:username
 * Rejects follower request from "":username"
 * (Empty body)
 * Response:
 *      202 ACCEPTED
 *      {follows, followed, accepted, createdAt, updatedAt}
 *      400 BAD REQUEST             if either user name or followerName are missing
 *      403 FORBIDDEN               if no account is logged in
 *      404 NOT FOUND               if any of the provided user names don't exist
 *      404 NOT FOUND               if the first user name doesn't follow the second yet
 *      500 INTERNAL SERVER ERROR   if the follower couldn't be removed
 */
router.delete('/me/followers/requests/received/:username', auth, FollowerController.RejectFollowerRequest);

// ===================== SEARCH USERS =====================

/**
 * GET /api/users/search?query=...
 * Finds accounts by a likely match
 * (Empty body)
 * Response:
 *      200 OK
 *      [{accountName, isPrivate, userData, createdAt}]
 *      400 BAD REQUEST     if the query is invalid or empty
 */
router.get('/search', optionalAuth, AccountController.Search)


// ===================== USER SUB-RESOURCES =====================

/**
 * GET /api/users/:username/followers
 * Gets the followers of a user, if it's private only returns followed users if the current user follows it
 * (Empty body)
 * Response:
 *      200 OK
 *      [{follows, followed, accepted, createdAt, updatedAt}]
 *      400 BAD REQUEST             if no user name was provided
 *      404 NOT FOUND               if the provided user name doesn't exist
 *      500 INTERNAL SERVER ERROR   if the followers couldn't be retrieved
 */
router.use('/:username/followers', FollowerRoutes);

/**
 * GET /api/users/:username/following
 * Gets the users followed by a user, if it's private only returns followed users if the current user follows it
 * (Empty body)
 * Response:
 *      200 OK
 *      [{follows, followed, accepted, createdAt, updatedAt}]
 *      400 BAD REQUEST             if no user name was provided
 *      404 NOT FOUND               if the provided user name doesn't exist
 *      500 INTERNAL SERVER ERROR   if the reviews couldn't be retrieved
 */
router.get('/:username/following', optionalAuth, FollowerController.GetFollowingByUser);


/**
 * GET /api/users/:username/reviews
 * Gets the reviews of a user
 * (Empty body)
 * Response:
 *      200 OK
 *      [{reviewer, reviewed, text, score, createdAt, updatedAt}]
 *      400 BAD REQUEST             if no user name was provided
 *      404 NOT FOUND               if the provided user name doesn't exist
 *      500 INTERNAL SERVER ERROR   if the reviews couldn't be retrieved
 */
router.get('/:username/reviews', optionalAuth, ReviewController.GetReviewsByUser);


// ===================== FIND USER PROFILE =====================

/**
 * GET /api/users/:username
 * Finds an account by its name
 * The account has to be public or in case of private the current authenticated user has to follow it,
 * otherwise only the account's name and its privacy settings are shown
 * Body:
 *      accountName: string
 * Response:
 *      200 OK
 *      {accountName, isPrivate, userData, createdAt}
 *      400 BAD REQUEST             if the account's name is missing
 *      404 NOT FOUND               if the provided account's name doesn't exist
 *      500 INTERNAL SERVER ERROR   if the account could not be updated
 */
router.get('/:username', optionalAuth, AccountController.FindByUsername);

export default router;
