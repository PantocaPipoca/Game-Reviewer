import { StatusCodes } from "http-status-codes"
import { AppError } from "../utils/ErrorHandler"
import * as ErrorMessage from "../utils/ErrorMessage"
import {GameFull, GamePK, ReviewFull, UserPK, UserPublic} from "../types/Types"
import { CanViewUser, FetchPublicUser } from "./AccountService"
import { GameRepository } from "../Repository/GameRepository"
import { ReviewRepository } from "../Repository/ReviewRepository"


// Throws if the user or the game dont exist
async function FetchGame(gameID: number): Promise<GameFull> {
    const game: GameFull | null = await GameRepository.SelectGame(gameID);
    if (!game)
        throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.GAME_NOT_FOUND);
    return game;
}


export class ReviewService {
    static async FindReview(reviewer: UserPK, reviewed: GamePK, currentUser?: UserPK): Promise<ReviewFull> {
        const user : UserPublic = await FetchPublicUser(reviewer);
        await FetchGame(reviewed);

        const review: ReviewFull | null = await ReviewRepository.SelectReview({reviewer, reviewed});
        if(!review)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

        // check privacy settings
        const canView: boolean = await CanViewUser(user, currentUser);
        if(!canView)
            throw new AppError(StatusCodes.FORBIDDEN, ErrorMessage.UNAUTHORIZED_ACTION);

        return review;
    }

    static async PublishReview(currentUser: UserPK, gameID: GamePK, text: string, score: number): Promise<ReviewFull> {
        await FetchPublicUser(currentUser);
        await FetchGame(gameID);

        // check if review already exists
        const existing: ReviewFull | null = await ReviewRepository.SelectReview({reviewer: currentUser, reviewed: gameID});
        if(existing)
            throw new AppError(StatusCodes.CONFLICT, ErrorMessage.REVIEW_ALREADY_EXISTS);

        const review: ReviewFull = await ReviewRepository.InsertReview({
            reviewer: currentUser,
            reviewed: gameID,
            text,
            score
        });

        return review;
    }

    static async UpdateReview(currentUser: UserPK, gameID: GamePK, text?: string, score?: number): Promise<ReviewFull> {
        await FetchPublicUser(currentUser);
        await FetchGame(gameID);

        const existing: ReviewFull | null = await ReviewRepository.SelectReview({reviewer: currentUser, reviewed: gameID});
        if(!existing)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

        const updated: ReviewFull = await ReviewRepository.UpdateReview({
            reviewer: currentUser,
            reviewed: gameID,
            text: text ?? existing.text,
            score: score ?? existing.score
        });

        return updated;
    }

    static async RemoveReview(currentUser: UserPK, gameID: GamePK): Promise<ReviewFull> {
        await FetchPublicUser(currentUser);
        await FetchGame(gameID);

        const existing: ReviewFull | null = await ReviewRepository.SelectReview({reviewer: currentUser, reviewed: gameID});
        if(!existing)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

        const deleted: ReviewFull = await ReviewRepository.DeleteReview({reviewer: currentUser, reviewed: gameID});

        return deleted;
    }

    static async GetReviewsByGame(gameID: GamePK, currentUser?: UserPK): Promise<ReviewFull[]> {
        const game: GameFull | null = await GameRepository.SelectGame(gameID);
        if(!game)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.GAME_NOT_FOUND);

        const reviews: ReviewFull[] = await ReviewRepository.SelectAllReviewsOfGame(gameID);

        // filter based on privacy
        const visibleReviews: ReviewFull[] = [];
        for (const review of reviews){
            const user: UserPublic = await FetchPublicUser(review.reviewer);
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
        const user: UserPublic = await FetchPublicUser(username);

        const canView = await CanViewUser(user, currentUser);
        if (!canView)
            return [];  // return empty if not authorized to view

        const reviews: ReviewFull[] = await ReviewRepository.SelectAllReviewsOfUser(username);

        return reviews;
    }

    // TODO Later
    static async GetRecentReviews(gameID: GamePK): Promise<void> {
    }
}
