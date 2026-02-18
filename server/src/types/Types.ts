import type { Prisma, User, Game, Review, Like, Comment, Follower } from "../generated/prisma/client";


export type UserFull = User;

export type UserShort = Omit<Omit<UserFull, "createdAt">, "updatedAt"> & {
    userData: Prisma.InputJsonValue
};

export type UserPK = string;



export type GameFull = Game;

export type GameShort = GameFull & {
    metadata: Prisma.InputJsonValue
};

export type GamePK = number;



export type ReviewFull = Review;

export type ReviewShort = Omit<Omit<ReviewFull, "createdAt">, "updatedAt">;

export type ReviewPK = {
    reviewer: UserPK;
    reviewed: GamePK;
};



export type LikeFull = Like;

export type LikeShort = Omit<Omit<LikeFull, "createdAt">, "updatedAt">;

export type LikePK = {
    liker: UserPK
    reviewer: UserPK;
    reviewed: GamePK;
};



export type CommentFull = Comment;

export type CommentShort = Omit<Omit<Omit<CommentFull, "createdAt">, "updatedAt">, "id">;

export type CommentPK = bigint;



export type FollowerFull = Follower;

export type FollowerShort = Omit<Omit<FollowerFull, "createdAt">, "updatedAt">;

export type FollowerPK = {
    follows: string;
    followed: string;
};



export interface UserType {
    accountName: string;
    passwordHash: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    userData: any;
}

export interface FollowerType {
    follows: string;
    followed: string;
    createdAt: Date;
    acceptedAt: Date;
    accepted: boolean;
}

export interface GameType {
    gameName: string;
    metadata: any;
}

export interface ReviewType {
    reviewer: string;
    reviewed: string;
    text: string;
    score: number;
    createdAt: Date;
    updatedAt: Date;
}
