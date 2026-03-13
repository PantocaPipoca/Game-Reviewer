import { Router } from "express";
import { FollowerController } from "../controllers/FollowerController";
import { auth, optionalAuth } from "../utils/auth";

const router: Router = Router({ mergeParams: true });

// ===================== GET FOLLOWERS =====================

/**
 * @swagger
 *  /users/{username}/followers:
 *      get:
 *          tags: [Followers]
 *          summary: Gets the followers of an account
 *          description: Gets the followers of an account
 *          parameters:
 *              - in: path
 *                  name: username
 *                  required: true
 *                  schema:
 *                      type: string
 *          responses:
 *              200:
 *                  description: "**OK** — followers retrieved successfully"
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
router.get("/", optionalAuth, FollowerController.GetFollowers);

// ===================== FOLLOW RELATION =====================

/**
 * @swagger
 *  /users/{username}/followers:
 *      post:
 *          tags: [Followers]
 *          summary: Makes a follower request to user ":username" from current logged in user
 *          description: Makes a follower request to user ":username" from current logged in user
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: path
 *                  name: username
 *                  required: true
 *                  schema:
 *                      type: string
 *          responses:
 *              201:
 *                  description: "**Created** — follower request made successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Follower'
 *              400:
 *                  description: "**Bad Request** — if the username is missing"
 *              404:
 *                  description: "**Not Found** — if any of the provided user names don't exist"
 *              409:
 *                  description: "**Conflict** — if the user is trying to follow themselves, or if a follow request already exists"
 */
router.post("/", auth, FollowerController.RequestFollower);

/**
 * @swagger
 *  /users/{username}/followers:
 *      delete:
 *          tags: [Followers]
 *          summary: Unfollows/cancels request to :username
 *          description: Unfollows/cancels request to :username
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: path
 *                  name: username
 *                  required: true
 *                  schema:
 *                      type: string
 *          responses:
 *              202:
 *                  description: "**Accepted** — unfollowed successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Follower'
 *              400:
 *                  description: "**Bad Request** — if the username is missing"
 *              404:
 *                  description: "**Not Found** — if any of the provided user names don't exist, or if the first user name doesn't follow the second yet"
 */
router.delete("/", auth, FollowerController.UnfollowUser);

export default router;
