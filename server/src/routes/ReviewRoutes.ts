import {Router} from "express";
import {ReviewController} from "../controllers/ReviewController";
import CommentRoutes from "./CommentRoutes";
import LikeRoutes from "./LikeRoutes";

// Router object
const router: Router = Router();

/**
 * GET /api/reviews/:reviewer/:reviewed
 * Finds a user's review on a game
 * Body:
 *      (empty body)
 * Response:
 *      200 OK
 *      {reviewer, reviewed, text, score, createdAt, updatedAt}
 *      400 BAD REQUEST, if any of the required fields is missing
 *      404 NOT FOUND, if the provided user name doesn't exist
 *      404 NOT FOUND, if the provided game name doesn't exist
 *      404 NOT FOUND, if the user didn't review the game
 */
router.get('/:reviewer/:reviewed', ReviewController.GetReview);

/**
 * POST /api/reviews/:reviewer/:reviewed
 * Publishes a new review
 * Body:
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
 * PUT /api/reviews/:reviewer/:reviewed
 * Updates a user's review
 * Body:
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
 * DELETE /api/reviews/:reviewer/:reviewed
 * Removes a user's review
 * Body:
 *      (empty body)
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

router.use('/:reviewer/:reviewed/comments', CommentRoutes);


// ===================== REACTIONS (LIKES/DISLIKES) =====================


router.use('/:reviewer/:reviewed/', LikeRoutes);


export default router;
