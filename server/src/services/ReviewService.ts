import { StatusCodes } from "http-status-codes"
import { AppError } from "../utils/ErrorHandler"
import * as ErrorMessage from "../utils/ErrorMessage"
import {GameFull, GamePK, ReviewFull, UserPK} from "../types/Types"
import { FetchUser, CanViewUser } from "./AccountService"
import { SelectGame } from "../Repository/GameRepository"
import { DeleteReview, InsertReview, SelectAllReviewsOfGame, SelectAllReviewsOfUser, SelectReview, UpdateReview } from "../Repository/ReviewRepository"


// Throws if the user or the game dont exist
async function CheckUserAndGame(username: string, gameID: number): Promise<void> {
    if (!(await FetchUser(username)))
        throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.ACCOUNT_NOT_FOUND);
    if (!(await SelectGame(gameID)))
        throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.GAME_NOT_FOUND);
}


export class ReviewService {
    static async FindReview(reviewer: UserPK, reviewed: GamePK, currentUser?: UserPK): Promise<ReviewFull> {
        await CheckUserAndGame(reviewer, reviewed);

        const review = await SelectReview({reviewer, reviewed});
        if(!review)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

        // check privacy settings
        if(!(await CanViewUser(reviewer, currentUser)))
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
        await CheckUserAndGame(currentUser, gameID);

        // Check if review already exists
        if(await SelectReview({reviewer: currentUser, reviewed: gameID}))
            throw new AppError(StatusCodes.CONFLICT, ErrorMessage.REVIEW_ALREADY_EXISTS);

        const review: ReviewFull = await InsertReview({
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
        } as ReviewFull;
    }

    static async UpdateReview(currentUser: UserPK, gameID: GamePK, text?: string, score?: number): Promise<ReviewFull> {
        await CheckUserAndGame(currentUser, gameID);

        const existing = await SelectReview({reviewer: currentUser, reviewed: gameID});
        if(!existing)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

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

    static async RemoveReview(currentUser: UserPK, gameID: GamePK): Promise<ReviewFull> {
        await CheckUserAndGame(currentUser, gameID);

        if(!(await SelectReview({reviewer: currentUser, reviewed: gameID})))
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

        const deleted: ReviewFull = await DeleteReview({reviewer: currentUser, reviewed: gameID});

        return {
            reviewer: deleted.reviewer,
            reviewed: deleted.reviewed,
            text: deleted.text,
            score: deleted.score,
            createdAt: deleted.createdAt,
            updatedAt: deleted.updatedAt
        };
    }

    static async GetReviewsByGame(gameID: GamePK, currentUser?: UserPK): Promise<ReviewFull[]> {
        const game: GameFull | null = await SelectGame(gameID);
        if(!game)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.GAME_NOT_FOUND);

        const reviews: ReviewFull[] = await SelectAllReviewsOfGame(gameID);

        // filter based on privacy
        const visibleReviews: ReviewFull[] = [];
        for (const review of reviews){
            const canView: boolean = await CanViewUser(review.reviewer, currentUser);
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
        await FetchUser(username);

        if (!(await CanViewUser(username, currentUser)))
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
