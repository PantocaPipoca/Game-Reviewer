import {Router} from "express"
import { ReviewController } from "../controllers/ReviewController";
import { optionalAuth, auth } from "../utils/auth";

const router: Router = Router();

// ===================== LIKES =====================

/**
 * GET /api/reviews/:reviewer/:reviewed/likes
 * Gets the likes of a review
 * (Empty body)
 * Response: TODO
 */
router.get('/likes', ReviewController.GetLikes);

/**
 * POST /api/reviews/:reviewer/:reviewed/likes
 * Adds a like to a review
 * Body:
 */
router.post('/likes', ReviewController.AddLike);

/**
 * DELETE /api/reviews/:reviewer/:reviewed/likes
 * Deletes a like to a review
 * Body: 
 */
router.delete('/likes', ReviewController.RemoveLike);


// ===================== DISLIKES =====================

/**
 * GET /api/reviews/:reviewer/:reviewed/dislikes
 * Gets the dislikes of a review
 * (Empty body)
 * Response: TODO
 */
router.get('/dislikes', ReviewController.GetDislikes);

/**
 * POST /api/reviews/:reviewer/:reviewed/dislikes
 * Adds a dislike to a review
 * Body:
 */
router.post('/dislikes', ReviewController.AddDislike);

/**
 * DELETE /api/reviews/:reviewer/:reviewed/dislikes
 * Deletes a dislike to a review
 * Body: 
 */
router.delete('/dislikes', ReviewController.RemoveDislike);

export default router;