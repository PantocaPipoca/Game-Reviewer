import {Router} from "express"
import {FollowerController} from "../controllers/FollowerController"
import { auth, optionalAuth } from "../utils/auth";

const router: Router = Router()


// ===================== GET FOLLOWERS =====================

/**
 * GET /api/users/:username/followers
 * Gets the followers of an account
 * (Empty body)
 * Response:
 *      200 OK
 *      [{follows, followed, accepted, createdAt, updatedAt}]
 *      400 BAD REQUEST             if no user name was provided
 *      404 NOT FOUND               if the provided user name doesn't exist
 *      500 INTERNAL SERVER ERROR   if the followers couldn't be retrieved
 */
router.get('/', optionalAuth, FollowerController.GetFollowers);


// ===================== FOLLOW RELATION =====================

/**
 * POST /api/users/:username/followers/
 * Makes a follower request to user ":username"
 * (Empty body)
 * Response:
 *      201 CREATED
 *      {follows, followed, accepted, createdAt, updatedAt}
 *      400 BAD REQUEST             if either user name or followerName are missing
 *      403 FORBIDDEN               if no account is logged in
 *      404 NOT FOUND               if any of the provided user names don't exist
 *      409 CONFLICT                if the first user already requested to follow the second
 *      500 INTERNAL SERVER ERROR   if the request couldn't be made
 */
router.post('/', auth, FollowerController.RequestFollower);

/**
 * DELETE /api/users/:username/followers/
 * Unfollows/cancels request to :username user ":username"
 * (Empty body)
 * Response:
 *      202 ACCEPTED
 *      {follows, followed, accepted, createdAt, updatedAt}
 *      400 BAD REQUEST             if either user name or followerName are missing
 *      403 FORBIDDEN               if no account is logged in
 *      404 NOT FOUND               if any of the provided user names don't exist
 *      404 NOT FOUND               if the first user name doesn't follow the second yet
 *      500 INTERNAL SERVER ERROR   if the follower couldn't be removed
 */
router.delete('/', auth, FollowerController.UnfollowUser);




export default router;