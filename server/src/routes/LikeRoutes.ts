import {Router} from "express"
import { LikeController } from "../controllers/LikeController";
import { optionalAuth, auth } from "../utils/auth";


const router: Router = Router();


// ===================== LIKES =====================

/**
 * GET /api/reviews/:reviewer/:reviewed/likes
 * Gets the likes of a review
 * (Empty body)
 * Response: TODO
 */
router.get('/likes', LikeController.GetLikes);

/**
 * POST /api/reviews/:reviewer/:reviewed/likes
 * Adds a like to a review
 * Body:
 */
router.post('/likes', LikeController.AddLike);

/**
 * DELETE /api/reviews/:reviewer/:reviewed/likes
 * Deletes a like to a review
 * Body: 
 */
router.delete('/likes', LikeController.RemoveLike);


// ===================== DISLIKES =====================

/**
 * GET /api/reviews/:reviewer/:reviewed/dislikes
 * Gets the dislikes of a review
 * (Empty body)
 * Response: TODO
 */
router.get('/dislikes', LikeController.GetDislikes);

/**
 * POST /api/reviews/:reviewer/:reviewed/dislikes
 * Adds a dislike to a review
 * Body:
 */
router.post('/dislikes', LikeController.AddDislike);

/**
 * DELETE /api/reviews/:reviewer/:reviewed/dislikes
 * Deletes a dislike to a review
 * Body: 
 */
router.delete('/dislikes', LikeController.RemoveDislike);


export default router;