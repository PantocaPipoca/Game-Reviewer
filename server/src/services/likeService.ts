import {StatusCodes} from "http-status-codes"
import {AppError} from "../utils/ErrorHandler"
import * as ErrorMessage from "../utils/ErrorMessage"

export class LikeService {
    static async GetLikesByReview(commentId: number): Promise<void> {
    }

    static async GetDislikesByReview(commentId: number): Promise<void> {
    }

    static async LikeReview(accountName: string, commentId: number): Promise<void> {
    }

    static async DislikeReview(accountName: string, commentId: number): Promise<void> {
    }

    static async RemoveLikeFromReview(accountName: string, commentId: number): Promise<void> {
    }

    static async RemoveDislikeFromReview(accountName: string, commentId: number): Promise<void> {
    }


    // TODO Later
    static async GetLikesByUser(accountName: string): Promise<void> {
    }
}