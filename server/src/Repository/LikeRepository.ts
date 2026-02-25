import { prisma } from "../prisma";
import { LikeFull, LikeShort, LikePK, ReviewPK, UserPK } from "../types/Types";

export class LikeRepository {

    /**
     * @description Selects a Like from the database
     * @param likePK primary key of Like
     * @returns a promise of the table entry which contains the given primary key, if nothing is found the promise resolves to null
    */
    public static SelectLike(likePK: LikePK): Promise<LikeFull | null> {
        return prisma.like.findUnique({
            where: { liker_reviewer_reviewed: likePK }
        });
    }

    /**
     * @description Inserts a Like in the database
     * @param like json with all fields of Like that need to be manually set
     * @returns a promise of the table entry which contains the full inserted Like
    */
    public static InsertLike(like: LikeShort): Promise<LikeFull> {
        return prisma.like.create({
            data: like
        });
    }

    /**
     * @description Updates a Like in the database with the primary key given in game, with the rest of the values given
     * @param like json with all fields of Like that need to be manually set
     * @returns a promise of the updated table entry of the Like with the corresponding primary key
    */
    public static UpdateLike(like: LikeShort): Promise<LikeFull> {
        const likePK: LikePK = {
            liker: like.liker,
            reviewer: like.reviewer,
            reviewed: like.reviewed
        }
        return prisma.like.update({
            where: { liker_reviewer_reviewed: likePK },
            data: { value: like.value }
        });
    }

    /**
     * @description Deletes a Like from the database
     * @param likePK primary key of Like
     * @returns a promise of the deleted entry
    */
    public static DeleteLike(likePK: LikePK): Promise<LikeFull> {
        return prisma.like.delete({
            where: { liker_reviewer_reviewed: likePK }
        });
    }



    /**
     * @description returns the amount of likes or dislikes in a Review
     * @param reviewPK primary key of the Review which we want to count the likes or dislikes
     * @param toCount if true counts the likes, if false counts the dislikes
     * @returns a promise of the number of likes or dislikes
    */
    public static CountLikesOrDislikesOfReview(reviewPK: ReviewPK, toCount: boolean): Promise<number> {
        return prisma.like.count({
            where: {
                review: reviewPK,
                value: toCount
            }
        });
    }

    /**
     * @description Selects all likes or dislikes of a User, may be useful debug info
     * @param userPK primary key of the User which we want to get the likes or dislikes
     * @returns a promise of the array of likes or dislikes of that User
    */
    public static SelectAllLikesOfUser(userPK: UserPK): Promise<LikeFull[]> {
        return prisma.like.findMany({
            where: { liker: userPK }
        });
    }

}
