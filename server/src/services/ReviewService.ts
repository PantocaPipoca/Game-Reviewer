import { StatusCodes } from "http-status-codes"
import { AppError } from "../utils/ErrorHandler"
import * as ErrorMessage from "../utils/ErrorMessage"
import {GameFull, GamePK, ReviewFull, UserPK, UserPublic} from "../types/Types"
import { FetchFullUser, CanViewUser, FetchUser } from "./AccountService"
import { SelectGame } from "../Repository/GameRepository"
import { DeleteReview, InsertReview, SelectAllReviewsOfGame, SelectAllReviewsOfUser, SelectReview, UpdateReview } from "../Repository/ReviewRepository"


// Throws if the user or the game dont exist
async function FetchGame(gameID: number): Promise<GameFull> {
    const game = await SelectGame(gameID);
    if (!game)
        throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.GAME_NOT_FOUND);
    return game;
}


export class ReviewService {
    static async FindReview(reviewer: UserPK, reviewed: GamePK, currentUser?: UserPK): Promise<ReviewFull> {
        const user : UserPublic = await FetchUser(reviewer);
        await FetchGame(reviewed);

        const review = await SelectReview({reviewer, reviewed});
        if(!review)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

        // check privacy settings
        const canView: boolean = await CanViewUser(user, currentUser);
        if(!canView)
            throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.UNAUTHORIZED_ACTION);

        return {
            reviewer: review.reviewer,
            reviewed: review.reviewed,
            text: review.text,
            score: review.score,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt
        } as ReviewFull;
    }

    static async PublishReview(currentUser: UserPK, gameID: GamePK, text: string, score: number): Promise<ReviewFull> {
        await FetchUser(currentUser);
        await FetchGame(gameID);

        // check if review already exists
        const existing: ReviewFull | null = await SelectReview({reviewer: currentUser, reviewed: gameID});
        if(existing)
            throw new AppError(StatusCodes.CONFLICT, ErrorMessage.REVIEW_ALREADY_EXISTS);

        const review: ReviewFull = await InsertReview({
            reviewer: currentUser,
            reviewed: gameID,
            text,
            score
        });

        return review;
    }

    static async UpdateReview(currentUser: UserPK, gameID: GamePK, text?: string, score?: number): Promise<ReviewFull> {
        await FetchUser(currentUser);
        await FetchGame(gameID);

        const existing = await SelectReview({reviewer: currentUser, reviewed: gameID});
        if(!existing)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

        const updated = await UpdateReview({
            reviewer: currentUser,
            reviewed: gameID,
            text: text ?? existing.text,
            score: score ?? existing.score
        });

        return updated;
    }

    static async RemoveReview(currentUser: UserPK, gameID: GamePK): Promise<ReviewFull> {
        await FetchUser(currentUser);
        await FetchGame(gameID);

        if(!(await SelectReview({reviewer: currentUser, reviewed: gameID})))
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

        const deleted: ReviewFull = await DeleteReview({reviewer: currentUser, reviewed: gameID});

        return deleted;
    }

    static async GetReviewsByGame(gameID: GamePK, currentUser?: UserPK): Promise<ReviewFull[]> {
        const game: GameFull | null = await SelectGame(gameID);
        if(!game)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.GAME_NOT_FOUND);

        const reviews: ReviewFull[] = await SelectAllReviewsOfGame(gameID);

        // filter based on privacy
        const visibleReviews: ReviewFull[] = [];
        for (const review of reviews){
            const user: UserPublic = await FetchUser(review.reviewer);
            const canView: boolean = await CanViewUser(user, currentUser);
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

        return visibleReviews;
    }

    static async GetReviewsByUser(username: UserPK, currentUser?: UserPK): Promise<ReviewFull[]> {
        const user: UserPublic = await FetchUser(username);

        const canView = await CanViewUser(user, currentUser);
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
    static async GetRecentReviews(gameID: GamePK): Promise<void> {
    }
}
