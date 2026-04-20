import { describe, it, expect } from "@jest/globals";
import { CommentFull, CommentShort, ReviewPK } from "../../../src/types/Types";
import { createGame, quickRegisterUser } from "../helper/helper";
import { ReviewRepository } from "../../../src/Repository/ReviewRepository";
import { CommentRepository } from "../../../src/Repository/CommentRepository";

describe("CommentRepository (integration)", () => {
    // Auxiliary function, inserts review
    async function insertReviewAndComment(comment: string): Promise<CommentFull> {
        const reviewer: string = await quickRegisterUser();
        const reviewed: number = (await createGame()).gameID;
        await ReviewRepository.insertReview({ reviewer, reviewed, text: "", score: 2, platforms: [], hoursPlayed: 0 });
        const commentator: string = await quickRegisterUser();
        return await CommentRepository.insertComment({
            reviewer,
            reviewed,
            commentator,
            text: comment,
        } as CommentShort);
    }

    // Auxiliary function, checks a comment's data against expected values
    function compareCommentAux(comment1: CommentFull | null, comment2: CommentFull, text: string): void {
        expect(comment1).not.toBeNull();
        expect(comment1?.reviewer).toBe(comment2.reviewer);
        expect(comment1?.reviewed).toBe(comment2.reviewed);
        expect(comment1?.commentator).toBe(comment2.commentator);
        expect(comment1?.text).toBe(text);
        expect(comment1?.id).toBe(comment2.id);
    }

    it("Inserts and selects a comment", async () => {
        // Inserts comment
        const text: string = "TEXT TEXT";
        const comment: CommentFull = await insertReviewAndComment(text);

        // Finds comment and checks
        const found: CommentFull | null = await CommentRepository.selectComment(comment.id);
        compareCommentAux(found, comment, text);
    });

    it("Inserts and updates a comment", async () => {
        // Inserts comment
        const comment: CommentFull = await insertReviewAndComment("text");

        // Updates comment and checks
        const text: string = "TEXT TEXT 2";
        const found: CommentFull = await CommentRepository.updateComment(comment.id, text);
        compareCommentAux(found, comment, text);
    });

    it("Inserts and deletes a comment", async () => {
        // Inserts comment
        const text: string = "TEXT TEXT 3";
        const comment: CommentFull = await insertReviewAndComment(text);

        // Deletes comment and checks
        const found: CommentFull = await CommentRepository.deleteComment(comment.id);
        compareCommentAux(found, comment, text);
    });

    it("SelectCommentsOfSameReview finds all comments on a review", async () => {
        // Insert review
        const review: ReviewPK = {
            reviewer: await quickRegisterUser(),
            reviewed: (await createGame()).gameID,
        };
        await ReviewRepository.insertReview({
            reviewer: review.reviewer,
            reviewed: review.reviewed,
            text: "",
            score: 5,
            platforms: [],
            hoursPlayed: 0,
        });

        // Insert some useless reviews
        for (var i = 0; i < 4; i++) await insertReviewAndComment("");

        // Creates several commentators
        const commentators: string[] = [];
        for (var i = 0; i < 5; i++) {
            commentators.push(await quickRegisterUser());
            await CommentRepository.insertComment({
                reviewer: review.reviewer,
                reviewed: review.reviewed,
                commentator: commentators[i],
                text: i + "",
            } as CommentShort);
        }

        // Finds all comments on the first review
        const comments: CommentFull[] = await CommentRepository.selectCommentsOfSameReview(review);
        comments.forEach((c) => {
            expect(c.reviewer).toBe(review.reviewer);
            expect(c.reviewed).toBe(review.reviewed);
            expect(commentators.includes(c.commentator)).toBeTruthy();
        });
    });

    it("SelectCommentsOfSameUser", async () => {
        // Insert several reviews from different users
        const reviews: ReviewPK[] = [];
        for (var i = 0; i < 15; i++) {
            const reviewer: string = await quickRegisterUser();
            const reviewed: number = (await createGame()).gameID;
            await ReviewRepository.insertReview({
                reviewer,
                reviewed,
                text: "",
                score: 5,
                platforms: [],
                hoursPlayed: 0,
            });
            reviews.push({ reviewer, reviewed } as ReviewPK);
        }

        // Makes several comments from one user
        const target: string = await quickRegisterUser();
        const comments: CommentFull[] = [];
        reviews.forEach(async (r) =>
            comments.push(
                await CommentRepository.insertComment({
                    reviewer: r.reviewer,
                    reviewed: r.reviewed,
                    commentator: target,
                    text: "",
                })
            )
        );

        // Finds all comments from the same user
        const found: CommentFull[] = await CommentRepository.selectCommentsOfSameUser(target);
        found.forEach((c) => {
            expect(reviews.includes({ reviewer: c.reviewer, reviewed: c.reviewed } as ReviewPK)).toBeTruthy();
            expect(c.commentator).toBe(target);
            expect(comments.includes(c)).toBeTruthy();
        });
    });
});
