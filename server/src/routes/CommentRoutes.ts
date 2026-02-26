import {Router} from "express"
import { CommentController } from "../controllers/CommentController";

const router: Router = Router();

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
router.get('/', CommentController.GetComments);

/**
 * POST /api/reviews/:reviewer/:reviewed/comments
 * Adds a comment to a review
 * Body:
 *      commenter: string
 *      text: string
 * Response:
 *      201 CREATED
 *      {reviewer, reviewed, id, commentator, text, createdAt, updatedAt}
 *      400 BAD REQUEST             if any of the required fields is missing
 *      404 NOT FOUND               if the user didn't review the game
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
 *      {reviewer, reviewed, id, commentator, text, createdAt, updatedAt}
 *      400 BAD REQUEST             if any of the required fields is missing
 *      404 NOT FOUND               if the user didn't review the game
 */
router.put('/', CommentController.EditComment);
 
/**
 * DELETE /api/reviews/:reviewer/:reviewed/comments/:id
 * Deletes a comment to a review
 * Body:
 *      commenter: string
 * Response:
 *      202 ACCEPTED
 *      {reviewer, reviewed, id, commentator, text, createdAt, updatedAt}
 *      400 BAD REQUEST             if any of the required fields is missing
 *      404 NOT FOUND               if the user didn't review the game
 */
router.delete('/', CommentController.RemoveComment);

export default router;