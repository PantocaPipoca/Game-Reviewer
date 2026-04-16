import { describe, it, expect } from "@jest/globals";
import { LikeFull, LikeShort, ReviewPK } from "../../../src/types/Types";
import { ReviewRepository } from "../../../src/Repository/ReviewRepository";
import { createGame, quickRegisterUser } from "../helper/helper";
import { LikeRepository } from "../../../src/Repository/LikeRepository";

describe("LikeRepository (integration)", () => {
    // Auxiliary function, inserts review
    async function insertReviewAndReaction(value: boolean): Promise<LikeFull> {
        const reviewer: string = await quickRegisterUser();
        const reviewed: number = (await createGame()).gameID;
        await ReviewRepository.insertReview({
            reviewer,
            reviewed,
            text: "",
            score: 2,
            hoursPlayed: null,
            platforms: [],
        });
        const liker: string = await quickRegisterUser();
        return await LikeRepository.insertLike({ reviewer, reviewed, liker, value });
    }

    // Auxiliary function, checks a reaction's data against expected values
    function compareReactionAux(reaction: LikeFull | null, pk: ReviewPK, liker: string, value: boolean): void {
        expect(reaction).not.toBeNull();
        expect(reaction?.reviewer).toBe(pk.reviewer);
        expect(reaction?.reviewed).toBe(pk.reviewed);
        expect(reaction?.liker).toBe(liker);
        expect(reaction?.value).toBe(value);
    }

    it("Inserts and selects a reaction", async () => {
        // Inserts review
        const reviewer: string = await quickRegisterUser();
        const reviewed: number = (await createGame()).gameID;
        await ReviewRepository.insertReview({
            reviewer,
            reviewed,
            text: "",
            score: 4,
            hoursPlayed: null,
            platforms: [],
        });

        // Inserts like
        const liker: string = await quickRegisterUser();
        const like: LikeFull = await LikeRepository.insertLike({ reviewer, reviewed, liker, value: true });
        compareReactionAux(like, { reviewer, reviewed } as ReviewPK, liker, true);

        // Inserts dislike
        const disliker: string = await quickRegisterUser();
        const dislike: LikeFull = await LikeRepository.insertLike({
            reviewer,
            reviewed,
            liker: disliker,
            value: false,
        });
        compareReactionAux(dislike, { reviewer, reviewed } as ReviewPK, disliker, false);

        // Checks info from selection
        compareReactionAux(
            await LikeRepository.selectLike({ reviewer, reviewed, liker }),
            { reviewer, reviewed } as ReviewPK,
            liker,
            true
        );
        compareReactionAux(
            await LikeRepository.selectLike({ reviewer, reviewed, liker: disliker }),
            { reviewer, reviewed } as ReviewPK,
            disliker,
            false
        );
    });

    it("Inserts and updates a reaction", async () => {
        // Creates a like and dislike
        const like: LikeFull = await insertReviewAndReaction(true);
        const dislike: LikeFull = await insertReviewAndReaction(false);

        // Turns the like into a dislike and vice-versa
        const updated1: LikeFull = await LikeRepository.updateLike({
            reviewer: like.reviewer,
            reviewed: like.reviewed,
            liker: like.liker,
            value: false,
        } as LikeShort);
        const updated2: LikeFull = await LikeRepository.updateLike({
            reviewer: dislike.reviewer,
            reviewed: dislike.reviewed,
            liker: dislike.liker,
            value: true,
        } as LikeShort);
        compareReactionAux(
            updated1,
            { reviewer: like.reviewer, reviewed: like.reviewed } as ReviewPK,
            like.liker,
            false
        );
        compareReactionAux(
            updated2,
            { reviewer: dislike.reviewer, reviewed: dislike.reviewed } as ReviewPK,
            dislike.liker,
            true
        );

        // Checks info from selection
        compareReactionAux(
            await LikeRepository.selectLike({ reviewer: like.reviewer, reviewed: like.reviewed, liker: like.liker }),
            { reviewer: like.reviewer, reviewed: like.reviewed } as ReviewPK,
            like.liker,
            false
        );
        compareReactionAux(
            await LikeRepository.selectLike({
                reviewer: dislike.reviewer,
                reviewed: dislike.reviewed,
                liker: dislike.liker,
            }),
            { reviewer: dislike.reviewer, reviewed: dislike.reviewed } as ReviewPK,
            dislike.liker,
            true
        );
    });

    it("Inserts and deletes a reaction", async () => {
        // Creates a like and dislike
        const like: LikeFull = await insertReviewAndReaction(true);
        const dislike: LikeFull = await insertReviewAndReaction(false);

        // Deletes the reactions
        const deleted1: LikeFull = await LikeRepository.deleteLike({
            reviewer: like.reviewer,
            reviewed: like.reviewed,
            liker: like.liker,
        } as LikeShort);
        const deleted2: LikeFull = await LikeRepository.deleteLike({
            reviewer: dislike.reviewer,
            reviewed: dislike.reviewed,
            liker: dislike.liker,
        } as LikeShort);
        compareReactionAux(
            deleted1,
            { reviewer: like.reviewer, reviewed: like.reviewed } as ReviewPK,
            like.liker,
            true
        );
        compareReactionAux(
            deleted2,
            { reviewer: dislike.reviewer, reviewed: dislike.reviewed } as ReviewPK,
            dislike.liker,
            false
        );

        expect(
            await LikeRepository.selectLike({
                reviewer: like.reviewer,
                reviewed: like.reviewed,
                liker: like.liker,
            } as LikeShort)
        ).toBeNull();
        expect(
            await LikeRepository.selectLike({
                reviewer: dislike.reviewer,
                reviewed: dislike.reviewed,
                liker: dislike.liker,
            } as LikeShort)
        ).toBeNull();
    });

    it("CountLikesOrDislikesOfReview correctly counts all likes and dislikes", async () => {
        // Inserts review
        const reviewer: string = await quickRegisterUser();
        const reviewed: number = (await createGame()).gameID;
        await ReviewRepository.insertReview({
            reviewer,
            reviewed,
            text: "",
            score: 7,
            hoursPlayed: null,
            platforms: [],
        });

        // Inserts several likes and dislikes
        const likes: number = 6;
        for (var i = 0; i < likes; i++)
            await LikeRepository.insertLike({ reviewer, reviewed, liker: await quickRegisterUser(), value: true });
        const dislikes: number = 9;
        for (var i = 0; i < dislikes; i++)
            await LikeRepository.insertLike({ reviewer, reviewed, liker: await quickRegisterUser(), value: false });

        // Makes sure the amounts of likes and dislikes match
        expect(await LikeRepository.countLikesOrDislikesOfReview({ reviewer, reviewed } as ReviewPK, true)).toBe(likes);
        expect(await LikeRepository.countLikesOrDislikesOfReview({ reviewer, reviewed } as ReviewPK, false)).toBe(
            dislikes
        );
    });

    it("SelectAllLikesOfUser", async () => {
        // Insert several reviews from different users
        const reviews: ReviewPK[] = [];
        for (var i = 0; i < 12; i++) {
            const reviewer: string = await quickRegisterUser();
            const reviewed: number = (await createGame()).gameID;
            reviews.push(
                await ReviewRepository.insertReview({
                    reviewer,
                    reviewed,
                    text: "",
                    score: 5,
                    hoursPlayed: null,
                    platforms: [],
                })
            );
        }

        // Makes several reactions from one user
        const target: string = await quickRegisterUser();
        const reactions: LikeFull[] = [];
        let next: boolean = true;
        for (const review of reviews) {
            reactions.push(
                await LikeRepository.insertLike({
                    reviewer: review.reviewer,
                    reviewed: review.reviewed,
                    liker: target,
                    value: next,
                })
            );
            next = !next;
        }

        // Finds all reactions from the target user
        const found: LikeFull[] = await LikeRepository.selectAllLikesOfUser(target);
        found.forEach((l) => {
            expect(
                reviews.some((review) => review.reviewer === l.reviewer && review.reviewed === l.reviewed)
            ).toBeTruthy();
            expect(l.liker).toBe(target);
            expect(
                reactions.some(
                    (reaction) =>
                        reaction.reviewer === l.reviewer &&
                        reaction.reviewed === l.reviewed &&
                        reaction.liker === l.liker &&
                        reaction.value === l.value
                )
            ).toBeTruthy();
        });
    });

    it("SelectLike returns null when user hasn't reacted to a review", async () => {
        // Creates a review
        const reviewer: string = await quickRegisterUser();
        const reviewed: number = (await createGame()).gameID;
        await ReviewRepository.insertReview({
            reviewer,
            reviewed,
            text: "",
            score: 3,
            hoursPlayed: null,
            platforms: [],
        });

        // User 1 likes the review
        const liker1: string = await quickRegisterUser();
        await LikeRepository.insertLike({ reviewer, reviewed, liker: liker1, value: true });

        // User 2 hasn't reacted, should return null
        const liker2: string = await quickRegisterUser();
        const notReacted: LikeFull | null = await LikeRepository.selectLike({
            reviewer,
            reviewed,
            liker: liker2,
        });
        expect(notReacted).toBeNull();

        // But liker1 should find their reaction
        const reacted: LikeFull | null = await LikeRepository.selectLike({
            reviewer,
            reviewed,
            liker: liker1,
        });
        expect(reacted).not.toBeNull();
        expect(reacted?.value).toBe(true);
    });
});
