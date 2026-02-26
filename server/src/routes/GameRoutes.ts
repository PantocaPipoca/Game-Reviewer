import {Router} from "express";
import {GameController} from "../controllers/GameController";
import { ReviewController } from "../controllers/ReviewController";

// Router object
const router: Router = Router();

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

export default router;
