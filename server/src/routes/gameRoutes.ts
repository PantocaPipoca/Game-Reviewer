import {Router} from "express";
import {GameController} from "../controllers/GameController";

// Router object
const router: Router = Router()

/**
 * GET /api/game
 * Finds a game by name
 * Body:
 *      gameName: string
 * Response:
 *      200 OK
 *      {gameName, metadata}
 *      400 BAD REQUEST, if gameName field is missing
 *      404 NOT FOUND, if the provided game doesn't exist
 */
router.get('/api/game', GameController.FindGame)

export default router
