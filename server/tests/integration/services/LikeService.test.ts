import {describe, it, expect} from "@jest/globals";
import {ReviewPK, LikeShort, ReactionResponse} from '../../../src/types/Types';
import {QuickPublishReview, QuickReadyReview} from "./ReviewService.test";
import {QuickRegisterUser} from "../helper/helper";
import {LikeService} from '../../../src/services/LikeService';

describe("LikeService (integration)", () => {
    // Auxiliary function, add reaction
    async function PushReactionAux(liker: string, review: ReviewPK, value: boolean): Promise<LikeShort> {
        return await LikeService.ReactReview(liker, review.reviewer, review.reviewed, value);
    }

    // Auxiliary function, remove reaction
    async function PopReactionAux(liker: string, review: ReviewPK): Promise<LikeShort> {
        return await LikeService.RemoveReactionFromReview(liker, review.reviewer, review.reviewed);
    }

    // Auxiliary function, checks a reaction's data against expected values
    function CheckReactionAux(liker: string, value: boolean, review: ReviewPK, reaction?: LikeShort): void {
        expect(reaction).not.toBeNull();
        expect(reaction?.liker).toBe(liker);
        expect(reaction?.value).toBe(value);
        expect(reaction?.reviewer).toBe(review.reviewer);
        expect(reaction?.reviewed).toBe(review.reviewed);
    }

    it("ReactReview gives a like/dislike to a review (potentially replacing a previous reaction), not if there is no such review",
            async () => {
        // Prepares review and two users that will react to it
        const pk: ReviewPK = await QuickReadyReview();
        const liker1: string = await QuickRegisterUser();
        const liker2: string = await QuickRegisterUser();

        // Fails, review is not yet published
        await expect(PushReactionAux(liker1, pk, true)).rejects.toBeDefined();
        await expect(PushReactionAux(liker2, pk, false)).rejects.toBeDefined();

        // Publishes review
        await QuickPublishReview(pk);

        // Alter reactions and check these reactions' data against expected values
        const react1: LikeShort = await PushReactionAux(liker1, pk, true);
        CheckReactionAux(liker1, true, pk, react1);
        const react2: LikeShort = await PushReactionAux(liker2, pk, false);
        CheckReactionAux(liker2, false, pk, react2);
        const react3: LikeShort = await PushReactionAux(liker1, pk, false);
        CheckReactionAux(liker1, false, pk, react3);
        const react4: LikeShort = await PushReactionAux(liker2, pk, true);
        CheckReactionAux(liker2, true, pk, react4);
    });

    it("GetReactionsByReview correctly finds how many likes/dislikes in a review, not if there is no such review",
            async () => {
        // Prepares a review
        const pk: ReviewPK = await QuickReadyReview();

        // Fails, review is not yet published
        await expect(LikeService.GetReactionsByReview(pk.reviewer, pk.reviewed)).rejects.toBeDefined();

        // Publishes the review
        await QuickPublishReview(pk);

        // Creates several users to like the review
        const expectedLikeCount: number = 24;
        for (var i = 0; i < expectedLikeCount; i++)
            await expect(PushReactionAux(await QuickRegisterUser(), pk, true)).resolves.toBeDefined();

        // Creates several users to dislike the review
        const expectedDislikeCount: number = 13;
        for (var i = 0; i < expectedDislikeCount; i++)
            await expect(PushReactionAux(await QuickRegisterUser(), pk, false)).resolves.toBeDefined();

        // Checks if the amount of likes and dislikes match expected values
        const response: ReactionResponse = await LikeService.GetReactionsByReview(pk.reviewer, pk.reviewed);
        expect(response.likes).toBe(expectedLikeCount);
        expect(response.dislikes).toBe(expectedDislikeCount);
    });

    it("RemoveReactionFromReview removes a reaction from a review, not if there is no such review or reaction", async () => {
        // Prepares a review and a user to react to the review
        const pk: ReviewPK = await QuickReadyReview();
        const liker: string = await QuickRegisterUser();

        // Fails, review is not yet published
        await expect(PopReactionAux(liker, pk)).rejects.toBeDefined();

        // Publishes the review
        await QuickPublishReview(pk);

        // Likes the review
        await PushReactionAux(liker, pk, true);

        // Deletes the review and checks
        const deleted1: LikeShort = await PopReactionAux(liker, pk);
        CheckReactionAux(liker, true, pk, deleted1);

        // Dislikes the review
        await PushReactionAux(liker, pk, false);

        // Deletes the review and checks
        const deleted2: LikeShort = await PopReactionAux(liker, pk);
        CheckReactionAux(liker, false, pk, deleted2);
    });
});
