import {Router} from "express"
import {FollowerController} from "../controllers/FollowerController"

// Router object
const router: Router = Router()

/**
 * GET /api/users/:accountName/followers
 * Gets the followers of an account
 * (Empty body)
 * Response:
 *      200 OK
 *      [{follows, followed}]
 *      404 NOT FOUND, if the provided user name doesn't exist
 *      500 INTERNAL SERVER ERROR, if the followers couldn't be retrieved
 */
router.get('/', FollowerController.GetFollowers);


/**
 * POST /api/users/:accountName/followers
 * Makes a follower request to an account
 * Body:
 *      follows: string
 *      followed: string
 * Response:
 *      201 CREATED
 *      {follows, followed, createdAt}
 *      400 BAD REQUEST, if any of the required fields is missing
 *      404 NOT FOUND, if any of the provided user names don't exist
 *      409 CONFLICT, if the first user already requested to follow the second
 *      500 INTERNAL SERVER ERROR, if the request couldn't be made
 */
router.post('/', FollowerController.RequestFollower);

/**
 * PUT /api/users/:accountName/followers/:followerName
 * Accepts a follower request to an account
 * Body:
 *      follows: string
 *      followed: string
 * Response:
 *      202 ACCEPTED
 *      {follows, followed, createdAt, acceptedAt}
 *      400 BAD REQUEST, if any of the required fields is missing
 *      404 NOT FOUND, if any of the provided user names don't exist
 *      409 CONFLICT, if the first user didn't request to follow the second
 *      409 CONFLICT, if the second user already accepted the request
 *      500 INTERNAL SERVER ERROR, if the request couldn't be accepted
 */
router.put('/:followerName', FollowerController.AcceptFollower);

/**
 * DELETE /api/users/:accountName/followers/:followerName
 * Removes a follower to an account
 * Body:
 *      follows: string
 *      followed: string
 * Response:
 *      202 ACCEPTED
 *      {follows, followed}
 *      400 BAD REQUEST, if any of the required fields is missing
 *      404 NOT FOUND, if any of the provided user names don't exist
 *      409 CONFLICT, if the first user name doesn't follow the second yet
 *      500 INTERNAL SERVER ERROR, if the follower couldn't be removed
 */
router.delete('/:followerName', FollowerController.RemoveFollower);

export default router;
