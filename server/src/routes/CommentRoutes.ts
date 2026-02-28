import {Router} from "express"
import { CommentController } from "../controllers/CommentController";
import { auth, optionalAuth } from "../utils/auth";

const router: Router = Router();

// ===================== MANAGE COMMENTS =====================

/**
 * GET /api/reviews/:reviewer/:reviewed/comments
 * Gets the comments of a review
 * (Empty body)
 * Response:
 *      200 OK
 *      [{reviewer, reviewed, id, commentator, text, createdAt, updatedAt}]
 *      400 BAD REQUEST             if any of the required fields is missing
 *      404 NOT FOUND               if the user didn't review the game
 */
router.get('/', optionalAuth, CommentController.GetComments);

/**
 * POST /api/reviews/:reviewer/:reviewed/comments
 * Adds a comment to a review
 * Body:
 *      text: string
 * Response:
 *      201 CREATED
 *      {reviewer, reviewed, id, commentator, text, createdAt, updatedAt}
 *      400 BAD REQUEST             if any of the required fields is missing
 *      404 NOT FOUND               if the user didn't review the game
 */
router.post('/', auth, CommentController.AddComment);

// ===================== COMMENTS BY ID =====================

/**
 * PUT /api/reviews/:reviewer/:reviewed/comments/:id
 * Edits a comment to a review
 * Body:
 *      text: string
 * Response:
 *      202 ACCEPTED
 *      {reviewer, reviewed, id, commentator, text, createdAt, updatedAt}
 *      400 BAD REQUEST             if any of the required fields is missing
 *      404 NOT FOUND               if the user didn't review the game
 */
router.put('/:id', auth, CommentController.EditComment);
 
/**
 * DELETE /api/reviews/:reviewer/:reviewed/comments/:id
 * Deletes a comment to a review
 * Body:
 *      (Empty body)
 * Response:
 *      202 ACCEPTED
 *      {reviewer, reviewed, id, commentator, text, createdAt, updatedAt}
 *      400 BAD REQUEST             if any of the required fields is missing
 *      404 NOT FOUND               if the user didn't review the game
 */
router.delete('/:id', auth, CommentController.RemoveComment);

export default router;