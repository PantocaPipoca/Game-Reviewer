import {prisma} from "../prisma"
import {ReviewResponse} from "../types/Types"


// Throws if either the user or the game don't exist
async function CheckUserAndGame(accountName: string, gameName: string): Promise<void> {
}

// Finds a review given a user and a game
async function FetchReview(accountName: string, gameName: string): Promise<void> {
}

export class ReviewService {
    static async FindReview(accountName: string, gameName: string): Promise<void> {
    }

    static async PublishReview(accountName: string, gameName: string, text: string, score: number): Promise<void> {
    }

    static async AlterReview(accountName: string, gameName: string, text?: string, score?: number): Promise<void> {
    }

    static async RemoveReview(accountName: string, gameName: string): Promise<void> {
    }

    static async GetReviewsByGame(gameName: string): Promise<void> {
    }

    static async GetReviewsByUser(accountName: string): Promise<void> {
    }

    // TODO Later
    static async GetRecentReviews(gameName: string): Promise<void> {
    }
}
