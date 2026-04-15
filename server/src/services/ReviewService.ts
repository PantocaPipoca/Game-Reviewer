import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/ErrorHandler";
import * as ErrorMessage from "../utils/ErrorMessage";
import { GameFull, GamePK, GameShort, ReviewFull, ReviewShort, UserPK, UserPublic } from "../types/Types";
import { canViewUser, fetchPublicUser } from "./AccountService";
import { GameRepository } from "../Repository/GameRepository";
import { ReviewRepository } from "../Repository/ReviewRepository";
import { IGDB } from "../IGDB/Requests";

// Throws if the game doesn't exist
async function fetchGame(gameID: number): Promise<GameFull> {
    const game: GameFull | null = await GameRepository.selectGame(gameID);
    if (!game) throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.GAME_NOT_FOUND);
    return game;
}

export class ReviewService {
    static async findReview(reviewer: UserPK, reviewed: GamePK, currentUser?: UserPK): Promise<ReviewFull> {
        await fetchGame(reviewed);
        const user: UserPublic = await fetchPublicUser(reviewer);

        // check privacy settings
        const canView: boolean = await canViewUser(user, currentUser);
        if (!canView) throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.UNAUTHORIZED_ACTION);

        const review: ReviewFull | null = await ReviewRepository.selectReview({ reviewer, reviewed });
        if (!review) throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

        return review;
    }

    static async publishReview(
        currentUser: UserPK,
        gameID: GamePK,
        text: string,
        score: number,
        hoursPlayed?: number,
        platforms?: string[]
    ): Promise<ReviewFull> {
        await fetchPublicUser(currentUser);

        if ((await GameRepository.selectGame(gameID)) === null) {
            let IGDBgame: any = await IGDB.getGameByID(gameID);
            if (IGDBgame === null) {
                throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.GAME_NOT_FOUND);
            }
            let dbGame: GameShort = {
                gameID: gameID,
                gameName: IGDBgame.name,
                metadata: { genres: await IGDB.getGenresOfGames([gameID]) }, // TODO: swap this function for ours
            };
            await GameRepository.insertGame(dbGame);
        } else {
            // check if review already exists
            const existing: ReviewFull | null = await ReviewRepository.selectReview({
                reviewer: currentUser,
                reviewed: gameID,
            });
            if (existing) throw new AppError(StatusCodes.CONFLICT, ErrorMessage.REVIEW_ALREADY_EXISTS);
        }

        const reviewData: ReviewShort = {
            reviewer: currentUser,
            reviewed: gameID,
            text,
            score,
            hoursPlayed: hoursPlayed ?? null,
            platforms: platforms ?? [],
        };

        return (await ReviewRepository.insertReview(reviewData)) as ReviewFull;
    }

    static async updateReview(
        currentUser: UserPK,
        gameID: GamePK,
        text?: string,
        score?: number,
        hoursPlayed?: number,
        platforms?: string[]
    ): Promise<ReviewFull> {
        await fetchPublicUser(currentUser);
        await fetchGame(gameID);

        const existing: ReviewFull | null = await ReviewRepository.selectReview({
            reviewer: currentUser,
            reviewed: gameID,
        });
        if (!existing) throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

        const reviewData: ReviewShort = {
            reviewer: currentUser,
            reviewed: gameID,
            text: text ?? existing.text,
            score: score ?? existing.score,
            hoursPlayed: hoursPlayed ?? existing.hoursPlayed,
            platforms: platforms ?? existing.platforms,
        };

        return (await ReviewRepository.updateReview(reviewData)) as ReviewFull;
    }

    static async removeReview(currentUser: UserPK, gameID: GamePK): Promise<ReviewFull> {
        await fetchPublicUser(currentUser);
        await fetchGame(gameID);

        const existing: ReviewFull | null = await ReviewRepository.selectReview({
            reviewer: currentUser,
            reviewed: gameID,
        });
        if (!existing) throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

        return (await ReviewRepository.deleteReview({ reviewer: currentUser, reviewed: gameID })) as ReviewFull;
    }

    static async getReviewsByGame(gameID: GamePK, currentUser?: UserPK): Promise<ReviewFull[]> {
        const game: GameFull | null = await GameRepository.selectGame(gameID);
        if (!game) throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.GAME_NOT_FOUND);

        const reviews: ReviewFull[] = await ReviewRepository.selectAllReviewsOfGame(gameID);

        // filter based on privacy
        const visibleReviews: ReviewFull[] = [];
        for (const review of reviews) {
            const user: UserPublic = await fetchPublicUser(review.reviewer); // This will hurt in performance
            if (await canViewUser(user, currentUser)) {
                visibleReviews.push({
                    reviewer: review.reviewer,
                    reviewed: review.reviewed,
                    text: review.text,
                    score: review.score,
                    hoursPlayed: review.hoursPlayed,
                    platforms: review.platforms,
                    createdAt: review.createdAt,
                    updatedAt: review.updatedAt,
                });
            }
        }

        return visibleReviews as ReviewFull[];
    }

    static async getReviewsByUser(username: UserPK, currentUser?: UserPK): Promise<ReviewFull[]> {
        const user: UserPublic = await fetchPublicUser(username);

        const canView = await canViewUser(user, currentUser);
        if (!canView) throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.UNAUTHORIZED_ACTION);

        return (await ReviewRepository.selectAllReviewsOfUser(username)) as ReviewFull[];
    }

    // TODO Later
    static async getRecentReviews(gameID: GamePK): Promise<void> {}
}
