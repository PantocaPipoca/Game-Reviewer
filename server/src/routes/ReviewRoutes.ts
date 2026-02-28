import {Router} from "express";
import {ReviewController} from "../controllers/ReviewController";
import CommentRoutes from "./CommentRoutes";
import LikeRoutes from "./LikeRoutes";
import { auth, optionalAuth } from "../utils/auth";

// Router object
const router: Router = Router();


// COMMENTS 
router.use('/:reviewer/:reviewed/comments', CommentRoutes);

// REACTIONS (LIKES/DISLIKES)
router.use('/:reviewer/:reviewed/', LikeRoutes);

// ===================== GET REVIEW =====================

/**
 * GET /api/reviews/:reviewer/:reviewed
 * Finds a user's review on a game
 * (Empty body)
 * Response:
 *      200 OK
 *      {reviewer, reviewed, text, score, createdAt, updatedAt}
 *      400 BAD REQUEST     if any of the required fields is missing
 *      404 NOT FOUND       if the provided user name doesn't exist
 *      404 NOT FOUND       if the provided game name doesn't exist
 *      404 NOT FOUND       if the user didn't review the game
 */
router.get('/:reviewer/:reviewed/', optionalAuth, ReviewController.GetReview);


export default router;
