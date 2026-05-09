import { describe, it, expect } from "@jest/globals";
import { GameFull, ReviewFull, ReviewPK } from "../../../src/types/Types";
import { createGame, fastCreateUser, fastCreateUserAndValidate, quickRegisterUser } from "../helper/helper";
import { ReviewService } from "../../../src/services/ReviewService";
import { ReviewRepository } from "../../../src/Repository/ReviewRepository";

// Auxiliary function, makes and registers a user, creates a game and returns the username and gamename
// Used by CommentService.test.ts and LikeService.test.ts
export async function quickReadyReview(): Promise<ReviewPK> {
    const reviewer: string = await quickRegisterUser();
    const reviewed: number = (await createGame()).gameID;
    return { reviewer, reviewed } as ReviewPK;
}

// Auxiliary function, publishes a review given a username and gamename, with no description and score 5
// Used by CommentService.test.ts and LikeService.test.ts
export async function quickPublishReview(review: ReviewPK): Promise<void> {
    // await ReviewService.publishReview(review.reviewer, review.reviewed, "", 5, 1, ["PC"]);
    await ReviewRepository.insertReview({ ...review, text: "", score: 5, hoursPlayed: 1, platforms: ["PC"] });
}

describe("ReviewService (integration)", () => {
    // Auxiliary function, checks a review's data against expected values
    function checkReviewAux(
        review: ReviewFull | null,
        pk: ReviewPK,
        text: string,
        score: number,
        hoursPlayed?: number,
        platforms?: string[]
    ): void {
        expect(review).not.toBeNull();
        expect(review?.reviewer).toBe(pk.reviewer);
        expect(review?.reviewed).toBe(pk.reviewed);
        expect(review?.text).toBe(text);
        expect(review?.score).toBe(score);
        expect(review?.hoursPlayed).toBe(hoursPlayed ?? null);
        expect(review?.platforms).toEqual(platforms ?? []);
    }

    it("PublishReview correctly creates review, not if duplicate", async () => {
        // Publishes a review
        const pk: ReviewPK = await quickReadyReview();
        const text: string = "SOME TEXT 1";
        const score: number = 8;
        await ReviewService.publishReview(pk.reviewer, pk.reviewed, text, score, 20, ["PC", "PS5"]);

        // Finds that review, checks its data against expected values
        const dbRev: ReviewFull | null = await ReviewRepository.selectReview(pk);
        checkReviewAux(dbRev, pk, text, score, 20, ["PC", "PS5"]);

        // Fails, review already published
        await expect(
            ReviewService.publishReview(pk.reviewer, pk.reviewed, text + " ", score + 1, 30, ["Xbox"])
        ).rejects.toBeDefined();
    });

    it("FindReview correctly finds a review, not if non-existent", async () => {
        // Prepares a review primary key, text and score
        const pk: ReviewPK = await quickReadyReview();
        const text: string = "SOME TEXT 2";
        const score: number = 7;

        // Publishes several unrelated reviews to fill database
        for (var i = 0; i < 10; i++) await quickPublishReview(await quickReadyReview());

        // Fails, not yet published
        await expect(ReviewService.findReview(pk.reviewer, pk.reviewed)).rejects.toBeDefined();

        // Publishes the reivew
        await ReviewService.publishReview(pk.reviewer, pk.reviewed, text, score, 15, ["Switch"]);

        // Finds that review, checks its data against expected values
        const review: ReviewFull = await ReviewService.findReview(pk.reviewer, pk.reviewed);
        checkReviewAux(review, pk, text, score, 15, ["Switch"]);
    });

    it("UpdateReview correctly updates a review, not if non-existent", async () => {
        // Prepares a review primary key, text and score
        const pk: ReviewPK = await quickReadyReview();
        const newText: string = "NEW TEXT";
        const newScore: number = 8;

        // Fails, not yet published
        await expect(
            ReviewService.updateReview(pk.reviewer + ".....", pk.reviewed, newText, newScore)
        ).rejects.toBeDefined();

        // Publishes the review
        await ReviewService.publishReview(pk.reviewer, pk.reviewed, "notext", 7, 2, ["PC"]);

        // Updates the review and checks its data against expected values
        const review: ReviewFull = await ReviewService.updateReview(pk.reviewer, pk.reviewed, newText, newScore, 55, [
            "Steam Deck",
        ]);
        checkReviewAux(review, pk, newText, newScore, 55, ["Steam Deck"]);
    });

    it("RemoveReview correctly removes a review, not if non-existent", async () => {
        // Prepares a review primary key, text and score
        const pk: ReviewPK = await quickReadyReview();
        const text: string = "texttexttext";
        const score: number = 3;

        // Fails, not yet published
        await expect(ReviewService.removeReview(pk.reviewer, pk.reviewed)).rejects.toBeDefined();

        // Publishes the review
        await ReviewService.publishReview(pk.reviewer, pk.reviewed, text, score, 4, ["PS5"]);

        // Removes the review and checks its previous data against expected values
        const review: ReviewFull = await ReviewService.removeReview(pk.reviewer, pk.reviewed);
        checkReviewAux(review, pk, text, score, 4, ["PS5"]);
    });

    it("GetReviewsByGame finds all reviews on a given game", async () => {
        // Creates several games, users and reviews
        const game: GameFull = await createGame();
        for (var i = 0; i < 5; i++) {
            await createGame();
            // await AccountService.registerUser("user" + i, "", "12345678", `username${i}@gmail.com`, false);
            await fastCreateUserAndValidate("user" + i);
            await ReviewService.publishReview("user" + i, game.gameID, "" + i, i, i + 1, ["PC"]);
        }

        // Checks whether getReviewsByGame can find all reviews to the first game
        const reviewArr: ReviewFull[] = await ReviewService.getReviewsByGame(game.gameID);
        reviewArr.forEach((review) => {
            expect(review).not.toBeNull();
            expect(review.reviewer).toBe("user" + review.text);
            expect(review.reviewed).toBe(game.gameID);
            expect(review.score + "").toBe(review.text);
            expect(review.platforms).toEqual(["PC"]);
        });
    });

    it("GetReviewsByUser finds all reviews on a given user", async () => {
        // Creates several games, a user and their reviews to the games
        const username: string = await quickRegisterUser();
        const games: number[] = [];
        for (var i = 0; i < 10; i++) {
            await quickRegisterUser();
            games.push((await createGame()).gameID);
            await ReviewService.publishReview(username, games[i], "" + i, i, i + 10, ["Switch"]);
        }

        // Checks whether getReviewsByUser can find all reviews by the user
        const reviewArr: ReviewFull[] = await ReviewService.getReviewsByUser(username);
        reviewArr.forEach((review) => {
            expect(review).not.toBeNull();
            expect(review.reviewer).toBe(username);
            expect(games.includes(review.reviewed)).toBeTruthy();
            expect(review.text).toBe(review.score + "");
            expect(review.platforms).toEqual(["Switch"]);
        });
    });
});
