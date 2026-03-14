import {describe, it, expect} from "@jest/globals";
import { LikeFull, LikeShort, ReviewPK } from "../../../src/types/Types";
import { ReviewRepository } from "../../../src/Repository/ReviewRepository";
import { CreateGame, QuickRegisterUser } from "../helper/helper";
import { LikeRepository } from '../../../src/Repository/LikeRepository';

describe("LikeRepository (integration)", () => {
    // Auxiliary function, inserts review
    async function InsertReviewAndReaction(value: boolean): Promise<LikeFull> {
        const reviewer: string = await QuickRegisterUser();
        const reviewed: number = (await CreateGame()).gameID;
        await ReviewRepository.InsertReview({reviewer, reviewed, text: "", score: 2});
        const liker: string = await QuickRegisterUser();
        return await LikeRepository.InsertLike({reviewer, reviewed, liker, value});
    }

    // Auxiliary function, checks a reaction's data against expected values
    function CompareReactionAux(reaction: LikeFull | null, pk: ReviewPK, liker: string, value: boolean): void {
        expect(reaction).not.toBeNull();
        expect(reaction?.reviewer).toBe(pk.reviewer);
        expect(reaction?.reviewed).toBe(pk.reviewed);
        expect(reaction?.liker).toBe(liker);
        expect(reaction?.value).toBe(value);
    }

    it("Inserts and selects a reaction", async () => {
        // Inserts review
        const reviewer: string = await QuickRegisterUser();
        const reviewed: number = (await CreateGame()).gameID;
        await ReviewRepository.InsertReview({reviewer, reviewed, text: "", score: 4});

        // Inserts like
        const liker: string = await QuickRegisterUser();
        const like: LikeFull = await LikeRepository.InsertLike({reviewer, reviewed, liker, value: true});
        CompareReactionAux(like, {reviewer, reviewed} as ReviewPK, liker, true);

        // Inserts dislike
        const disliker: string = await QuickRegisterUser();
        const dislike: LikeFull = await LikeRepository.InsertLike({reviewer, reviewed, liker: disliker, value: false});
        CompareReactionAux(dislike, {reviewer, reviewed} as ReviewPK, disliker, false);

        // Checks info from selection
        CompareReactionAux(await LikeRepository.SelectLike({reviewer, reviewed, liker}),
            {reviewer, reviewed} as ReviewPK, liker, true);
        CompareReactionAux(await LikeRepository.SelectLike({reviewer, reviewed, liker: disliker}),
            {reviewer, reviewed} as ReviewPK, disliker, false);
    });

    it("Inserts and updates a reaction", async () => {
        // Creates a like and dislike
        const like: LikeFull = await InsertReviewAndReaction(true);
        const dislike: LikeFull = await InsertReviewAndReaction(false);

        // Turns the like into a dislike and vice-versa
        const updated1: LikeFull = await LikeRepository.UpdateLike({
            reviewer: like.reviewer,
            reviewed: like.reviewed,
            liker: like.liker,
            value: false
        } as LikeShort);
        const updated2: LikeFull = await LikeRepository.UpdateLike({
            reviewer: dislike.reviewer,
            reviewed: dislike.reviewed,
            liker: dislike.liker,
            value: true
        } as LikeShort);
        CompareReactionAux(updated1, {reviewer: like.reviewer, reviewed: like.reviewed} as ReviewPK, like.liker, false);
        CompareReactionAux(updated2, {reviewer: dislike.reviewer, reviewed: dislike.reviewed} as ReviewPK, dislike.liker, true);

        // Checks info from selection
        CompareReactionAux(await LikeRepository.SelectLike({reviewer: like.reviewer, reviewed: like.reviewed, liker: like.liker}),
            {reviewer: like.reviewer, reviewed: like.reviewed} as ReviewPK, like.liker, false);
        CompareReactionAux(await LikeRepository.SelectLike({reviewer: dislike.reviewer, reviewed: dislike.reviewed, liker: dislike.liker}),
            {reviewer: dislike.reviewer, reviewed: dislike.reviewed} as ReviewPK, dislike.liker, true);
    });

    it("Inserts and deletes a reaction", async () => {
        // Creates a like and dislike
        const like: LikeFull = await InsertReviewAndReaction(true);
        const dislike: LikeFull = await InsertReviewAndReaction(false);

        // Deletes the reactions
        const deleted1: LikeFull = await LikeRepository.DeleteLike({
            reviewer: like.reviewer,
            reviewed: like.reviewed,
            liker: like.liker
        } as LikeShort);
        const deleted2: LikeFull = await LikeRepository.DeleteLike({
            reviewer: dislike.reviewer,
            reviewed: dislike.reviewed,
            liker: dislike.liker
        } as LikeShort);
        CompareReactionAux(deleted1, {reviewer: like.reviewer, reviewed: like.reviewed} as ReviewPK, like.liker, true);
        CompareReactionAux(deleted2, {reviewer: dislike.reviewer, reviewed: dislike.reviewed} as ReviewPK, dislike.liker, false);

        expect(await LikeRepository.SelectLike({
            reviewer: like.reviewer,
            reviewed: like.reviewed,
            liker: like.liker
        } as LikeShort)).toBeNull();
        expect(await LikeRepository.SelectLike({
            reviewer: dislike.reviewer,
            reviewed: dislike.reviewed,
            liker: dislike.liker
        } as LikeShort)).toBeNull();
    });

    it("CountLikesOrDislikesOfReview correctly counts all likes and dislikes", async () => {
        // Inserts review
        const reviewer: string = await QuickRegisterUser();
        const reviewed: number = (await CreateGame()).gameID;
        await ReviewRepository.InsertReview({reviewer, reviewed, text: "", score: 7});

        // Inserts several likes and dislikes
        const likes: number = 6;
        for (var i = 0; i < likes; i++)
            await LikeRepository.InsertLike({reviewer, reviewed, liker: await QuickRegisterUser(), value: true});
        const dislikes: number = 23;
        for (var i = 0; i < dislikes; i++)
            await LikeRepository.InsertLike({reviewer, reviewed, liker: await QuickRegisterUser(), value: false});

        // Makes sure the amounts of likes and dislikes match
        expect(await LikeRepository.CountLikesOrDislikesOfReview({reviewer, reviewed} as ReviewPK, true)).toBe(likes);
        expect(await LikeRepository.CountLikesOrDislikesOfReview({reviewer, reviewed} as ReviewPK, false)).toBe(dislikes);
    });

    it("SelectAllLikesOfUser", async () => {
        // Insert several reviews from different users
        const reviews: ReviewPK[] = [];
        for (var i = 0; i < 12; i++) {
            const reviewer: string = await QuickRegisterUser();
            const reviewed: number = (await CreateGame()).gameID;
            reviews.push(await ReviewRepository.InsertReview({reviewer, reviewed, text: "", score: 5}));
        }

        // Makes several reactions from one user
        const target: string = await QuickRegisterUser();
        const reactions: LikeFull[] = [];
        let next: boolean = true;
        reviews.forEach(async r => {
            reactions.push(await LikeRepository.InsertLike({reviewer: r.reviewer, reviewed: r.reviewed, liker: target, value: next}));
            next = !next;
        });

        // Finds all reactions from the target user
        const found: LikeFull[] = await LikeRepository.SelectAllLikesOfUser(target);
        found.forEach(l => {
            expect(reviews.includes({reviewer: l.reviewer, reviewed: l.reviewed} as ReviewPK)).toBeTruthy();
            expect(l.liker).toBe(target);
            expect(reactions.includes(l)).toBeTruthy();
        });
    });
});
