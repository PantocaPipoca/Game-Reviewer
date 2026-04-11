import { Router } from "express";
import { LikeController } from "../controllers/LikeController";
import { auth } from "../utils/Auth";

const router: Router = Router({ mergeParams: true });

// ===================== LIKES =====================

/**
 * @swagger
 *  /reviews/{reviewer}/{reviewed}/likes:
 *      get:
 *          tags: [Reactions]
 *          summary: Gets the like count of a review
 *          description: Gets the like count of a review
 *          parameters:
 *              - in: path
 *                name: reviewer
 *                required: true
 *                schema:
 *                  type: string
 *              - in: path
 *                name: reviewed
 *                required: true
 *                schema:
 *                  type: integer
 *          responses:
 *              200:
 *                  description: "**OK** — like count retrieved successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      type: integer
 *              400:
 *                  description: "**Bad Request** — if any required path parameter is missing or invalid"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              404:
 *                  description: "**Not Found** — if the user or game doesn't exist, or if the user hasn't reviewed this game"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.get("/likes", LikeController.getLikes);

/**
 * @swagger
 *  /reviews/{reviewer}/{reviewed}/likes:
 *      post:
 *          tags: [Reactions]
 *          summary: Adds or updates a like on a review
 *          description: Adds a like to a review. If the user already reacted, the existing reaction is updated to a like.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: path
 *                name: reviewer
 *                required: true
 *                schema:
 *                  type: string
 *              - in: path
 *                name: reviewed
 *                required: true
 *                schema:
 *                  type: integer
 *          responses:
 *              202:
 *                  description: "**Accepted** — like added successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      $ref: '#/components/schemas/Like'
 *              400:
 *                  description: "**Bad Request** — if any required path parameter is missing or invalid"
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
 *                  description: "**Not Found** — if the user or game doesn't exist, or if the user hasn't reviewed this game"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.post("/likes", auth, LikeController.addLike);

// ===================== DISLIKES =====================

/**
 * @swagger
 *  /reviews/{reviewer}/{reviewed}/dislikes:
 *      get:
 *          tags: [Reactions]
 *          summary: Gets the dislike count of a review
 *          description: Gets the dislike count of a review
 *          parameters:
 *              - in: path
 *                name: reviewer
 *                required: true
 *                schema:
 *                  type: string
 *              - in: path
 *                name: reviewed
 *                required: true
 *                schema:
 *                  type: integer
 *          responses:
 *              200:
 *                  description: "**OK** — dislike count retrieved successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      type: integer
 *              400:
 *                  description: "**Bad Request** — if any required path parameter is missing or invalid"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              404:
 *                  description: "**Not Found** — if the user or game doesn't exist, or if the user hasn't reviewed this game"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.get("/dislikes", LikeController.getDislikes);

/**
 * @swagger
 *  /reviews/{reviewer}/{reviewed}/dislikes:
 *      post:
 *          tags: [Reactions]
 *          summary: Adds or updates a dislike on a review
 *          description: Adds a dislike to a review. If the user already reacted, the existing reaction is updated to a dislike.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: path
 *                name: reviewer
 *                required: true
 *                schema:
 *                  type: string
 *              - in: path
 *                name: reviewed
 *                required: true
 *                schema:
 *                  type: integer
 *          responses:
 *              202:
 *                  description: "**Accepted** — dislike added successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      $ref: '#/components/schemas/Like'
 *              400:
 *                  description: "**Bad Request** — if any required path parameter is missing or invalid"
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
 *                  description: "**Not Found** — if the user or game doesn't exist, or if the user hasn't reviewed this game"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.post("/dislikes", auth, LikeController.addDislike);

// ===================== BOTH =====================

/**
 * @swagger
 *  /reviews/{reviewer}/{reviewed}/reaction:
 *      delete:
 *          tags: [Reactions]
 *          summary: Removes the current user's reaction from a review
 *          description: Removes the current user's like or dislike from a review
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: path
 *                name: reviewer
 *                required: true
 *                schema:
 *                  type: string
 *              - in: path
 *                name: reviewed
 *                required: true
 *                schema:
 *                  type: integer
 *          responses:
 *              202:
 *                  description: "**Accepted** — reaction removed successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      $ref: '#/components/schemas/Like'
 *              400:
 *                  description: "**Bad Request** — if any required path parameter is missing or invalid"
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
 *                  description: "**Not Found** — if the user or game doesn't exist, the user hasn't reviewed this game, or no reaction exists"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.delete("/reaction", auth, LikeController.removeReactions);

export default router;
