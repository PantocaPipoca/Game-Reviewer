import { StatusCodes } from "http-status-codes"
import { AppError } from "../utils/ErrorHandler"
import * as ErrorMessage from "../utils/ErrorMessage"
import {ReviewResponse} from "../types/Types"
import { FetchUser, CanViewUser } from "./AccountService"
import { SelectGame } from "../Repository/GameRepository"
import { DeleteReview, InsertReview, SelectAllReviewsOfGame, SelectAllReviewsOfUser, SelectReview, UpdateReview } from "../Repository/ReviewRepository"


// Throws if the user or the game dont exist
async function CheckUserAndGame(username: string, gameID: number): Promise<void> {
    const user = await FetchUser(username);  // throws if not found
    const game = await SelectGame(gameID);
    if (!game)
        throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.GAME_NOT_FOUND);
}


export class ReviewService {
    static async FindReview(reviewer: string, reviewed: number, currentUser?: string): Promise<ReviewResponse> {
        await CheckUserAndGame(reviewer, reviewed);

        const review = await SelectReview({reviewer, reviewed});
        if (!review)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

        // check privacy settings
        const canView: boolean = await CanViewUser(reviewer, currentUser);
        if (!canView)
            throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.UNAUTHORIZED_ACTION);

        return {
            reviewer: review.reviewer,
            reviewed: review.reviewed,
            text: review.text,
            score: review.score,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt
        }
    }

    static async PublishReview(currentUser: string, gameID: number, text: string, score: number): Promise<ReviewResponse> {
        await CheckUserAndGame(currentUser, gameID);

        // Check if review already exists
        const existing = await SelectReview({reviewer: currentUser, reviewed: gameID});
        if (existing)
            throw new AppError(StatusCodes.CONFLICT, ErrorMessage.REVIEW_ALREADY_EXISTS);

        const review = await InsertReview({
            reviewer: currentUser,
            reviewed: gameID,
            text,
            score
        });

        return {
            reviewer: review.reviewer,
            reviewed: review.reviewed,
            text: review.text,
            score: review.score,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt
        };
    }

    static async UpdateReview(currentUser: string, gameID: number, text?: string, score?: number): Promise<ReviewResponse> {
        await CheckUserAndGame(currentUser, gameID);

        const existing = await SelectReview({reviewer: currentUser, reviewed: gameID});
        if (!existing)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND)

        const updated = await UpdateReview({
            reviewer: currentUser,
            reviewed: gameID,
            text: text ?? existing.text,
            score: score ?? existing.score
        });

        return {
            reviewer: updated.reviewer,
            reviewed: updated.reviewed,
            text: updated.text,
            score: updated.score,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt
        };
    }

    static async RemoveReview(currentUser: string, gameID: number): Promise<ReviewResponse> {
        await CheckUserAndGame(currentUser, gameID);

        const existing = await SelectReview({reviewer: currentUser, reviewed: gameID});
        if (!existing)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

        const deleted = await DeleteReview({reviewer: currentUser, reviewed: gameID});

        return {
            reviewer: deleted.reviewer,
            reviewed: deleted.reviewed,
            text: deleted.text,
            score: deleted.score,
            createdAt: deleted.createdAt,
            updatedAt: deleted.updatedAt
        };
    }

    static async GetReviewsByGame(gameID: number, currentUser?: string): Promise<ReviewResponse[]> {
        const game = await SelectGame(gameID)
        if (!game) {
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.GAME_NOT_FOUND)
        }

        const reviews = await SelectAllReviewsOfGame(gameID)

        // Filter based on privacy
        const visibleReviews: ReviewResponse[] = []
        for (const review of reviews) {
            const canView = await CanViewUser(review.reviewer, currentUser)
            if (canView) {
                visibleReviews.push({
                    reviewer: review.reviewer,
                    reviewed: review.reviewed,
                    text: review.text,
                    score: review.score,
                    createdAt: review.createdAt,
                    updatedAt: review.updatedAt
                })
            }
        }

        return visibleReviews
    }

    static async GetReviewsByUser(username: string, currentUser?: string): Promise<ReviewResponse[]> {
        await FetchUser(username);

        const canView = await CanViewUser(username, currentUser);
        if (!canView)
            return [];  // return empty if not authorized to view

        const reviews = await SelectAllReviewsOfUser(username);

        return reviews.map(review => ({
            reviewer: review.reviewer,
            reviewed: review.reviewed,
            text: review.text,
            score: review.score,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt
        }));
    }

    // TODO Later
    static async GetRecentReviews(gameID: number): Promise<void> {
    }
}
