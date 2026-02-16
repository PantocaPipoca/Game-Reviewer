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
 *      {accountName, passwordHash, email, createdAt, updatedAt, userData}
 *      400 BAD REQUEST, if any of the required fields is missing
 *      400 BAD REQUEST, if the account name is shorter than 3 characters
 *      400 BAD REQUEST, if the password is shorter than 8 characters
 *      400 BAD REQUEST, if the email provided is invalid
 *      409 CONFLICT, if the user name provided already exists
 *      500 INTERNAL SERVER ERROR, if the account could not be created
 */
router.post('/', AccountController.Register);

/**
 * GET /api/login
 * Logs in an existing account
 * Body:
 *      accountName: string
 *      displayName: string
 *      password: string
 * Response:
 *      200 OK
 *      {accountName, userData}
 *      400 BAD REQUEST, if any of the required fields is missing
 *      404 NOT FOUND, if the provided user name doesn't exist
 *      403 FORBIDDEN, if the provided password is incorrect
 */
router.get('/login', AccountController.Login);


// ===================== USER MANAGEMENT =====================

/**
 * GET /api/users/me
 * Gets the currently logged in account
 * (Empty body)
 * Response:
 *      200 OK
 *      {accountName, userData}
 *      401 NOT AUTHORIZED, if no account is logged in
 */
router.get('/me', auth, AccountController.GetCurrentUser);

/**
 * PUT /api/users/me
 * Alters account details in an existing account
 * Body:
 *      accountName: string
 *      displayName: string
 *      password: string
 *      email: string
 * Response:
 *      202 ACCEPTED
 *      {accountName, passwordHash, email, createdAt, updatedAt, userData}
 *      400 BAD REQUEST, if the account's name is missing
 *      400 BAD REQUEST, if the password (if provided) is shorter than 8 characters
 *      400 BAD REQUEST, if the email (if provided) is invalid
 *      404 NOT FOUND, if the provided account's name doesn't exist
 *      500 INTERNAL SERVER ERROR, if the account could not be updated
 */
router.put('/me', auth, AccountController.Alter);

/**
 * DELETE /api/users/me
 * Deletes an existing account
 * Body:
 *      accountName: string
 * Response:
 *      202 ACCEPTED
 *      {accountName, passwordHash, email, createdAt, updatedAt, userData}
 *      400 BAD REQUEST, if the accountName field is missing
 *      404 NOT FOUND, if provided user name doesn't exist
 *      500 INTERNAL SERVER ERROR, if the account could not be deleted
 */
router.delete('/me', auth,AccountController.Remove);


// ===================== SEARCH USERS =====================

/**
 * GET /api/users/:username
 * Finds an account by its name
 * The account has to be public or in case of private the current authenticated user has to follow it
 * Body:
 *      accountName: string
 *      displayName: string
 *      password: string
 *      email: string
 * Response:
 *      202 ACCEPTED
 *      {accountName, passwordHash, email, createdAt, updatedAt, userData}
 *      400 BAD REQUEST, if the account's name is missing
 *      400 BAD REQUEST, if the password (if provided) is shorter than 8 characters
 *      400 BAD REQUEST, if the email (if provided) is invalid
 *      404 NOT FOUND, if the provided account's name doesn't exist
 *      500 INTERNAL SERVER ERROR, if the account could not be updated
 */
router.get('/:username', optionalAuth, AccountController.FindByUsername);

/**
 * GET /api/users
 * Get viewable (public & followed) users
 * (Empty body)
 * Response:
 *     200 OK
 *     [{accountName, email, createdAt, updatedAt, userData}, ...]
 *     500 INTERNAL SERVER ERROR, if the accounts could not be retrieved
 */
router.get('/', optionalAuth, AccountController.GetUsers);


// ===================== FOLLOWERS =====================

router.use('/:username/followers', FollowerRoutes);

/**
 * GET /api/users/:username/following
 * Gets the users followed by a user, if it's private only returns followed users if the current user follows it
 * Body:
 *      (empty body)
 * Response:
 *      200 OK
 *      [{reviewer, reviewed, text, score, createdAt, updatedAt}]
 *      404 NOT FOUND, if the provided user name doesn't exist
 *      500 INTERNAL SERVER ERROR, if the reviews couldn't be retrieved
 */
router.get('/:username/following', optionalAuth, FollowerController.GetFollowingByUser);


// ===================== REVIEWS =====================

/**
 * GET /api/users/:username/reviews
 * Gets the reviews of a user
 * Body:
 *      (empty body)
 * Response:
 *      200 OK
 *      [{reviewer, reviewed, text, score, createdAt, updatedAt}]
 *      404 NOT FOUND, if the provided user name doesn't exist
 *      500 INTERNAL SERVER ERROR, if the reviews couldn't be retrieved
 */
router.get('/:username/reviews', optionalAuth, ReviewController.getReviewsByUser);


export default router;
