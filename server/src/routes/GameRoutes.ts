import {Router} from "express";
import {GameController} from "../controllers/GameController";
import { ReviewController } from "../controllers/ReviewController";
import { auth } from "../utils/auth";

// Router object
const router: Router = Router();


// ===================== FIND GAMES =====================

/**
 * GET /api/games
 * Search games using query params
 * Example:
 *      /games?name=elden
 *      /games?tag=rpg
 *      /games?name=elden&tag=rpg
 * (Empty body)
 * Response:
 *      200 OK
 *      [{gameID, gameName, metadata}]
 *      400 BAD REQUEST             if any of the query parameters is invalid
 *      500 INTERNAL SERVER ERROR   if the filters couldn't be retrieved
 */
router.get('/', GameController.SearchGames);

/**
 * GET /api/games/popular
 * Returns popular games ordered by score or review count
 * (Empty body)
 * Response:
 *      200 OK
 *      [{gameName, metadata}]
 *      500 INTERNAL SERVER ERROR   if the games couldn't be retrieved
 */
router.get('/popular', GameController.GetPopularGames);


// ===================== GAME REVIEWS =====================

/**
 * GET /api/games/:gameID/reviews
 * Gets the reviews of a game
 * (Empty body)
 * Response:
 *      200 OK
 *      [{reviewer, reviewed, text, score, createdAt, updatedAt}]
 *      404 NOT FOUND               if the provided game name doesn't exist
 *      500 INTERNAL SERVER ERROR   if the reviews couldn't be retrieved
 */
router.get('/:gameID/reviews', ReviewController.GetReviewsByGame);

/**
 * POST /api/games/:gameID/reviews
 * Publishes a new review
 * Body:
 *      text: string
 *      score: int4
 * Response:
 *      201 CREATED
 *      {reviewer, reviewed, text, score, createdAt, updatedAt}
 *      400 BAD REQUEST             if any of the required fields is missing
 *      400 BAD REQUEST             if the score is not a number or not in [0, 10]
 *      404 NOT FOUND               if the provided user name doesn't exist
 *      404 NOT FOUND               if the provided game name doesn't exist
 *      409 CONFLICT                if the user already reviewed the game
 *      500 INTERNAL SERVER ERROR   if the review couldn't be publised
 */
router.post('/:gameID/reviews', auth, ReviewController.PublishReview);

/**
 * PUT /api/games/:gameID/reviews
 * Updates a user's review
 * Body:
 *      text: string
 *      score: int4
 * Response:
 *      202 ACCEPTED
 *      {reviewer, reviewed, text, score, createdAt, updatedAt}
 *      400 BAD REQUEST             if either reviewer or reviewed fields are missing
 *      400 BAD REQUEST             if the score is not a number or not in [0, 10]
 *      404 NOT FOUND               if the provided user name doesn't exist
 *      404 NOT FOUND               if the provided game name doesn't exist
 *      404 NOT FOUND               if the user didn't review the game
 *      500 INTERNAL SERVER ERROR   if the review couldn't be updated
 */
router.put('/:gameID/reviews', auth, ReviewController.AlterReview);

/**
 * DELETE /api/games/:gameID/reviews
 * Removes a user's review
 * (Empty body)
 * Response:
 *      202 ACCEPTED
 *      {reviewer, reviewed, text, score, createdAt, updatedAt}
 *      400 BAD REQUEST             if either reviewer or reviewed fields are missing
 *      404 NOT FOUND               if the provided user name doesn't exist
 *      404 NOT FOUND               if the provided game name doesn't exist
 *      404 NOT FOUND               if the user didn't review the game
 *      500 INTERNAL SERVER ERROR   if the review couldn't be removed
 */
router.delete('/:gameID/reviews', auth, ReviewController.RemoveReview);

// ===================== FIND GAME =====================

/**
 * GET /api/games/:gameID
 * Finds a game by ID
 * (Empty body)
 * Response:
 *      200 OK
 *      {gameID, gameName, metadata}
 *      400 BAD REQUEST     if gameID field is missing or is invalid
 *      404 NOT FOUND       if the provided game doesn't exist
 */
router.get('/:gameID', GameController.GetGameById);


export default router;
