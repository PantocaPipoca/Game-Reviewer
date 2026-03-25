import { Router } from "express";
import { ReviewController } from "../controllers/ReviewController";
import CommentRoutes from "./CommentRoutes";
import LikeRoutes from "./LikeRoutes";
import { auth, optionalAuth } from "../utils/Auth";

// Router object
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
 *              Finds a user's review on a game.
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
 *                  description: "**OK**"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Review'
 *              400:
 *                  description: "**Bad Request** - if any of the required fields are missing"
 *              404:
 *                  description: "**Not Found** - if the provided user or game doesn't exist, or if the user didn't review the game"
 */
router.get("/:reviewer/on/:reviewed/", optionalAuth, ReviewController.getReview);

export default router;
