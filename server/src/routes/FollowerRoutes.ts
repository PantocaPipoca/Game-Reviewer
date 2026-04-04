import { Router } from "express";
import { FollowerController } from "../controllers/FollowerController";
import { auth, optionalAuth } from "../utils/Auth";

const router: Router = Router({ mergeParams: true });

// ===================== GET FOLLOWERS =====================

/**
 * @swagger
 *  /users/id/{username}/followers:
 *      get:
 *          tags: [Followers]
 *          summary: Gets the followers of an account
 *          description: Gets the followers of an account, if the account is private, only returns results if the current user follows it
 *          parameters:
 *              - in: path
 *                name: username
 *                required: true
 *                schema:
 *                  type: string
 *          responses:
 *              200:
 *                  description: "**OK** — followers retrieved successfully"
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
 *                                          $ref: '#/components/schemas/Follower'
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
router.get("/", optionalAuth, FollowerController.getFollowers);

// ===================== FOLLOW RELATION =====================

/**
 * @swagger
 *  /users/id/{username}/followers:
 *      post:
 *          tags: [Followers]
 *          summary: Makes a follower request to user ":username" from current logged in user
 *          description: Makes a follower request to user ":username" from current logged in user
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: path
 *                name: username
 *                required: true
 *                schema:
 *                  type: string
 *          responses:
 *              201:
 *                  description: "**Created** — follower request made successfully"
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
 *                  description: "**Not Found** — if any of the provided user names don't exist"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              409:
 *                  description: "**Conflict** — if the user is trying to follow themselves, or if a follow request already exists"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.post("/", auth, FollowerController.requestFollower);

/**
 * @swagger
 *  /users/id/{username}/followers:
 *      delete:
 *          tags: [Followers]
 *          summary: Unfollows / cancels request to :username
 *          description: Unfollows / cancels a pending follow request to :username
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
 *                  description: "**Accepted** — unfollowed successfully"
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
 *                  description: "**Not Found** — if any of the provided user names don't exist, or if the first user name doesn't follow the second yet"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.delete("/", auth, FollowerController.unfollowOrCancelFollowRequest);

export default router;
