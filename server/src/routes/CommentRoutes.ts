import { Router } from "express";
import { CommentController } from "../controllers/CommentController";
import { auth, optionalAuth } from "../utils/auth";

const router: Router = Router({ mergeParams: true });

// ===================== MANAGE COMMENTS =====================

/**
 * @swagger
 *  /reviews/{reviewer}/{reviewed}/comments:
 *      get:
 *          tags: [Comments]
 *          summary: Gets the comments of a review
 *          description: Gets the comments of a review
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
 *                  description: "**OK** — comments retrieved successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  $ref: '#/components/schemas/Comment'
 *              400:
 *                  description: "**Bad Request** — if any of the required fields is missing"
 *              403:
 *                  description: "**Forbidden** — if the reviewer's account is private and the current user doesn't follow it"
 *              404:
 *                  description: "**Not Found** — if the user didn't review the game"
 */
router.get("/", optionalAuth, CommentController.GetComments);

/**
 * @swagger
 *  /reviews/{reviewer}/{reviewed}/comments:
 *      post:
 *          tags: [Comments]
 *          summary: Adds a comment to a review
 *          description: Adds a comment to a review
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
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required: [text]
 *                          properties:
 *                              text:
 *                                  type: string
 *          responses:
 *              201:
 *                  description: "**Created** — comment added successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Comment'
 *              400:
 *                  description: "**Bad Request** — if any of the required fields is missing"
 *              404:
 *                  description: "**Not Found** — if the user didn't review the game"
 */
router.post("/", auth, CommentController.AddComment);

// ===================== COMMENTS BY ID =====================

/**
 * @swagger
 *  /reviews/{reviewer}/{reviewed}/comments/{id}:
 *      put:
 *          tags: [Comments]
 *          summary: Edits a comment on a review
 *          description: Edits a comment on a review
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
 *              - in: path
 *                name: id
 *                required: true
 *                schema:
 *                  type: string
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required: [text]
 *                          properties:
 *                              text:
 *                                  type: string
 *          responses:
 *              202:
 *                  description: "**Accepted** — comment edited successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Comment'
 *              400:
 *                  description: "**Bad Request** — if any of the required fields is missing"
 *              403:
 *                  description: "**Forbidden** — if the current user is not the comment author"
 *              404:
 *                  description: "**Not Found** — if the comment doesn't exist"
 */
router.put("/:id", auth, CommentController.EditComment);

/**
 * @swagger
 *  /reviews/{reviewer}/{reviewed}/comments/{id}:
 *      delete:
 *          tags: [Comments]
 *          summary: Deletes a comment from a review
 *          description: Deletes a comment from a review
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
 *              - in: path
 *                name: id
 *                required: true
 *                schema:
 *                  type: string
 *          responses:
 *              202:
 *                  description: "**Accepted** — comment deleted successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Comment'
 *              400:
 *                  description: "**Bad Request** — if any of the required fields is missing"
 *              403:
 *                  description: "**Forbidden** — if the current user is not the comment author"
 *              404:
 *                  description: "**Not Found** — if the comment doesn't exist"
 */
router.delete("/:id", auth, CommentController.RemoveComment);

export default router;