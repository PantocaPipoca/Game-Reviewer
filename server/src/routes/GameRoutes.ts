import { Router } from "express";
import { GameController } from "../controllers/GameController";
import { ReviewController } from "../controllers/ReviewController";
import { auth, optionalAuth } from "../utils/Auth";

const router: Router = Router({ mergeParams: true });

// ===================== GAMES =====================

/**
 * @swagger
 * /games/id/{gameID}:
 *      get:
 *          tags: [Games]
 *          summary: Returns Game IGDB info
 *          description: Returns detailed info about a specific game given in the params
 *          parameters:
 *              - in: path
 *                name: gameID
 *                required: true
 *                schema:
 *                  type: integer
 *          responses:
 *              200:
 *                  description: "**OK**"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      $ref: '#/components/schemas/Game'
 *              400:
 *                  description: "**Bad Request** - if any required path parameter is missing or invalid"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              404:
 *                  description: "**Not Found** - if there is no Game associated with the given ID"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.get("/id/:gameID", GameController.getGameInfo);

/**
 * @swagger
 *  /games/search:
 *      post:
 *          tags: [Games]
 *          summary: Search games
 *          description: |
 *              Search games using both name and/or genres given in body
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required: [offset, amount]
 *                          properties:
 *                              offset:
 *                                  type: number
 *                                  minimum: 0
 *                              amount:
 *                                  type: number
 *                                  minimum: 1
 *                              name:
 *                                  type: string
 *                              genres:
 *                                  type: array
 *                                  items: {
 *                                      type: integer
 *                                  }
 *          responses:
 *              200:
 *                  description: "**OK**"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      type: array
 *                                      items:
 *                                          $ref: '#/components/schemas/GameCover'
 *              400:
 *                  description: "**Bad Request** - if any of the query parameters are invalid"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.post("/search", GameController.searchGames);

/**
 * @swagger
 *  /games/popular:
 *      post:
 *          tags: [Games]
 *          summary: Returns popular games ordered by review count
 *          description: |
 *              Returns popular games ordered by review count.
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required: [offset, amount]
 *                          properties:
 *                              offset:
 *                                  type: number
 *                                  minimum: 0
 *                              amount:
 *                                  type: number
 *                                  minimum: 1
 *          responses:
 *              200:
 *                  description: "**OK**"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      type: array
 *                                      items:
 *                                          $ref: '#/components/schemas/GameCover'
 *              400:
 *                  description: "**Bad Request** - if any of the query parameters are invalid"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.post("/popular", GameController.getPopularGames);

/**
 * @swagger
 *  /games/recent:
 *      post:
 *          tags: [Games]
 *          summary: Return recent games
 *          description: |
 *              Returns the most recently released games.
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required: [offset, amount]
 *                          properties:
 *                              offset:
 *                                  type: number
 *                                  minimum: 0
 *                              amount:
 *                                  type: number
 *                                  minimum: 1
 *          responses:
 *              200:
 *                  description: "**OK**"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      type: array
 *                                      items:
 *                                          $ref: '#/components/schemas/GameCover'
 *              400:
 *                  description: "**Bad Request** - if any of the query parameters are invalid"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.post("/recent", GameController.getRecentGames);

/**
 * @swagger
 *  /games/recommended:
 *      post:
 *          tags: [Games]
 *          summary: Return recomended games
 *          description: |
 *              Returns games based on the genres of liked games.
 *              security:
 *                  - bearerAuth: []
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required: [offset, amount]
 *                          properties:
 *                              offset:
 *                                  type: number
 *                                  minimum: 0
 *                              amount:
 *                                  type: number
 *                                  minimum: 1
 *          responses:
 *              200:
 *                  description: "**OK**"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      type: array
 *                                      items:
 *                                          $ref: '#/components/schemas/GameCover'
 *              400:
 *                  description: "**Bad Request** - if any of the query parameters are invalid"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              401:
 *                  description: "**Unauthorized** — if no account is logged in"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.post("/recommended", auth, GameController.getRecommendedGames);

// ===================== GAME REVIEWS =====================

/**
 * @swagger
 *  /games/id/{gameID}/reviews:
 *      get:
 *          tags: [Reviews]
 *          summary: Gets the reviews of a game
 *          description: Gets the reviews of a game. Reviews from private accounts are only included if the current user follows them.
 *          parameters:
 *              - in: path
 *                name: gameID
 *                required: true
 *                schema:
 *                  type: integer
 *          responses:
 *              200:
 *                  description: "**OK** - reviews retrieved successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      type: array
 *                                      items:
 *                                          $ref: '#/components/schemas/Review'
 *              400:
 *                  description: "**Bad Request** - if the gameID is invalid"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              404:
 *                  description: "**Not Found** - if the provided game doesn't exist"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              500:
 *                  description: "**Internal Server Error** - if the reviews couldn't be retrieved"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.get("/id/:gameID/reviews", optionalAuth, ReviewController.getReviewsByGame);

/**
 * @swagger
 *  /games/id/{gameID}/reviews:
 *      post:
 *          tags: [Reviews]
 *          summary: Publishes a new review for a game
 *          description: Publishes a new review for a game
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: path
 *                name: gameID
 *                required: true
 *                schema:
 *                  type: integer
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required: [text, score]
 *                          properties:
 *                              text:
 *                                  type: string
 *                              score:
 *                                  type: integer
 *                                  minimum: 0
 *                                  maximum: 10
 *          responses:
 *              201:
 *                  description: "**Created** - review published successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      $ref: '#/components/schemas/Review'
 *              400:
 *                  description: "**Bad Request** - if any of the required fields are missing, or if the score is not a number or not in [0, 10]"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              401:
 *                  description: "**Unauthorized** — if no account is logged in"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              404:
 *                  description: "**Not Found** - if the provided user or game doesn't exist"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              409:
 *                  description: "**Conflict** - if the user already reviewed the game"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              500:
 *                  description: "**Internal Server Error** - if the review couldn't be published"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.post("/id/:gameID/reviews", auth, ReviewController.publishReview);

/**
 * @swagger
 *  /games/id/{gameID}/reviews:
 *      put:
 *          tags: [Reviews]
 *          summary: Updates the current user's review for a game
 *          description: Updates the current user's review for a game. Both fields are optional — omitted fields keep their existing values.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: path
 *                name: gameID
 *                required: true
 *                schema:
 *                  type: integer
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required: [score]
 *                          properties:
 *                              text:
 *                                  type: string
 *                              score:
 *                                  type: integer
 *                                  minimum: 0
 *                                  maximum: 10
 *          responses:
 *              202:
 *                  description: "**Accepted** — review updated successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      $ref: '#/components/schemas/Review'
 *              400:
 *                  description: "**Bad Request** — if the gameID is invalid, or if score is not in [0, 10]"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              401:
 *                  description: "**Unauthorized** — if no account is logged in"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              404:
 *                  description: "**Not Found** — if the user or game doesn't exist, or if the user hasn't reviewed this game"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              500:
 *                  description: "**Internal Server Error** — if the review couldn't be updated"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.put("/id/:gameID/reviews", auth, ReviewController.alterReview);

/**
 * @swagger
 *  /games/id/{gameID}/reviews:
 *      delete:
 *          tags: [Reviews]
 *          summary: Removes the current user's review for a game
 *          description: Removes the current user's review for a game
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: path
 *                name: gameID
 *                required: true
 *                schema:
 *                  type: integer
 *          responses:
 *              202:
 *                  description: "**Accepted** - review removed successfully"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  status:
 *                                      type: string
 *                                      example: success
 *                                  data:
 *                                      $ref: '#/components/schemas/Review'
 *              400:
 *                  description: "**Bad Request** - if the gameID is invalid"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              401:
 *                  description: "**Unauthorized** — if no account is logged in"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              404:
 *                  description: "**Not Found** - if the provided user or game doesn't exist, or if the user didn't review the game"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *              500:
 *                  description: "**Internal Server Error** - if the review couldn't be removed"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 */
router.delete("/id/:gameID/reviews", auth, ReviewController.removeReview);

export default router;
