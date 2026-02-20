import {Router} from "express"
import {FollowerController} from "../controllers/FollowerController"
import { auth, optionalAuth } from "../utils/auth";

const router: Router = Router()


// Get Following is in AccountRoutes since it has a different endpoint

/**
 * POST /api/users/:username/followers/:followerName
 * Makes a follower request to an account
 * Body:
 *      (empty body)
 * Response:
 *      201 CREATED
 *      {follows, followed, createdAt}
 *      400 BAD REQUEST, if any of the required fields is missing
 *      404 NOT FOUND, if any of the provided user names don't exist
 *      409 CONFLICT, if the first user already requested to follow the second
 *      500 INTERNAL SERVER ERROR, if the request couldn't be made
 */
router.post('/:followerName', auth, FollowerController.RequestFollower);

/**
 * PUT /api/users/:username/followers/:followerName
 * Accepts a follower request to an account
 * Body:
 *      (empty body)
 * Response:
 *      202 ACCEPTED
 *      {follows, followed, createdAt, acceptedAt}
 *      400 BAD REQUEST, if any of the required fields is missing
 *      404 NOT FOUND, if any of the provided user names don't exist
 *      409 CONFLICT, if the first user didn't request to follow the second
 *      409 CONFLICT, if the second user already accepted the request
 *      500 INTERNAL SERVER ERROR, if the request couldn't be accepted
 */
router.put('/:followerName', auth, FollowerController.AcceptFollower);

/**
 * DELETE /api/users/:username/followers/:followerName
 * Removes a follower to an account
 * Body:
 *      (empty body)
 * Response:
 *      202 ACCEPTED
 *      {follows, followed}
 *      400 BAD REQUEST, if any of the required fields is missing
 *      404 NOT FOUND, if any of the provided user names don't exist
 *      409 CONFLICT, if the first user name doesn't follow the second yet
 *      500 INTERNAL SERVER ERROR, if the follower couldn't be removed
 */
router.delete('/:followerName', auth, FollowerController.RemoveFollower);

/**
 * GET /api/users/:username/followers
 * Gets the followers of an account
 * Body:
 *      (empty body)
 * Response:
 *      200 OK
 *      [{follows, followed}]
 *      404 NOT FOUND, if the provided user name doesn't exist
 *      500 INTERNAL SERVER ERROR, if the followers couldn't be retrieved
 */
router.get('/', optionalAuth, FollowerController.GetFollowers);

/**
 * GET /api/users/:username/followers/pending
 * Gets the users followed by a user, if it's private only returns followed users if the current user follows it
 * Body:
 *      (empty body)
 * Response:
 *      200 OK
 *      [{follows, followed}]
 *      404 NOT FOUND, if the provided user name doesn't exist
 *      500 INTERNAL SERVER ERROR, if the followers couldn't be retrieved
 */
router.get('/pending', optionalAuth, FollowerController.GetPendingRequests);

export default router;