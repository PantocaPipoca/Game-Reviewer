import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/ErrorHandler";
import * as ErrorMessage from "../utils/ErrorMessage";
import {
    GamePK,
    LikeFull,
    LikeShort,
    ReviewFull,
    UserPK,
    ReactionResponse,
    CurrentReactionResponse,
} from "../types/Types";
import { fetchFullUser } from "./UserService";
import { ReviewRepository } from "../Repository/ReviewRepository";
import { LikeRepository } from "../Repository/LikeRepository";

export class LikeService {
    /**
     * Get reactions of a review
     * @param reviewer the reviewer of the target review
     * @param gameID the game ID of the target review
     * @returns the amount of likes and the amount of dislikes
     */
    static async getReactionsByReview(reviewer: UserPK, gameID: GamePK): Promise<ReactionResponse> {
        const review: ReviewFull | null = await ReviewRepository.selectReview({ reviewer, reviewed: gameID });
        if (!review) throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

        const likes: number = await LikeRepository.countLikesOrDislikesOfReview({ reviewer, reviewed: gameID }, true);
        const dislikes: number = await LikeRepository.countLikesOrDislikesOfReview(
            { reviewer, reviewed: gameID },
            false
        );

        return {
            likes,
            dislikes,
        } as ReactionResponse;
    }

    /**
     * Gets the current user's reaction on a review
     * @param currentUser the user checking the reaction
     * @param reviewer the reviewer of the target review
     * @param gameID the game ID of the target review
     * @returns the current reaction, if any
     */
    static async getCurrentReaction(
        currentUser: UserPK | undefined,
        reviewer: UserPK,
        gameID: GamePK
    ): Promise<CurrentReactionResponse> {
        const review: ReviewFull | null = await ReviewRepository.selectReview({ reviewer, reviewed: gameID });
        if (!review) throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

        if (!currentUser) {
            return { value: null };
        }

        await fetchFullUser(currentUser);

        const existing: LikeFull | null = await LikeRepository.selectLike({
            liker: currentUser,
            reviewer,
            reviewed: gameID,
        });

        return {
            value: existing?.value ?? null,
        } as CurrentReactionResponse;
    }

    /**
     * Gives a reaction to a review
     * @param currentUser the commentator
     * @param reviewer the reviewer of the target review
     * @param gameID the game ID of the target review
     * @param reaction if true, the reaction will be a like, otherwise a dislike
     * @returns the reaction given
     */
    static async reactReview(
        currentUser: UserPK,
        reviewer: UserPK,
        gameID: GamePK,
        reaction: boolean
    ): Promise<LikeShort> {
        await fetchFullUser(currentUser);

        const review: ReviewFull | null = await ReviewRepository.selectReview({ reviewer, reviewed: gameID });
        if (!review) throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

        // check if like/dislike already exists
        const existing: LikeFull | null = await LikeRepository.selectLike({
            liker: currentUser,
            reviewer,
            reviewed: gameID,
        });

        let like: LikeFull;
        if (existing) {
            like = await LikeRepository.updateLike({
                liker: currentUser,
                reviewer,
                reviewed: gameID,
                value: reaction,
            });
        } else {
            like = await LikeRepository.insertLike({
                liker: currentUser,
                reviewer,
                reviewed: gameID,
                value: reaction,
            });
        }

        return {
            liker: like.liker,
            reviewer: like.reviewer,
            reviewed: like.reviewed,
            value: like.value,
        } as LikeShort;
    }

    /**
     * Clears a reaction from a review
     * @param currentUser the commentator
     * @param reviewer the reviewer of the target review
     * @param gameID the game ID of the target review
     * @returns the reaction before it was removed
     */
    static async removeReactionFromReview(currentUser: UserPK, reviewer: UserPK, gameID: GamePK): Promise<LikeShort> {
        // Verify review exists
        const review: ReviewFull | null = await ReviewRepository.selectReview({ reviewer: reviewer, reviewed: gameID });
        if (!review) throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REVIEW_NOT_FOUND);

        // Check if like exists
        const existing: LikeFull | null = await LikeRepository.selectLike({
            liker: currentUser,
            reviewer,
            reviewed: gameID,
        });
        if (!existing) throw new AppError(StatusCodes.NOT_FOUND, ErrorMessage.REACTION_NOT_FOUND);

        const deleted: LikeFull = await LikeRepository.deleteLike({ liker: currentUser, reviewer, reviewed: gameID });

        return {
            liker: deleted.liker,
            reviewer: deleted.reviewer,
            reviewed: deleted.reviewed,
            value: deleted.value,
        } as LikeShort;
    }
}
