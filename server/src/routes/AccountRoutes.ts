import { Router } from "express";
import { AccountController } from "../controllers/AccountController";
import { ReviewController } from "../controllers/ReviewController";
import { optionalAuth, auth } from "../utils/auth";
import { FollowerController } from "../controllers/FollowerController";
import FollowerRoutes from "./FollowerRoutes";

// Router object
const router: Router = Router({ mergeParams: true });


// ===================== AUTHENTICATION =====================

/**
 * @swagger
 *  /users:
 *      post:
 *          tags: [Users]
 *          summary: Registers a new account
 *          description: Registers a new account
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required: [accountName, displayName, password, email]
 *                          properties:
 *                              accountName:
 *                                  type: string
 *                              displayName:
 *                                  type: string
 *                              password:
 *                                  type: string
 *                              email:
 *                                  type: string
 *          responses:
 *              201:
 *                  description: "**Created** - account registered successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/AuthResponse'
 *              400:
 *                  description: "**Bad Request** — if any of the required fields is missing, if the account name is shorter than 3 characters, if the password is shorter than 8 characters, or if the email provided is invalid"
 *              409:
 *                  description: "**Conflict** — if the account name or email provided already exists"
 *              500:
 *                  description: "**Internal Server Error** — if the account could not be created"
 */
router.post("/", AccountController.Register);

/**
 * @swagger
 *  /users/login:
 *      post:
 *          tags: [Users]
 *          summary: Logs in an existing account
 *          description: Logs in an existing account
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required: [accountName, password]
 *                          properties:
 *                              accountName:
 *                                  type: string
 *                              password:
 *                                  type: string
 *          responses:
 *              200:
 *                  description: "**OK** — logged in successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/AuthResponse'
 *              400:
 *                  description: "**Bad Request** — if any of the required fields is missing"
 *              401:
 *                  description: "**Unauthorized** — if the provided credentials are invalid"
 */
router.post('/login', AccountController.Login);

/**
 * @swagger
 *  /users/logout:
 *      post:
 *          tags: [Users]
 *          summary: Logs out an existing account
 *          description: Logs out an existing account
 *          responses:
 *              200:
 *                  description: "**OK** — logged out successfully"
 *              401:
 *                  description: "**Unauthorized** — if the authenticated user doesn't exist"
 */
router.post('/logout', auth, AccountController.Logout);

// ===================== USER MANAGEMENT =====================

/**
 * @swagger
 *  /users/me:
 *      get:
 *          tags: [Users]
 *          summary: Gets the currently logged in account
 *          description: Gets the currently logged in account
 *          security:
 *              - bearerAuth: []
 *          responses:
 *              200:
 *                  description: "**OK** — account found successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/UserPublic'
 *              401:
 *                  description: "**Unauthorized** — if the authenticated user doesn't exist"
 */
router.get("/me", auth, AccountController.GetCurrentUser);

/**
 * @swagger
 *  /users/me:
 *      put:
 *          tags: [Users]
 *          summary: Alters account details in an existing account
 *          description: Alters account details in an existing account
 *          security:
 *              - bearerAuth: []
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              accountName:
 *                                  type: string
 *                              isPrivate:
 *                                  type: boolean
 *                              password:
 *                                  type: string
 *                              email:
 *                                  type: string
 *                              userData:
 *                                  type: object
 *          responses:
 *              200:
 *                  description: "**OK** — account updated successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/UserPublic'
 *              400:
 *                  description: "**Bad Request** — if the password (if provided) is shorter than 8 characters, or if the email (if provided) is invalid"
 *              404:
 *                  description: "**Not Found** — if the provided account's name doesn't exist"
 *              409:
 *                  description: "**Conflict** — if the email provided already exists"
 */
router.put("/me", auth, AccountController.Alter);

/**
 * @swagger
 *  /users/me:
 *      delete:
 *          tags: [Users]
 *          summary: Deletes an existing account
 *          description: Deletes an existing account
 *          security:
 *              - bearerAuth: []
 *          responses:
 *              200:
 *                  description: "**OK** — account deleted successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/UserPublic'
 *              404:
 *                  description: "**Not Found** — if the authenticated user doesn't exist"
 */
router.delete("/me", auth, AccountController.Remove);

/**
 * @swagger
 *  /users/me/followers/requests/received:
 *      get:
 *          tags: [Followers]
 *          summary: Gets the pending follower requests for a user (for private accounts)
 *          description: Gets the pending follower requests for a user (for private accounts)
 *          security:
 *              - bearerAuth: []
 *          responses:
 *              200:
 *                  description: "**OK** — pending requests retrieved successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  $ref: '#/components/schemas/Follower'
 *              404:
 *                  description: "**Not Found** — if the authenticated user doesn't exist"
 */
router.get("/me/followers/requests/received", auth, FollowerController.GetPendingRequestsToUser);

/**
 * @swagger
 *  /users/me/followers/requests/sent:
 *      get:
 *          tags: [Followers]
 *          summary: Gets the pending follower requests made by a user (for private accounts)
 *          description: Gets the pending follower requests made by a user (for private accounts)
 *          security:
 *              - bearerAuth: []
 *          responses:
 *              200:
 *                  description: "**OK** — pending requests retrieved successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  $ref: '#/components/schemas/Follower'
 *              404:
 *                  description: "**Not Found** — if the authenticated user doesn't exist"
 */
router.get("/me/followers/requests/sent", auth, FollowerController.GetPendingRequestsFromUser);

/**
 * @swagger
 *  /users/me/followers/requests/received/{username}:
 *      put:
 *          tags: [Followers]
 *          summary: Accepts a follower request from user ":username"
 *          description: Accepts a follower request from user ":username"
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: path
 *                name: username
 *                required: true
 *                schema:
 *                  type: string
 *          responses:
 *              202:
 *                  description: "**Accepted** — follower request accepted successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Follower'
 *              400:
 *                  description: "**Bad Request** — if the username is missing"
 *              404:
 *                  description: "**Not Found** — if any of the provided user names don't exist, or if the first user didn't request to follow the second"
 *              409:
 *                  description: "**Conflict** — if the second user already accepted the request"
 */
router.put("/me/followers/requests/received/:username", auth, FollowerController.AcceptFollowerRequest);

/**
 * @swagger
 *  /users/me/followers/requests/received/{username}:
 *      delete:
 *          tags: [Followers]
 *          summary: Rejects follower request from ":username"
 *          description: Rejects follower request from ":username"
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: path
 *                name: username
 *                required: true
 *                schema:
 *                  type: string
 *          responses:
 *              202:
 *                  description: "**Accepted** — follower request rejected successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Follower'
 *              400:
 *                  description: "**Bad Request** — if the username is missing"
 *              404:
 *                  description: "**Not Found** — if any of the provided user names don't exist, or if the follow request doesn't exist"
 */
router.delete("/me/followers/requests/received/:username", auth, FollowerController.RejectFollowerRequest);

// ===================== SEARCH USERS =====================

/**
 * @swagger
 *  /users/search:
 *      get:
 *          tags: [Users]
 *          summary: Finds accounts by a likely match
 *          description: Finds accounts by a likely match
 *          parameters:
 *              - in: query
 *                name: query
 *                required: true
 *                schema:
 *                  type: string
 *          responses:
 *              200:
 *                  description: "**OK** — accounts found successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  $ref: '#/components/schemas/UserPublic'
 *              400:
 *                  description: "**Bad Request** — if the query is invalid or empty"
 */
router.get("/search", optionalAuth, AccountController.Search);

// ===================== USER SUB-RESOURCES =====================

// api/users/:username/followers routes are handled by FollowerRoutes
router.use("/:username/followers", FollowerRoutes);

/**
 * @swagger
 *  /users/{username}/following:
 *      get:
 *          tags: [Followers]
 *          summary: Gets the users followed by a user
 *          description: Gets the users followed by a user, if it's private only returns followed users if the current user follows it
 *          parameters:
 *              - in: path
 *                name: username
 *                required: true
 *                schema:
 *                  type: string
 *          responses:
 *              200:
 *                  description: "**OK** — followed users retrieved successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  $ref: '#/components/schemas/Follower'
 *              400:
 *                  description: "**Bad Request** — if no user name was provided"
 *              403:
 *                  description: "**Forbidden** — if the account is private and the current user doesn't follow it"
 *              404:
 *                  description: "**Not Found** — if the provided user name doesn't exist"
 */
router.get("/:username/following", optionalAuth, FollowerController.GetFollowingByUser);

/**
 * @swagger
 *  /users/{username}/reviews:
 *      get:
 *          tags: [Reviews]
 *          summary: Gets the reviews of a user
 *          description: Gets the reviews of a user
 *          parameters:
 *              - in: path
 *                name: username
 *                required: true
 *                schema:
 *                  type: string
 *          responses:
 *              200:
 *                  description: "**OK** — reviews retrieved successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  $ref: '#/components/schemas/Review'
 *              400:
 *                  description: "**Bad Request** — if no user name was provided"
 *              403:
 *                  description: "**Forbidden** — if the account is private and the current user doesn't follow it"
 *              404:
 *                  description: "**Not Found** — if the provided user name doesn't exist"
 */
router.get("/:username/reviews", optionalAuth, ReviewController.GetReviewsByUser);

// ===================== FIND USER PROFILE =====================

/**
 * @swagger
 *  /users/{username}:
 *      get:
 *          tags: [Users]
 *          summary: Finds an account by its name
 *          description: |
 *              Finds an account by its name.
 *              The account has to be public or in case of private the current authenticated user has to follow it,
 *              otherwise only the account's name and its privacy settings are shown
 *          parameters:
 *              - in: path
 *                name: username
 *                required: true
 *                schema:
 *                  type: string
 *          responses:
 *              200:
 *                  description: "**OK** — account found successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/UserPublic'
 *              400:
 *                  description: "**Bad Request** — if the account's name is missing"
 *              404:
 *                  description: "**Not Found** — if the provided account's name doesn't exist"
 */
router.get("/:username", optionalAuth, AccountController.FindByUsername);

export default router;
