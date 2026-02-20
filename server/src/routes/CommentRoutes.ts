import {Router} from "express"
import { CommentController } from "../controllers/CommentController";

const router: Router = Router();

/**
 * GET /api/reviews/:reviewer/:reviewed/comments
 * Gets the comments of a review
 * Body:
 *      (empty body)
 * Response: TODO
 */
router.get('/', CommentController.GetComments);

/**
 * POST /api/reviews/:reviewer/:reviewed/comments
 * Adds a comment to a review
 * Body:
 *      commenter: string
 *      text: string
 * Response:
 *      201 CREATED
 */
router.post('/', CommentController.AddComment);

/**
 * PUT /api/reviews/:reviewer/:reviewed/comments/:id
 * Edits a comment to a review
 * Body:
 *      commenter: string
 *      text: string
 * Response:
 *      202 ACCEPTED
 */
router.put('/', CommentController.EditComment);
 
/**
 * DELETE /api/reviews/:reviewer/:reviewed/comments/:id
 * Deletes a comment to a review
 * Body:
 *      commenter: string
 * Response:
 *      202 ACCEPTED
 */
router.delete('/', CommentController.RemoveComment);

export default router;