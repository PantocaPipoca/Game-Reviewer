import {Router} from "express"
import { ReviewController } from "../controllers/ReviewController";
import { optionalAuth, auth } from "../utils/auth";

const router: Router = Router();

/**
 * GET /api/reviews/:reviewer/:reviewed/comments
 * Gets the comments of a review
 * (Empty body)
 * Response: TODO
 */
router.get('/', ReviewController.GetComments);

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
router.post('/', ReviewController.AddComment);

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
router.put('/', ReviewController.EditComment);
 
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
router.delete('/', ReviewController.RemoveComment);

export default router;