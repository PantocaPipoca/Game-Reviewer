import { Router } from "express";
import { ReviewController } from "../controllers/ReviewController";
import CommentRoutes from "./CommentRoutes";
import LikeRoutes from "./LikeRoutes";
import { optionalAuth } from "../utils/Auth";

const router: Router = Router({ mergeParams: true });

// COMMENTS
router.use("/:reviewer/on/:reviewed/comments", CommentRoutes);

// REACTIONS (LIKES/DISLIKES)
router.use("/:reviewer/on/:reviewed/", LikeRoutes);

// ===================== GET REVIEW =====================

/**
 * @swagger
 *  /reviews/{reviewer}/on/{reviewed}:
 *      get:
 *          tags: [Reviews]
 *          summary: Finds a user's review on a game
 *          description: |
 *              Finds a user's review on a game, if the reviewer's account is private and the current user doesn't follow it, returns 403.
 *          parameters:
 *              - in: path
 *                name: reviewer
 *                required: true
 *                schema:
 *                  type: string
 *                description: The reviewer's username
 *              - in: path
 *                name: reviewed
 *                required: true
 *                schema:
 *                  type: integer
 *                description: The reviewed game's ID
 *          responses:
 *              200:
 *                  description: "**OK** - review found successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      $ref: '#/components/schemas/Review'
 *              400:
 *                  description: "**Bad Request** - if any required path parameter is missing or invalid"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              403:
 *                  description: "**Forbidden** — if the reviewer's account is private and the current user doesn't follow it"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              404:
 *                  description: "**Not Found** - if the user or game doesn't exist, or if the user hasn't reviewed this game"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.get("/:reviewer/on/:reviewed/", optionalAuth, ReviewController.getReview);

export default router;