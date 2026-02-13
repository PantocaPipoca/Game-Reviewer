import {Router} from "express"
import {ReviewController} from "../controllers/ReviewController"

// Router object
const router: Router = Router()

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
router.get('/api/viewrev', ReviewController.FindReview)

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
router.post('/api/newrev', ReviewController.PublishReview)

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
router.put('/api/updrev', ReviewController.AlterReview)

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
router.delete('/api/remrev', ReviewController.RemoveReview)

export default router
