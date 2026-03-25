import { Router } from "express";
import { GameController } from "../controllers/GameController";
import { ReviewController } from "../controllers/ReviewController";
import { auth, optionalAuth } from "../utils/Auth";

// Router object
const router: Router = Router({ mergeParams: true });

// ===================== GAMES =====================

/**
 * swagger
 * /games/id/:gameID:
 *      get:
 *          tags: [Games]
 *          summary: Returns Game IGDB info
 *          description: |
 *              Returns detailed info about a specific game given in the params
 *              Example: `/game/id/248567`
 *          parameters:
 *            - in: path
 *              id: gameID
 *              schema:
 *                  type: number
 *              description: game id of the game to get the info of
 *          responses:
 *              200:
 *                  description: "**OK**"
 *              400:
 *                  description: "**Bad Request** - if given game id is invalid or no game has that id"
 *              500:
 *                  description: "**Internal Server Error** - if the game couldn't be retrieved"
 *
 */
router.get("/id/:gameID", GameController.getGameInfo);

/**
 * swagger
 *  /games/search:
 *      post:
 *          tags: [Games]
 *          summary: Search games
 *          description: |
 *              Search games using both name and/or genres given in body
 *              Example: `body = {name: celeste}`, `body = {genres: [8, 25]}`
 *          requestBody:
 *              required = true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              name:
 *                                  type: string
 *                              genres
 *                                  type: number[]
 *          responses:
 *              200:
 *                  description: "**OK**"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  $ref: '#/components/schemas/Game'
 *              400:
 *                  description: "**Bad Request** - if any of the query parameters are invalid"
 *              500:
 *                  description: "**Internal Server Error** - if the filters couldn't be retrieved"
 */
router.post("/search", GameController.searchGames);

/**
 * swagger
 *  /games/popular:
 *      post:
 *          tags: [Games]
 *          summary: Returns popular games ordered by review count
 *          description: |
 *              Returns popular games ordered review count.
 *          responses:
 *              200:
 *                  description: "**OK**"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  $ref: '#/components/schemas/Game'
 *              500:
 *                  description: "**Internal Server Error** - if the games couldn't be retrieved"
 */
// it's now a POST so this documentation might be wrong
router.post("/popular", GameController.getPopularGames);

/**
 * @swagger
 *  /games/recent:
 *      get:
 *          tags: [Games]
 *          summary: Returns recently added games
 *          description: |
 *              Returns recently added games.
 *          responses:
 *              200:
 *                  description: "**OK**"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  $ref: '#/components/schemas/Game'
 *              500:
 *                  description: "**Internal Server Error** - if the games couldn't be retrieved"
 */
router.post("/recent", GameController.getRecentGames);

/**
 * @swagger
 *  /games/recent:
 *      get:
 *          tags: [Games]
 *          summary: Returns recommended games games
 *          description: |
 *              Returns recommended games games.
 *          responses:
 *              200:
 *                  description: "**OK**"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  $ref: '#/components/schemas/Game'
 *              500:
 *                  description: "**Internal Server Error** - if the games couldn't be retrieved"
 */
router.post("/recommended", auth, GameController.getRecommendedGames);

// ===================== GAME REVIEWS =====================

/**
 * @swagger
 *  /games/id/{gameID}/reviews:
 *      get:
 *          tags: [Reviews]
 *          summary: Gets the reviews of a game
 *          description: |
 *              Gets the reviews of a game.
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
 *                              type: array
 *                              items:
 *                                  $ref: '#/components/schemas/Review'
 *              404:
 *                  description: "**Not Found** - if the provided game doesn't exist"
 *              500:
 *                  description: "**Internal Server Error** - if the reviews couldn't be retrieved"
 */
router.get("/id/:gameID/reviews", optionalAuth, ReviewController.getReviewsByGame);

/**
 * @swagger
 *  /games/id/{gameID}/reviews:
 *      post:
 *          tags: [Reviews]
 *          summary: Publishes a new review
 *          description: |
 *              Publishes a new review.
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
 *                  description: "**Created**"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Review'
 *              400:
 *                  description: "**Bad Request** - if any of the required fields are missing, or if the score is not a number or not in [0, 10]"
 *              404:
 *                  description: "**Not Found** - if the provided user or game doesn't exist"
 *              409:
 *                  description: "**Conflict** - if the user already reviewed the game"
 *              500:
 *                  description: "**Internal Server Error** - if the review couldn't be published"
 */
router.post("/id/:gameID/reviews", auth, ReviewController.publishReview);

/**
 * @swagger
 *  /games/id/{gameID}/reviews:
 *      put:
 *          tags: [Reviews]
 *          summary: Updates a user's review
 *          description: |
 *              Updates a user's review.
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
 *              202:
 *                  description: "**Accepted**"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Review'
 *              400:
 *                  description: "**Bad Request** - if the gameID is invalid, or if the score is not a number or not in [0, 10]"
 *              404:
 *                  description: "**Not Found** - if the provided user or game doesn't exist, or if the user didn't review the game"
 *              500:
 *                  description: "**Internal Server Error** - if the review couldn't be updated"
 */
router.put("/id/:gameID/reviews", auth, ReviewController.alterReview);

/**
 * @swagger
 *  /games/id/{gameID}/reviews:
 *      delete:
 *          tags: [Reviews]
 *          summary: Removes a user's review
 *          description: |
 *              Removes a user's review.
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
 *                  description: "**Accepted**"
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Review'
 *              400:
 *                  description: "**Bad Request** - if the gameID is invalid"
 *              404:
 *                  description: "**Not Found** - if the provided user or game doesn't exist, or if the user didn't review the game"
 *              500:
 *                  description: "**Internal Server Error** - if the review couldn't be removed"
 */
router.delete("/id/:gameID/reviews", auth, ReviewController.removeReview);

// ===================== FIND GAME =====================

/**
 * @swagger
 *  /games/id/{gameID}:
 *      get:
 *          tags: [Games]
 *          summary: Finds a game by ID
 *          description: |
 *              Finds a game by ID.
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
 *                              $ref: '#/components/schemas/Game'
 *              400:
 *                  description: "**Bad Request** - if the gameID is invalid"
 *              404:
 *                  description: "**Not Found** - if the provided game doesn't exist"
 */
// router.get("/:gameID", GameController.getGameById);
// use this documentation as a base for the new /id/gameID and delete this route

export default router;
