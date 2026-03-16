import {describe, it, expect} from "@jest/globals";
import { UserRepository } from "../../../src/Repository/UserRepository";
import { CreateGame } from "../helper/helper";
import { GameFull, ReviewFull, ReviewPK } from "../../../src/types/Types";
import { ReviewRepository } from "../../../src/Repository/ReviewRepository";

describe("ReviewRepository (integration)", () => {
    // Auxiliary function, inserts a user, game and review
    async function MakeReviewPK(): Promise<ReviewPK> {
        const accountName: string = `repo_user_${Date.now()}`;
        await UserRepository.InsertUser({
            accountName,
            passwordHash: "hash",
            userData: {displayName: "Repo", gender: null, bio: null},
            isPrivate: false,
            email: `${accountName}@test.com`
        });
        const game: GameFull = await CreateGame();
        return {reviewer: accountName, reviewed: game.gameID} as ReviewPK;
    }

    // Auxiliary function, inserts a review
    async function InsertReviewAux(pk: ReviewPK, text: string, score: number): Promise<ReviewFull> {
        return await ReviewRepository.InsertReview({
            reviewer: pk.reviewer,
            reviewed: pk.reviewed,
            text, score
        });
    }

    // Auxiliary function, updates a review
    async function UpdateReviewAux(pk: ReviewPK, text: string, score: number): Promise<ReviewFull> {
        return await ReviewRepository.UpdateReview({
            reviewer: pk.reviewer,
            reviewed: pk.reviewed,
            text, score
        });
    }

    // Auxiliary function, checks a review's data against expected values
    function CheckReviewAux(review: ReviewFull | null, pk: ReviewPK, text: string, score: number): void {
        expect(review).not.toBeNull();
        expect(review?.reviewer).toBe(pk.reviewer);
        expect(review?.reviewed).toBe(pk.reviewed);
        expect(review?.text).toBe(text);
        expect(review?.score).toBe(score);
    }

    it("Inserts and selects a review", async () => {
        // Prepares a review primary key
        const pk: ReviewPK = await MakeReviewPK();

        // Fails, not yet published
        const found1: ReviewFull | null = await ReviewRepository.SelectReview(pk);
        expect(found1).toBeNull();

        // Publishes review
        const text: string = "aaa";
        const score: number = 8;
        await InsertReviewAux(pk, text, score);

        // Finds review
        const found2: ReviewFull | null = await ReviewRepository.SelectReview(pk);
        CheckReviewAux(found2, pk, text, score);
    });

    it("Inserts and updates a review", async () => {
        // Prepares a review primary key
        const pk: ReviewPK = await MakeReviewPK();

        // Fails, not yet published
        await expect(UpdateReviewAux(pk, "", 1)).rejects.toBeDefined();

        // Publishes review
        await InsertReviewAux(pk, "text", 1);

        // Updates review
        const text: string = "bbb";
        const score: number = 6;
        const found1: ReviewFull = await UpdateReviewAux(pk, text, score);
        CheckReviewAux(found1, pk, text, score);

        // Finds review
        const found2: ReviewFull | null = await ReviewRepository.SelectReview(pk);
        CheckReviewAux(found2, pk, text, score);
    });

    it("Inserts and deletes a review", async () => {
        // Prepares a review primary key
        const pk: ReviewPK = await MakeReviewPK();

        // Fails, not yet published
        await expect(ReviewRepository.DeleteReview(pk)).rejects.toBeDefined();

        // Publishes review
        const text: string = "ccc";
        const score: number = 7;
        await InsertReviewAux(pk, text, score);

        // Deletes review
        const found: ReviewFull = await ReviewRepository.DeleteReview(pk);
        CheckReviewAux(found, pk, text, score);

        // Makes sure review is gone
        expect(await ReviewRepository.SelectReview(pk)).toBeNull();
        await expect(ReviewRepository.DeleteReview(pk)).rejects.toBeDefined();
    });

    it("Inserts and finds reviews based on gameID and username", async () => {
        // Makes several users, games and reviews
        const arr: ReviewPK[] = [];
        for (var i = 0; i < 10; i++) arr.push(await MakeReviewPK());
        arr.forEach(async p1 => arr.forEach(async p2 => await ReviewRepository.InsertReview({
            reviewer: p1.reviewer, reviewed: p2.reviewed, text: p1.reviewer + " " + p2.reviewed, score: 5
        })));

        // Checks if SelectAllReviewsOfGame returns all the previous users
        arr.forEach(async p1 => {
            const found: ReviewFull[] = await ReviewRepository.SelectAllReviewsOfGame(p1.reviewed);
            found.forEach(review => {
                expect(review).not.toBeNull();
                expect(review.reviewed).toBe(p1.reviewed);
                expect(review.text).toBe(review.reviewer + " " + review.reviewed);
                expect(review.score).toBe(5);
            });
        });

        // Checks if SelectAllReviewsOfUser returns all the previous games
        arr.forEach(async p1 => {
            const found: ReviewFull[] = await ReviewRepository.SelectAllReviewsOfUser(p1.reviewer);
            found.forEach(review => {
                expect(review).not.toBeNull();
                expect(review.reviewer).toBe(p1.reviewer);
                expect(review.text).toBe(review.reviewer + " " + review.reviewed);
                expect(review.score).toBe(5);
            });
        });
    });
});
