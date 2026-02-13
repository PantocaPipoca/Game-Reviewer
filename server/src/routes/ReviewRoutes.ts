import {Router} from "express";
import {ReviewController} from "../controllers/ReviewController";

// Router object
const router: Router = Router();

/**
 * POST /api/newrev
 * Publishes a new review
 * Body:
 *      reviewer: string
 *      reviewed: string
 *      text: string
 *      score: int4
 * Response:
 *      201 CREATED
 *      {reviewer, reviewed, text, score, createdAt, updatedAt}
 *      400 BAD REQUEST, if any of the required fields is missing
 *      400 BAD REQUEST, if the score is not a number or not in [0, 10]
 *      404 NOT FOUND, if the provided user name doesn't exist
 *      404 NOT FOUND, if the provided game name doesn't exist
 *      409 CONFLICT, if the user already reviewed the game
 *      500 INTERNAL SERVER ERROR, if the review couldn't be publised
 */
router.post('/:reviewer/:reviewed', ReviewController.PublishReview);

/**
 * GET /api/viewrev
 * Finds a user's review on a game
 * Body:
 *      reviewer: string
 *      reviewed: string
 * Response:
 *      200 OK
 *      {reviewer, reviewed, text, score, createdAt, updatedAt}
 *      400 BAD REQUEST, if any of the required fields is missing
 *      404 NOT FOUND, if the provided user name doesn't exist
 *      404 NOT FOUND, if the provided game name doesn't exist
 *      404 NOT FOUND, if the user didn't review the game
 */
router.get('/:reviewer/:reviewed', ReviewController.FindReview);

/**
 * PUT /api/updrev
 * Updates a user's review
 * Body:
 *      reviewer: string
 *      reviewed: string
 *      text: string
 *      score: int4
 * Response:
 *      202 ACCEPTED
 *      {reviewer, reviewed, text, score, createdAt, updatedAt}
 *      400 BAD REQUEST, if either reviewer or reviewed fields are missing
 *      400 BAD REQUEST, if the score is not a number or not in [0, 10]
 *      404 NOT FOUND, if the provided user name doesn't exist
 *      404 NOT FOUND, if the provided game name doesn't exist
 *      404 NOT FOUND, if the user didn't review the game
 *      500 INTERNAL SERVER ERROR, if the review couldn't be updated
 */
router.put('/:reviewer/:reviewed', ReviewController.AlterReview);

/**
 * DELETE /api/remrev
 * Removes a user's review
 * Body:
 *      reviewer: string
 *      reviewed: string
 * Response:
 *      202 ACCEPTED
 *      {reviewer, reviewed, text, score, createdAt, updatedAt}
 *      400 BAD REQUEST, if either reviewer or reviewed fields are missing
 *      404 NOT FOUND, if the provided user name doesn't exist
 *      404 NOT FOUND, if the provided game name doesn't exist
 *      404 NOT FOUND, if the user didn't review the game
 *      500 INTERNAL SERVER ERROR, if the review couldn't be removed
 */
router.delete('/:reviewer/:reviewed', ReviewController.RemoveReview);


// ===================== COMMENTS =====================

router.get('/:reviewer/:reviewed/comments', ReviewController.GetComments);

router.post('/:reviewer/:reviewed/comments', ReviewController.AddComment);

router.put('/:reviewer/:reviewed/comments', ReviewController.EditComment);

router.delete('/:reviewer/:reviewed/comments', ReviewController.RemoveComment);


// ===================== LIKES =====================

router.get('/:reviewer/:reviewed/likes', ReviewController.GetLikes);

router.post('/:reviewer/:reviewed/likes', ReviewController.AddLike);

router.delete('/:reviewer/:reviewed/likes', ReviewController.RemoveLike);

// ===================== DISLIKES =====================

router.get('/:reviewer/:reviewed/dislikes', ReviewController.GetDislikes);

router.post('/:reviewer/:reviewed/dislikes', ReviewController.AddDislike);

router.delete('/:reviewer/:reviewed/dislikes', ReviewController.RemoveDislike);

export default router;
