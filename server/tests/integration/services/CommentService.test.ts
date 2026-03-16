import {describe, it, expect} from "@jest/globals";
import {ReviewPK, CommentFull} from '../../../src/types/Types';
import {QuickPublishReview, QuickReadyReview} from "./ReviewService.test";
import {CommentService} from '../../../src/services/CommentService';
import {QuickRegisterUser} from "../helper/helper";
import {CommentRepository} from "../../../src/Repository/CommentRepository";

describe("CommentService (integration)", () => {
    // Auxiliary function, checks a comment's data against expected values
    function CheckCommentAux(comment: CommentFull | null, commentator: string, id: bigint, review: ReviewPK, text: string): void {
        expect(comment).not.toBeNull();
        expect(comment?.commentator).toBe(commentator);
        expect(comment?.id).toBe(id);
        expect(comment?.reviewer).toBe(review.reviewer);
        expect(comment?.reviewed).toBe(review.reviewed);
        expect(comment?.text).toBe(text);
    }

    it("PublishComment correctly creates a comment, not if review doesn't exist", async () => {
        // Prepares a review and a commentator
        const pk: ReviewPK = await QuickReadyReview();
        const commentator: string = await QuickRegisterUser();
        const commentText: string = "Some comment";

        // Fails, review not yet published
        await expect(CommentService.PublishComment(commentator, pk.reviewer, pk.reviewed, commentText)).rejects.toBeDefined();

        // Publishes review and comment
        await QuickPublishReview(pk);
        const comment: CommentFull = await CommentService.PublishComment(commentator, pk.reviewer, pk.reviewed, commentText);
        CheckCommentAux(comment, commentator, comment.id, pk, commentText);

        // Finds the comment
        const dbCom: CommentFull | null = await CommentRepository.SelectComment(comment.id);
        CheckCommentAux(dbCom, commentator, comment.id, pk, commentText);
    });

    it("PublishComment can create multiple comments on a review", async () => {
        // Prepares a review and commentator
        const pk: ReviewPK = await QuickReadyReview();
        const commentator: string = await QuickRegisterUser();
        // Publishes review
        await QuickPublishReview(pk);
        
        // Publishes several comments from the same user
        for (var i = 0; i < 100; i++)
            await expect(CommentService.PublishComment(commentator, pk.reviewer, pk.reviewed, "")).resolves.toBeDefined();
    });

    it("EditComment correctly edits a comment, not if non-existent or commentator and user don't match", async () => {
        // Prepares a review and commentator
        const pk: ReviewPK = await QuickReadyReview();
        const commentator: string = await QuickRegisterUser();
        const commentText: string = "Some comment 2";
        // Publishes review
        await QuickPublishReview(pk);

        // Fails, comment not yet published
        await expect(CommentService.EditComment(commentator, BigInt(100000000), "")).rejects.toBeDefined();
        
        // Publishes comment
        const comment: CommentFull = await CommentService.PublishComment(commentator, pk.reviewer, pk.reviewed, commentText);
        // Fails, wrong user
        await expect(CommentService.EditComment("SomeUserThatIsNotThecommentator", comment.id, "")).rejects.toBeDefined();

        // Edits comment
        const newCommentText: string = "Some new comment";
        const edited: CommentFull = await CommentService.EditComment(commentator, comment.id, newCommentText);
        CheckCommentAux(edited, commentator, comment.id, pk, newCommentText);
        const dbCom: CommentFull | null = await CommentRepository.SelectComment(comment.id);
        CheckCommentAux(dbCom, commentator, comment.id, pk, newCommentText);
    });

    it("RemoveComment correctly deletes a comment, not if non-existent or commentator and user don't match", async () => {
        // Prepares a review and commentator
        const pk: ReviewPK = await QuickReadyReview();
        const commentator: string = await QuickRegisterUser();
        const commentText: string = "Some comment 3";

        // Publishes review and comment
        await QuickPublishReview(pk);
        const comment: CommentFull = await CommentService.PublishComment(commentator, pk.reviewer, pk.reviewed, commentText);

        // Fails, wrong user
        await expect(CommentService.RemoveComment("SomeUserThatIsNotThecommentator", comment.id)).rejects.toBeDefined();

        // Deletes comment
        const removed: CommentFull = await CommentService.RemoveComment(commentator, comment.id);
        CheckCommentAux(removed, commentator, comment.id, pk, commentText);

        // Fails, comment doesn't exist anymore
        await expect(CommentService.RemoveComment(commentator, comment.id)).rejects.toBeDefined();
    });

    it("GetComments correctly finds all comments for a review", async () => {
        // Publishes a review
        const pk: ReviewPK = await QuickReadyReview();
        await QuickPublishReview(pk);

        // Creates several commentators
        const commentatorToId: Map<string, bigint> = new Map();
        for (var i = 0; i < 20; i++) {
            const user: string = await QuickRegisterUser();
            const comment: CommentFull = await CommentService.PublishComment(user, pk.reviewer, pk.reviewed, i + "");
            commentatorToId.set(user, comment.id);
        }

        // Checks returned information from GetComments against expected values
        const response: CommentFull[] = await CommentService.GetComments(pk.reviewer, pk.reviewed);
        expect(response).not.toBeNull();
        expect(response.length).toBe(commentatorToId.size);
        response.forEach(c => {
            expect(c).not.toBeNull();
            expect(c.reviewer).toBe(pk.reviewer);
            expect(c.reviewed).toBe(pk.reviewed);
            expect(commentatorToId.has(c.commentator)).toBe(true);
            expect(commentatorToId.get(c.commentator)).toBe(c.id);
        });
    });
});
