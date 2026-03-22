import { describe, it, expect } from "@jest/globals";
import { ReviewPK, LikeShort, ReactionResponse } from "../../../src/types/Types";
import { quickPublishReview, quickReadyReview } from "./ReviewService.test";
import { quickRegisterUser } from "../helper/helper";
import { LikeService } from "../../../src/services/LikeService";

describe("LikeService (integration)", () => {
    // Auxiliary function, add reaction
    async function pushReactionAux(liker: string, review: ReviewPK, value: boolean): Promise<LikeShort> {
        return await LikeService.reactReview(liker, review.reviewer, review.reviewed, value);
    }

    // Auxiliary function, remove reaction
    async function popReactionAux(liker: string, review: ReviewPK): Promise<LikeShort> {
        return await LikeService.removeReactionFromReview(liker, review.reviewer, review.reviewed);
    }

    // Auxiliary function, checks a reaction's data against expected values
    function checkReactionAux(liker: string, value: boolean, review: ReviewPK, reaction?: LikeShort): void {
        expect(reaction).not.toBeNull();
        expect(reaction?.liker).toBe(liker);
        expect(reaction?.value).toBe(value);
        expect(reaction?.reviewer).toBe(review.reviewer);
        expect(reaction?.reviewed).toBe(review.reviewed);
    }

    it("ReactReview gives a like/dislike to a review (potentially replacing a previous reaction), not if there is no such review", async () => {
        // Prepares review and two users that will react to it
        const pk: ReviewPK = await quickReadyReview();
        const liker1: string = await quickRegisterUser();
        const liker2: string = await quickRegisterUser();

        // Fails, review is not yet published
        await expect(pushReactionAux(liker1, pk, true)).rejects.toBeDefined();
        await expect(pushReactionAux(liker2, pk, false)).rejects.toBeDefined();

        // Publishes review
        await quickPublishReview(pk);

        // Alter reactions and check these reactions' data against expected values
        const react1: LikeShort = await pushReactionAux(liker1, pk, true);
        checkReactionAux(liker1, true, pk, react1);
        const react2: LikeShort = await pushReactionAux(liker2, pk, false);
        checkReactionAux(liker2, false, pk, react2);
        const react3: LikeShort = await pushReactionAux(liker1, pk, false);
        checkReactionAux(liker1, false, pk, react3);
        const react4: LikeShort = await pushReactionAux(liker2, pk, true);
        checkReactionAux(liker2, true, pk, react4);
    });

    it("GetReactionsByReview correctly finds how many likes/dislikes in a review, not if there is no such review", async () => {
        // Prepares a review
        const pk: ReviewPK = await quickReadyReview();

        // Fails, review is not yet published
        await expect(LikeService.getReactionsByReview(pk.reviewer, pk.reviewed)).rejects.toBeDefined();

        // Publishes the review
        await quickPublishReview(pk);

        // Creates several users to like the review
        const expectedLikeCount: number = 24;
        for (var i = 0; i < expectedLikeCount; i++)
            await expect(pushReactionAux(await quickRegisterUser(), pk, true)).resolves.toBeDefined();

        // Creates several users to dislike the review
        const expectedDislikeCount: number = 13;
        for (var i = 0; i < expectedDislikeCount; i++)
            await expect(pushReactionAux(await quickRegisterUser(), pk, false)).resolves.toBeDefined();

        // Checks if the amount of likes and dislikes match expected values
        const response: ReactionResponse = await LikeService.getReactionsByReview(pk.reviewer, pk.reviewed);
        expect(response.likes).toBe(expectedLikeCount);
        expect(response.dislikes).toBe(expectedDislikeCount);
    });

    it("RemoveReactionFromReview removes a reaction from a review, not if there is no such review or reaction", async () => {
        // Prepares a review and a user to react to the review
        const pk: ReviewPK = await quickReadyReview();
        const liker: string = await quickRegisterUser();

        // Fails, review is not yet published
        await expect(popReactionAux(liker, pk)).rejects.toBeDefined();

        // Publishes the review
        await quickPublishReview(pk);

        // Likes the review
        await pushReactionAux(liker, pk, true);

        // Deletes the review and checks
        const deleted1: LikeShort = await popReactionAux(liker, pk);
        checkReactionAux(liker, true, pk, deleted1);

        // Dislikes the review
        await pushReactionAux(liker, pk, false);

        // Deletes the review and checks
        const deleted2: LikeShort = await popReactionAux(liker, pk);
        checkReactionAux(liker, false, pk, deleted2);
    });
});
