import {Router} from "express"
import { LikeController } from "../controllers/LikeController";
import { auth } from "../utils/auth";


const router: Router = Router();


// ===================== LIKES =====================

/**
 * GET /api/reviews/:reviewer/:reviewed/likes
 * Gets the likes of a review
 * (Empty body)
 * Response:
 *      200 OK
 *      number of likes
 *      400 BAD REQUEST     if any of the required fields is missing
 *      404 NOT FOUND       if the provided user name doesn't exist
 *      404 NOT FOUND       if the provided game name doesn't exist
 *      404 NOT FOUND       if the user didn't review the game
 */
router.get('/likes', LikeController.GetLikes);

/**
 * POST /api/reviews/:reviewer/:reviewed/likes
 * Adds a like to a review
 * (Empty body)
 * Response:
 *      202 ACCEPTED
 *      {reviewer, reviewed, liker, value}
 *      400 BAD REQUEST     if any of the required fields is missing
 *      401 UNAUTHORIZED    if no account is logged in
 *      404 NOT FOUND       if the provided user name doesn't exist
 *      404 NOT FOUND       if the provided game name doesn't exist
 *      404 NOT FOUND       if the user didn't review the game
 */
router.post('/likes', auth, LikeController.AddLike);


// ===================== DISLIKES =====================

/**
 * GET /api/reviews/:reviewer/:reviewed/dislikes
 * Gets the dislikes of a review
 * (Empty body)
 * Response:
 *      200 OK
 *      number of likes
 *      400 BAD REQUEST     if any of the required fields is missing
 *      404 NOT FOUND       if the provided user name doesn't exist
 *      404 NOT FOUND       if the provided game name doesn't exist
 *      404 NOT FOUND       if the user didn't review the game
 */
router.get('/dislikes', LikeController.GetDislikes);

/**
 * POST /api/reviews/:reviewer/:reviewed/dislikes
 * Adds a dislike to a review
 * (Empty body)
 * Response:
 *      202 ACCEPTED
 *      {reviewer, reviewed, liker, value}
 *      400 BAD REQUEST     if any of the required fields is missing
 *      401 UNAUTHORIZED    if no account is logged in
 *      404 NOT FOUND       if the provided user name doesn't exist
 *      404 NOT FOUND       if the provided game name doesn't exist
 *      404 NOT FOUND       if the user didn't review the game
 */
router.post('/dislikes', auth, LikeController.AddDislike);


// ===================== BOTH =====================

/**
 * DELETE /api/reviews/:reviewer/:reviewed/reacts
 * Deletes likes and dislikes to a review
 * (Empty body)
 * Response:
 *      202 ACCEPTED
 *      {reviewer, reviewed, liker, value}
 *      400 BAD REQUEST     if any of the required fields is missing
 *      401 UNAUTHORIZED    if no account is logged in
 *      404 NOT FOUND       if the provided user name doesn't exist
 *      404 NOT FOUND       if the provided game name doesn't exist
 *      404 NOT FOUND       if the user didn't review the game
 */
router.delete('/reacts', auth, LikeController.RemoveReactions);


export default router;