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

export type UserPublic = Omit<UserFull, "passwordHash" | "email" | "createdAt" | "updatedAt" | "userData"> & {
    userData: UserData | null,
    createdAt: Date | null
};

export type UserPrivate = Omit<UserPublic, "userData" | "createdAt">;

export type UserPK = string;

export type AuthResponse =
    UserPublic &
    {
        token: string;
    }


// ========================== Game Types =====================

export type GameFull = Game;

export type GameShort = Omit<GameFull, "metadata"> & {
    metadata: Prisma.InputJsonValue
};

export type GamePK = number;

// ========================== Review Types =====================

export type ReviewFull = Review;

export type ReviewShort = Omit<ReviewFull, "createdAt" | "updatedAt">;

export type ReviewPK = {
    reviewer: UserPK;
    reviewed: GamePK;
};



// ===================== Reaction Types =====================

export type LikeFull = Like;

export type LikeShort = Omit<LikeFull, "createdAt" | "updatedAt">;

export type LikePK = {
    liker: UserPK
    reviewer: UserPK;
    reviewed: GamePK;
};


export type ReactionResponse = {
    likes: number,
    dislikes: number,
};


// ===================== Comment Types =====================

export type CommentFull = Comment;

export type CommentShort = Omit<CommentFull, "createdAt" | "updatedAt" | "id">;

export type CommentPK = bigint;


// ===================== Follower Types =====================

export type FollowerFull = Follower;

export type FollowerShort = Omit<FollowerFull, "createdAt" | "updatedAt">;

export type FollowerPK = {
    follows: string;
    followed: string;
};