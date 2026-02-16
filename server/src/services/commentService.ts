import {StatusCodes} from "http-status-codes"
import {AppError} from "../utils/ErrorHandler"
import * as ErrorMessage from "../utils/ErrorMessage"

export class CommentService {
    static async GetCommentById(commentId: number): Promise<void> {
    }

    static async PublishComment(accountName: string, gameName: string, text: string): Promise<void> {
    }

    static async AlterComment(commentId: number, text: string): Promise<void> {
    }

    static async RemoveComment(commentId: number): Promise<void> {
    }
}