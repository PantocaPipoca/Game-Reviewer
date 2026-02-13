import {Router} from "express"
import {AccountController} from "../controllers/AccountController"
import { ReviewController } from "../controllers/ReviewController";

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
router.get('/me', AccountController.GetCurrentUser);

/**
 * PUT /api/user/:username
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
router.put('/:username', AccountController.Alter);

/**
 * DELETE /api/users/:username
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
router.delete('/:username', AccountController.Remove);

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
router.get('/:username/reviews', ReviewController.getReviewsByUser);


// ===================== SEARCH USERS =====================

/**
 * GET /api/user/:username
 * Finds an account by its name
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
router.get('/:username', AccountController.FindByUsername);

/**
 * GET /api/users
 * Get viewable (public & followed) users
 * (Empty body)
 * Response:
 *     200 OK
 *     [{accountName, email, createdAt, updatedAt, userData}, ...]
 *     500 INTERNAL SERVER ERROR, if the accounts could not be retrieved
 */
router.get('/', AccountController.GetUsers);


export default router;
