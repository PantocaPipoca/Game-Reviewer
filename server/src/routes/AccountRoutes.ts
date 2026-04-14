import { Router } from "express";
import multer from "multer";
import { AccountController } from "../controllers/AccountController";
import { ReviewController } from "../controllers/ReviewController";
import { optionalAuth, auth } from "../utils/Auth";
import { FollowerController } from "../controllers/FollowerController";
import FollowerRoutes from "./FollowerRoutes";

const router: Router = Router({ mergeParams: true });

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            cb(new Error("Only image files are allowed"));
            return;
        }
        cb(null, true);
    },
});

// ===================== AUTHENTICATION =====================

/**
 * @swagger
 *  /users:
 *      post:
 *          tags: [Users]
 *          summary: Registers a new user
 *          description: Registers a new user
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
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      oneOf:
 *                                          - type: string
 *                                          - $ref: '#/components/schemas/AuthResponse'
 *              400:
 *                  description: "**Bad Request** — if any of the required fields is missing, if the account name is shorter than 3 characters, if the password is shorter than 8 characters, or if the email provided is invalid"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              409:
 *                  description: "**Conflict** — if the account name or email provided already exists"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              500:
 *                  description: "**Internal Server Error** — if the account could not be created"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.post("/", AccountController.register);
// will not return a token and will just return a message that states a confirmation code has been sent to the given email

/**
 * @swagger
 *  /users/validation:
 *      get:
 *          tags: [Users]
 *          summary: Validates a new user using email
 *          description: Validates a user using their username and a code sent to their email
 *          parameters:
 *              - name: user
 *                in: query
 *                required: true
 *                schema:
 *                  type: string
 *              - name: code
 *                in: query
 *                required: true
 *                schema:
 *                  type: integer
 *
 *          responses:
 *              200:
 *                  description: "**OK** — Validation successful and received a token"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: sucsess
 *                                  data:
 *                                      $ref: '#/components/schemas/AuthResponse'
 *              400:
 *                  description: "**Bad Request** — if any of the required fields is missing or is in the wrong format"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              404:
 *                  description: "**Not Found** — if no account corresponds to the account name and code"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *
 */
router.get("/validation", AccountController.validate);

/**
 * @swagger
 *  /users/login:
 *      post:
 *          tags: [Users]
 *          summary: Logs in an existing user account
 *          description: Logs in an existing user account
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
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      $ref: '#/components/schemas/AuthResponse'
 *              400:
 *                  description: "**Bad Request** — if any of the required fields is missing"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              401:
 *                  description: "**Unauthorized** — if the provided credentials are invalid"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              428:
 *                  description: "**Precondition Required** — user still needs confirmation email"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      type: string
 */
router.post("/login", AccountController.login);

/**
 * @swagger
 *  /users/logout:
 *      post:
 *          tags: [Users]
 *          summary: Logs out the current logged in user
 *          description: Logs out the current logged in user
 *          security:
 *              - bearerAuth: []
 *          responses:
 *              200:
 *                  description: "**OK** - logged out successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      type: string
 *                                      nullable: true
 *                                      example: null
 *              401:
 *                  description: "**Unauthorized** - if no account is logged in"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.post("/logout", auth, AccountController.logout);

// ===================== CURRENT USER MANAGEMENT =====================

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
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      $ref: '#/components/schemas/UserMe'
 *              401:
 *                  description: "**Unauthorized** — if the authenticated user doesn't exist"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.get("/me", auth, AccountController.getCurrentUser);

/**
 * @swagger
 *  /users/me:
 *      put:
 *          tags: [Users]
 *          summary: Alters the currently logged in user account
 *          description: Alters the currently logged in user account
 *          security:
 *              - bearerAuth: []
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              profilePic:
 *                                  type: string
 *                                  nullable: true
 *                              isPrivate:
 *                                  type: boolean
 *                              password:
 *                                  type: string
 *                                  nullable: true
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
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      $ref: '#/components/schemas/UserPublic'
 *              400:
 *                  description: "**Bad Request** — if the password (if provided) is shorter than 8 characters, or if the email (if provided) is invalid"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              401:
 *                  description: "**Unauthorized** - if no account is logged in"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              404:
 *                  description: "**Not Found** - if the account doesn't exist"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              409:
 *                  description: "**Conflict** - if the email provided already exists"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.put("/me", auth, AccountController.alter);

/**
 * @swagger
 *  /users/me:
 *      delete:
 *          tags: [Users]
 *          summary: Deletes the currently logged in user account
 *          description: Deletes the currently logged in user account
 *          security:
 *              - bearerAuth: []
 *          responses:
 *              200:
 *                  description: "**OK** — account deleted successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      $ref: '#/components/schemas/UserPublic'
 *              401:
 *                  description: "**Unauthorized** - if no account is logged in"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              404:
 *                  description: "**Not Found** — if the authenticated user doesn't exist"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.delete("/me", auth, AccountController.remove);

/**
 * @swagger
 *  /users/me/avatar:
 *      put:
 *          tags: [Users]
 *          summary: Uploads or replaces the current user's profile picture
 *          description: Accepts a multipart/form-data request with an image file. Max size 5MB. Returns the Cloudinary URL of the uploaded image.
 *          security:
 *              - bearerAuth: []
 *          requestBody:
 *              required: true
 *              content:
 *                  multipart/form-data:
 *                      schema:
 *                          type: object
 *                          required: [avatar]
 *                          properties:
 *                              avatar:
 *                                  type: string
 *                                  format: binary
 *          responses:
 *              200:
 *                  description: "**OK** — avatar uploaded successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      type: object
 *                                      properties:
 *                                          url:
 *                                              type: string
 *                                              example: "https://res.cloudinary.com/..."
 *              400:
 *                  description: "**Bad Request** — if no file was provided or the file exceeds 5MB"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              401:
 *                  description: "**Unauthorized** — if no account is logged in"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.put("/me/avatar", auth, upload.single("avatar"), AccountController.uploadAvatar);

/**
 * @swagger
 *  /users/id/{username}/avatar:
 *      get:
 *          tags: [Users]
 *          summary: Redirects to the profile picture of a user
 *          description: Returns a 302 redirect to the Cloudinary URL of the user's profile picture.
 *          parameters:
 *              - in: path
 *                name: username
 *                required: true
 *                schema:
 *                  type: string
 *          responses:
 *              302:
 *                  description: "**Found** — redirects to the image URL"
 *              400:
 *                  description: "**Bad Request** — if the username is missing"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              404:
 *                  description: "**Not Found** — if the user doesn't exist or has no profile picture set"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.get("/id/:username/avatar", AccountController.getAvatar);

// ===================== CURRENT USER FOLLOWER MANAGEMENT =====================

/**
 * @swagger
 *  /users/me/followers/requests/sent:
 *      get:
 *          tags: [Followers]
 *          summary: Gets the pending follower requests made by the current user
 *          description: Gets the pending follower requests made by the current user
 *          security:
 *              - bearerAuth: []
 *          responses:
 *              200:
 *                  description: "**OK** — pending requests retrieved successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      type: array
 *                                      items:
 *                                          $ref: '#/components/schemas/FollowerPublic'
 *              401:
 *                  description: "**Unauthorized** - if no account is logged in"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              404:
 *                  description: "**Not Found** — if the authenticated user doesn't exist"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.get("/me/followers/requests/sent", auth, FollowerController.getPendingRequestsFromUser);

/**
 * @swagger
 *  /users/me/followers/requests/received:
 *      get:
 *          tags: [Followers]
 *          summary: Gets the pending follower requests received by the current user
 *          description: Gets the pending follower requests received by the current user (for private accounts)
 *          security:
 *              - bearerAuth: []
 *          responses:
 *              200:
 *                  description: "**OK** — pending requests retrieved successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      type: array
 *                                      items:
 *                                          $ref: '#/components/schemas/FollowerPublic'
 *              401:
 *                  description: "**Unauthorized** - if no account is logged in"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              404:
 *                  description: "**Not Found** - if the account doesn't exist"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.get("/me/followers/requests/received", auth, FollowerController.getPendingRequestsToUser);

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
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      $ref: '#/components/schemas/Follower'
 *              400:
 *                  description: "**Bad Request** — if the username is missing"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              401:
 *                  description: "**Unauthorized** - if no account is logged in"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              404:
 *                  description: "**Not Found** — if any of the provided user names don't exist, or if the first user didn't request to follow the second"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              409:
 *                  description: "**Conflict** — if the second user already accepted the request"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.put("/me/followers/requests/received/:username", auth, FollowerController.acceptFollowerRequest);

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
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      $ref: '#/components/schemas/Follower'
 *              400:
 *                  description: "**Bad Request** — if the username is missing"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              401:
 *                  description: "**Unauthorized** - if no account is logged in"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              404:
 *                  description: "**Not Found** — if any of the provided user names don't exist, or if the follow request doesn't exist"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.delete("/me/followers/requests/received/:username", auth, FollowerController.removeFollowerOrRejectRequest);

/**
 * @swagger
 *  /users/me/followers/{username}:
 *      delete:
 *          tags: [Followers]
 *          summary: Removes a follower from the current user's followers list
 *          description: Removes a user from the current user's followers. Works for both accepted followers and pending requests.
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
 *                  description: "**Accepted** — follower removed successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      $ref: '#/components/schemas/Follower'
 *              400:
 *                  description: "**Bad Request** — if the username is missing"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              401:
 *                  description: "**Unauthorized** — if no account is logged in"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              404:
 *                  description: "**Not Found** — if either user doesn't exist, or if the user is not a follower"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.delete("/me/followers/:username", auth, FollowerController.removeFollowerOrRejectRequest);

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
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      type: array
 *                                      items:
 *                                          $ref: '#/components/schemas/UserPublic'
 *              400:
 *                  description: "**Bad Request** — if the query is invalid or empty"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.get("/search", optionalAuth, AccountController.search);

// ===================== USER SUB-RESOURCES =====================

// api/users/id/:username/followers routes are handled by FollowerRoutes
router.use("/id/:username/followers", FollowerRoutes);

/**
 * @swagger
 *  /users/id/{username}/following:
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
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      type: array
 *                                      items:
 *                                          $ref: '#/components/schemas/FollowerPublic'
 *              400:
 *                  description: "**Bad Request** — if no user name was provided"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              403:
 *                  description: "**Forbidden** — if the account is private and the current user doesn't follow it"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              404:
 *                  description: "**Not Found** — if the provided user name doesn't exist"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.get("/id/:username/following", optionalAuth, FollowerController.getFollowingByUser);

/**
 * @swagger
 *  /users/id/{username}/reviews:
 *      get:
 *          tags: [Reviews]
 *          summary: Gets the reviews of a user
 *          description: Gets the reviews of a user, if the account is private, only returns results if the current user follows it.
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
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      type: array
 *                                      items:
 *                                          $ref: '#/components/schemas/Review'
 *              400:
 *                  description: "**Bad Request** — if no user name was provided"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              403:
 *                  description: "**Forbidden** — if the account is private and the current user doesn't follow it"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              404:
 *                  description: "**Not Found** — if the provided user name doesn't exist"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.get("/id/:username/reviews", optionalAuth, ReviewController.getReviewsByUser);

/**
 * @swagger
 *  /users/id/{username}:
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
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      $ref: '#/components/schemas/UserPublic'
 *              400:
 *                  description: "**Bad Request** — if the account's name is missing"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              404:
 *                  description: "**Not Found** — if the provided account's name doesn't exist"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.get("/id/:username", optionalAuth, AccountController.findByUsername);

export default router;
