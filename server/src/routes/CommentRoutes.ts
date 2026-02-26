import {Router} from "express"
import { CommentController } from "../controllers/CommentController";
import { optionalAuth, auth } from "../utils/auth";

const router: Router = Router();

/**
 * GET /api/reviews/:reviewer/:reviewed/comments
 * Gets the comments of a review
 * (Empty body)
 * Response: TODO
 */
router.get('/', CommentController.GetComments);

/**
 * POST /api/reviews/:reviewer/:reviewed/comments
 * Adds a comment to a review
 * Body:
 *      reviewer: string
 *      reviewed: string
 *      commenter: string
 *      text: string
 * Response:
 *      201 CREATED
 */
router.post('/', CommentController.AddComment);

/**
 * PUT /api/reviews/:reviewer/:reviewed/comments
 * Edits a comment to a review
 * Body:
 *      reviewer: string
 *      reviewed: string
 *      commenter: string
 *      text: string
 * Response:
 *      202 ACCEPTED
 */
router.put('/', CommentController.EditComment);
 
/**
 * DELETE /api/reviews/:reviewer/:reviewed/comments
 * Deletes a comment to a review
 * Body:
 *      reviewer: string
 *      reviewed: string
 *      commenter: string
 * Response:
 *      202 ACCEPTED
 */
router.delete('/', CommentController.RemoveComment);

export default router;