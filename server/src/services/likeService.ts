import {StatusCodes} from "http-status-codes"
import {AppError} from "../utils/ErrorHandler"
import * as ErrorMessage from "../utils/ErrorMessage"
import { LikeResponse, ReactionResponse } from "../types/Types";
import { SelectReview } from "../Repository/ReviewRepository"
import { CountLikesOrDislikesOfReview, DeleteLike, InsertLike, SelectLike, UpdateLike } from "../Repository/LikeRepository";
import { FetchUser } from "./AccountService";

export class LikeService {
    static async GetReactionsByReview(reviewer: string, gameID: number): Promise<ReactionResponse> {
        const review = await SelectReview({reviewer, reviewed: gameID});
        if (!review)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

        const likes: number = await CountLikesOrDislikesOfReview({reviewer, reviewed: gameID}, true);
        const dislikes: number = await CountLikesOrDislikesOfReview({reviewer, reviewed: gameID}, false);

        return {
            likes,
            dislikes,
        };
    }

    // reaction is true for like and false for dislike
    static async ReactReview(currentUser: string, reviewer: string, gameID: number, reaction: boolean): Promise<LikeResponse> {
        await FetchUser(currentUser);

        const review = await SelectReview({reviewer, reviewed: gameID});
        if (!review)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

        // check if like/dislike already exists
        const existing = await SelectLike({liker: currentUser, reviewer, reviewed: gameID});

        let like;
        if (existing){
            like = await UpdateLike({
                liker: currentUser,
                reviewer,
                reviewed: gameID,
                value: reaction
            })
        }
        else {
            like = await InsertLike({
                liker: currentUser,
                reviewer,
                reviewed: gameID,
                value: reaction
            })
        }

        return {
            liker: like.liker,
            reviewer: like.reviewer,
            reviewed: like.reviewed,
            value: like.value,
            createdAt: like.createdAt
        };
    }

    static async RemoveReactionFromReview(currentUser: string, reviewer: string,gameID: number): Promise<LikeResponse> {
        // Verify review exists
        const review = await SelectReview({reviewer: currentUser, reviewed: gameID})
        if (!review)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND)


        // Check if like exists
        const existing = await SelectLike({liker: currentUser, reviewer, reviewed: gameID})
        if (!existing) {
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REACTION_NOT_FOUND)
        }

        const deleted = await DeleteLike({liker: currentUser, reviewer, reviewed: gameID})

        return {
            liker: deleted.liker,
            reviewer: deleted.reviewer,
            reviewed: deleted.reviewed,
            value: deleted.value,
            createdAt: deleted.createdAt
        }
    }

    // TODO Later
    static async GetLikesByUser(accountName: string): Promise<void> {
    }
}
