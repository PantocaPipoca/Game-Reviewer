import type { Prisma, User, Game, Review, Like, Comment, Follower } from "../generated/prisma/client";


// ===================== User Types =====================

export type UserData = {
    displayName: string;
    gender: string | null;
    bio: string | null;
    // other fields can be added here
}

export type UserFull = User;

export type UserShort = Omit<UserFull, "createdAt" | "updatedAt" | "userData"> & {
    userData: Prisma.InputJsonValue
};

export type UserPublic = Omit<UserFull, "passwordHash" | "email" | "updatedAt" | "createdAt" | "userData"> & {
    userData: UserData | null,
    createdAt: Date | null  
};

export type UserPK = string;

export type AuthResponse = 
    UserPublic & 
    {
        token: string;
    }


// ========================== Game Types =====================

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



// ===================== Reaction Types =====================

export type LikeFull = Like;

export type LikeShort = Omit<Omit<LikeFull, "createdAt">, "updatedAt">;

export type LikePK = {
    liker: UserPK
    reviewer: UserPK;
    reviewed: GamePK;
};



// ===================== Comment Types =====================

export type CommentFull = Comment;

export type CommentShort = Omit<Omit<Omit<CommentFull, "createdAt">, "updatedAt">, "id">;

export type CommentPK = bigint;


// ===================== Follower Types =====================

export type FollowerFull = Follower;

export type FollowerShort = Omit<Omit<FollowerFull, "createdAt">, "updatedAt">;

export type FollowerPK = {
    follows: string;
    followed: string;
};