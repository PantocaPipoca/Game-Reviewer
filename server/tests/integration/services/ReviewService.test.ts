import {describe, it, expect} from "@jest/globals";
import {GameFull, ReviewFull, ReviewPK} from "../../../src/types/Types";
import {CreateGame, QuickRegisterUser} from "../helper/helper";
import {ReviewService} from '../../../src/services/ReviewService';
import {AccountService} from "../../../src/services/AccountService";
import {ReviewRepository} from "../../../src/Repository/ReviewRepository";

// Auxiliary function, makes and registers a user, creates a game and returns the username and gamename
// Used by CommentService.test.ts and LikeService.test.ts
export async function QuickReadyReview(): Promise<ReviewPK> {
    const reviewer: string = await QuickRegisterUser();
    const reviewed: number = (await CreateGame()).gameID;
    return {reviewer, reviewed} as ReviewPK;
}

// Auxiliary function, publishes a review given a username and gamename, with no description and score 5
// Used by CommentService.test.ts and LikeService.test.ts
export async function QuickPublishReview(review: ReviewPK): Promise<void> {
    await ReviewService.PublishReview(review.reviewer, review.reviewed, "", 5);
}

describe("ReviewService (integration)", () => {
    // Auxiliary function, checks a review's data against expected values
    function CheckReviewAux(review: ReviewFull | null, pk: ReviewPK, text: string, score: number): void {
        expect(review).not.toBeNull();
        expect(review?.reviewer).toBe(pk.reviewer);
        expect(review?.reviewed).toBe(pk.reviewed);
        expect(review?.text).toBe(text);
        expect(review?.score).toBe(score);
    }

    it("PublishReview correctly creates review, not if duplicate", async () => {
        // Publishes a review
        const pk: ReviewPK = await QuickReadyReview();
        const text: string = "SOME TEXT 1";
        const score: number = 8;
        await ReviewService.PublishReview(pk.reviewer, pk.reviewed, text, score);

        // Finds that review, checks its data against expected values
        const dbRev: ReviewFull | null = await ReviewRepository.SelectReview(pk);
        CheckReviewAux(dbRev, pk, text, score);

        // Fails, review already published
        await expect(ReviewService.PublishReview(pk.reviewer, pk.reviewed, text + " ", score + 1))
            .rejects.toBeDefined();
    });

    it("FindReview correctly finds a review, not if non-existent", async () => {
        // Prepares a review primary key, text and score
        const pk: ReviewPK = await QuickReadyReview();
        const text: string = "SOME TEXT 2";
        const score: number = 7;

        // Publishes several unrelated reviews to fill database
        for (var i = 0; i < 10; i++)
            await QuickPublishReview(await QuickReadyReview());

        // Fails, not yet published
        await expect(ReviewService.FindReview(pk.reviewer, pk.reviewed)).rejects.toBeDefined();

        // Publishes the reivew
        await ReviewService.PublishReview(pk.reviewer, pk.reviewed, text, score);

        // Finds that review, checks its data against expected values
        const review: ReviewFull = await ReviewService.FindReview(pk.reviewer, pk.reviewed);
        CheckReviewAux(review, pk, text, score);
    });

    it("UpdateReview correctly updates a review, not if non-existent", async () => {
        // Prepares a review primary key, text and score
        const pk: ReviewPK = await QuickReadyReview();
        const newText: string = "NEW TEXT";
        const newScore: number = 8;

        // Fails, not yet published
        await expect(ReviewService.UpdateReview(pk.reviewer + ".....", pk.reviewed, newText, newScore)).rejects.toBeDefined();

        // Publishes the review
        await ReviewService.PublishReview(pk.reviewer, pk.reviewed, "notext", 7);

        // Updates the review and checks its data against expected values
        const review: ReviewFull = await ReviewService.UpdateReview(pk.reviewer, pk.reviewed, newText, newScore);
        CheckReviewAux(review, pk, newText, newScore);
    });

    it("RemoveReview correctly removes a review, not if non-existent", async () => {
        // Prepares a review primary key, text and score
        const pk: ReviewPK = await QuickReadyReview();
        const text: string = "texttexttext";
        const score: number = 3;

        // Fails, not yet published
        await expect(ReviewService.RemoveReview(pk.reviewer, pk.reviewed)).rejects.toBeDefined();

        // Publishes the review
        await ReviewService.PublishReview(pk.reviewer, pk.reviewed, text, score);

        // Removes the review and checks its previous data against expected values
        const review: ReviewFull = await ReviewService.RemoveReview(pk.reviewer, pk.reviewed);
        CheckReviewAux(review, pk, text, score);
    });

    it("GetReviewsByGame finds all reviews on a given game", async () => {
        // Creates several games, users and reviews
        const game: GameFull = await CreateGame();
        for (var i = 0; i < 5; i++) {
            await CreateGame();
            await AccountService.RegisterUser("user" + i, "", "12345678", `username${i}@gmail.com`);
            await ReviewService.PublishReview("user" + i, game.gameID, "" + i, i);
        }

        // Checks whether GetReviewsByGame can find all reviews to the first game
        const reviewArr: ReviewFull[] = await ReviewService.GetReviewsByGame(game.gameID);
        reviewArr.forEach(review => {
            expect(review).not.toBeNull();
            expect(review.reviewer).toBe("user" + review.text)
            expect(review.reviewed).toBe(game.gameID);
            expect(review.score + "").toBe(review.text)
        });
    });

    it("GetReviewsByUser finds all reviews on a given user", async () => {
        // Creates several games, a user and their reviews to the games
        const username: string = await QuickRegisterUser();
        const games: number[] = [];
        for (var i = 0; i < 10; i++) {
            await QuickRegisterUser();
            games.push((await CreateGame()).gameID);
            await ReviewService.PublishReview(username, games[i], "" + i, i);
        }
        
        // Checks whether GetReviewsByUser can find all reviews by the user
        const reviewArr: ReviewFull[] = await ReviewService.GetReviewsByUser(username);
        reviewArr.forEach(review => {
            expect(review).not.toBeNull();
            expect(review.reviewer).toBe(username);
            expect(games.includes(review.reviewed)).toBeTruthy();
            expect(review.text).toBe(review.score + "")
        });
    });    
});
