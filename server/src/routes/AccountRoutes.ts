import {Router} from "express"
import {AccountController} from "../controllers/AccountController"

// Router object
const router: Router = Router()

/**
 * POST /api/register
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
router.post('/api/register', AccountController.Register)

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
router.get('/api/login', AccountController.Login)

/**
 * GET /api/me
 * Gets the currently logged in account
 * (Empty body)
 * Response:
 *      200 OK
 *      {accountName, userData}
 *      401 NOT AUTHORIZED, if no account is logged in
 */
router.get('/api/me', AccountController.GetCurrentUser)

/**
 * PUT /api/updacc
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
router.put('/api/updacc', AccountController.Alter)

/**
 * DELETE /api/remacc
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
router.delete('/api/remacc', AccountController.Remove)

export default router
