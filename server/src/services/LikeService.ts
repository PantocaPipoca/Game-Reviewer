import {StatusCodes} from "http-status-codes"
import {AppError} from "../utils/ErrorHandler"
import * as ErrorMessage from "../utils/ErrorMessage"
import { GamePK, LikeFull, LikeShort, ReviewFull, UserPK } from "../types/Types";
import { FetchFullUser } from "./AccountService";
import { ReviewRepository } from "../Repository/ReviewRepository"
import { LikeRepository } from "../Repository/LikeRepository";

type ReactionResponse = {
    likes: number,
    dislikes: number,
}

export class LikeService {

    /**
     * Get reactions of a review 
     * @param reviewer 
     * @param gameID 
     * @returns 
     */
    static async GetReactionsByReview(reviewer: UserPK, gameID: GamePK): Promise<ReactionResponse> {
        const review: ReviewFull | null = await ReviewRepository.SelectReview({reviewer, reviewed: gameID});
        if (!review)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

        const likes: number = await LikeRepository.CountLikesOrDislikesOfReview({reviewer, reviewed: gameID}, true);
        const dislikes: number = await LikeRepository.CountLikesOrDislikesOfReview({reviewer, reviewed: gameID}, false);

        return {
            likes,
            dislikes,
        } as ReactionResponse;
    }

    // reaction is true for like and false for dislike
    static async ReactReview(currentUser: UserPK, reviewer: UserPK, gameID: GamePK, reaction: boolean): Promise<LikeShort> {
        await FetchFullUser(currentUser);

        const review: ReviewFull | null = await ReviewRepository.SelectReview({reviewer, reviewed: gameID});
        if (!review)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

        // check if like/dislike already exists
        const existing: LikeFull | null = await LikeRepository.SelectLike({liker: currentUser, reviewer, reviewed: gameID});

        let like: LikeFull;
        if (existing){
            like = await LikeRepository.UpdateLike({
                liker: currentUser,
                reviewer,
                reviewed: gameID,
                value: reaction
            })
        }
        else {
            like = await LikeRepository.InsertLike({
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
        } as LikeShort;
    }

    static async RemoveReactionFromReview(currentUser: UserPK, reviewer: UserPK, gameID: GamePK): Promise<LikeShort> {
        // Verify review exists
        const review: ReviewFull | null = await ReviewRepository.SelectReview({reviewer: currentUser, reviewed: gameID});
        if (!review)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);


        // Check if like exists
        const existing: LikeFull | null = await LikeRepository.SelectLike({liker: currentUser, reviewer, reviewed: gameID});
        if (!existing)
            throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REACTION_NOT_FOUND);

        const deleted: LikeFull = await LikeRepository.DeleteLike({liker: currentUser, reviewer, reviewed: gameID});

        return {
            liker: deleted.liker,
            reviewer: deleted.reviewer,
            reviewed: deleted.reviewed,
            value: deleted.value,
        } as LikeShort;
    }

    // TODO Later
    static async GetLikesByUser(username: UserPK): Promise<void> {
    }
}