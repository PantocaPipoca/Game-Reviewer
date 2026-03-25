import { Router } from "express";
import { LikeController } from "../controllers/LikeController";
import { auth } from "../utils/Auth";

const router: Router = Router({ mergeParams: true });

// ===================== LIKES =====================

/**
 * @swagger
 *  /reviews/{reviewer}/on/{reviewed}/likes:
 *      get:
 *          tags: [Reactions]
 *          summary: Gets the likes of a review
 *          description: |
 *              Gets the likes of a review.
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
 *                  description: "**OK** - number of likes"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: integer
 *              400:
 *                  description: "**Bad Request** - if any of the required fields are missing"
 *              404:
 *                  description: "**Not Found** - if the provided user doesn't exist, if the provided game doesn't exist, or if the user didn't review the game"
 */
router.get("/likes", LikeController.getLikes);

/**
 * @swagger
 *  /reviews/{reviewer}/on/{reviewed}/likes:
 *      post:
 *          tags: [Reactions]
 *          summary: Adds a like to a review
 *          description: |
 *              Adds a like to a review.
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
 *                  description: "**Accepted**"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Like'
 *              400:
 *                  description: "**Bad Request** - if any of the required fields are missing"
 *              401:
 *                  description: "**Unauthorized** - if no account is logged in"
 *              404:
 *                  description: "**Not Found** - if the provided user doesn't exist, if the provided game doesn't exist, or if the user didn't review the game"
 */
router.post("/likes", auth, LikeController.addLike);

// ===================== DISLIKES =====================

/**
 * @swagger
 *  /reviews/{reviewer}/on/{reviewed}/dislikes:
 *      get:
 *          tags: [Reactions]
 *          summary: Gets the dislikes of a review
 *          description: |
 *              Gets the dislikes of a review.
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
 *                  description: "**OK** - number of dislikes"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: integer
 *              400:
 *                  description: "**Bad Request** - if any of the required fields are missing"
 *              404:
 *                  description: "**Not Found** - if the provided user doesn't exist, if the provided game doesn't exist, or if the user didn't review the game"
 */
router.get("/dislikes", LikeController.getDislikes);

/**
 * @swagger
 *  /reviews/{reviewer}/on/{reviewed}/dislikes:
 *      post:
 *          tags: [Reactions]
 *          summary: Adds a dislike to a review
 *          description: |
 *              Adds a dislike to a review.
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
 *                  description: "**Accepted**"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Like'
 *              400:
 *                  description: "**Bad Request** - if any of the required fields are missing"
 *              401:
 *                  description: "**Unauthorized** - if no account is logged in"
 *              404:
 *                  description: "**Not Found** - if the provided user doesn't exist, if the provided game doesn't exist, or if the user didn't review the game"
 */
router.post("/dislikes", auth, LikeController.addDislike);

// ===================== BOTH =====================

/**
 * @swagger
 *  /reviews/{reviewer}/on/{reviewed}/reacts:
 *      delete:
 *          tags: [Reactions]
 *          summary: Deletes likes and dislikes to a review
 *          description: |
 *              Deletes likes and dislikes to a review.
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
 *                  description: "**Accepted**"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Like'
 *              400:
 *                  description: "**Bad Request** - if any of the required fields are missing"
 *              401:
 *                  description: "**Unauthorized** - if no account is logged in"
 *              404:
 *                  description: "**Not Found** - if the provided user doesn't exist, if the provided game doesn't exist, or if the user didn't review the game"
 */
router.delete("/reacts", auth, LikeController.removeReactions);

export default router;
