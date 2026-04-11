import { describe, it, expect } from "@jest/globals";
import { UserRepository } from "../../../src/Repository/UserRepository";
import { createGame } from "../helper/helper";
import { GameFull, ReviewFull, ReviewPK } from "../../../src/types/Types";
import { ReviewRepository } from "../../../src/Repository/ReviewRepository";

describe("ReviewRepository (integration)", () => {
    // Auxiliary function, inserts a user, game and review
    async function makeReviewPK(): Promise<ReviewPK> {
        const accountName: string = `repo_user_${Date.now()}`;
        await UserRepository.insertUser({
            accountName,
            passwordHash: "hash",
            avatar: null,
            userData: { displayName: "Repo", gender: null, bio: null },
            isPrivate: false,
            email: `${accountName}@test.com`,
        });
        const game: GameFull = await createGame();
        return { reviewer: accountName, reviewed: game.gameID } as ReviewPK;
    }

    // Auxiliary function, inserts a review
    async function insertReviewAux(pk: ReviewPK, text: string, score: number): Promise<ReviewFull> {
        return await ReviewRepository.insertReview({
            reviewer: pk.reviewer,
            reviewed: pk.reviewed,
            text,
            score,
        });
    }

    // Auxiliary function, updates a review
    async function updateReviewAux(pk: ReviewPK, text: string, score: number): Promise<ReviewFull> {
        return await ReviewRepository.updateReview({
            reviewer: pk.reviewer,
            reviewed: pk.reviewed,
            text,
            score,
        });
    }

    // Auxiliary function, checks a review's data against expected values
    function checkReviewAux(review: ReviewFull | null, pk: ReviewPK, text: string, score: number): void {
        expect(review).not.toBeNull();
        expect(review?.reviewer).toBe(pk.reviewer);
        expect(review?.reviewed).toBe(pk.reviewed);
        expect(review?.text).toBe(text);
        expect(review?.score).toBe(score);
    }

    it("Inserts and selects a review", async () => {
        // Prepares a review primary key
        const pk: ReviewPK = await makeReviewPK();

        // Fails, not yet published
        const found1: ReviewFull | null = await ReviewRepository.selectReview(pk);
        expect(found1).toBeNull();

        // Publishes review
        const text: string = "aaa";
        const score: number = 8;
        await insertReviewAux(pk, text, score);

        // Finds review
        const found2: ReviewFull | null = await ReviewRepository.selectReview(pk);
        checkReviewAux(found2, pk, text, score);
    });

    it("Inserts and updates a review", async () => {
        // Prepares a review primary key
        const pk: ReviewPK = await makeReviewPK();

        // Fails, not yet published
        await expect(updateReviewAux(pk, "", 1)).rejects.toBeDefined();

        // Publishes review
        await insertReviewAux(pk, "text", 1);

        // Updates review
        const text: string = "bbb";
        const score: number = 6;
        const found1: ReviewFull = await updateReviewAux(pk, text, score);
        checkReviewAux(found1, pk, text, score);

        // Finds review
        const found2: ReviewFull | null = await ReviewRepository.selectReview(pk);
        checkReviewAux(found2, pk, text, score);
    });

    it("Inserts and deletes a review", async () => {
        // Prepares a review primary key
        const pk: ReviewPK = await makeReviewPK();

        // Fails, not yet published
        await expect(ReviewRepository.deleteReview(pk)).rejects.toBeDefined();

        // Publishes review
        const text: string = "ccc";
        const score: number = 7;
        await insertReviewAux(pk, text, score);

        // Deletes review
        const found: ReviewFull = await ReviewRepository.deleteReview(pk);
        checkReviewAux(found, pk, text, score);

        // Makes sure review is gone
        expect(await ReviewRepository.selectReview(pk)).toBeNull();
        await expect(ReviewRepository.deleteReview(pk)).rejects.toBeDefined();
    });

    it("Inserts and finds reviews based on gameID and username", async () => {
        // Makes several users, games and reviews
        const arr: ReviewPK[] = [];
        for (var i = 0; i < 10; i++) arr.push(await makeReviewPK());
        arr.forEach(async (p1) =>
            arr.forEach(
                async (p2) =>
                    await ReviewRepository.insertReview({
                        reviewer: p1.reviewer,
                        reviewed: p2.reviewed,
                        text: p1.reviewer + " " + p2.reviewed,
                        score: 5,
                    })
            )
        );

        // Checks if selectAllReviewsOfGame returns all the previous users
        arr.forEach(async (p1) => {
            const found: ReviewFull[] = await ReviewRepository.selectAllReviewsOfGame(p1.reviewed);
            found.forEach((review) => {
                expect(review).not.toBeNull();
                expect(review.reviewed).toBe(p1.reviewed);
                expect(review.text).toBe(review.reviewer + " " + review.reviewed);
                expect(review.score).toBe(5);
            });
        });

        // Checks if selectAllReviewsOfUser returns all the previous games
        arr.forEach(async (p1) => {
            const found: ReviewFull[] = await ReviewRepository.selectAllReviewsOfUser(p1.reviewer);
            found.forEach((review) => {
                expect(review).not.toBeNull();
                expect(review.reviewer).toBe(p1.reviewer);
                expect(review.text).toBe(review.reviewer + " " + review.reviewed);
                expect(review.score).toBe(5);
            });
        });
    });
});
