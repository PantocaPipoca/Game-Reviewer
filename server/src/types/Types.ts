import type { Prisma, User, Game, Review, Like, Comment, Follower } from "../generated/prisma/client";
export type UserData = {
    displayName: string;
    isPrivate: boolean;
    gender: string | null;
    bio: string | null;
    // other fields can be added here
}


    
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



export interface UserResponse {
    accountName: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    userData: any;
}

export type AuthResponse = 
    UserResponse & {
        token: string;
    }

export type ReviewResponse = {
    reviewer: string;
    reviewed: number;
    text: string;
    score: number;
    createdAt: Date;
    updatedAt: Date;
}


export type FollowerResponse = {
    follows: string;
    followed: string;
    accepted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type CommentResponse = {
    id: bigint;
    commentator: string;
    reviewer: string;
    reviewed: number;
    text: string;
    createdAt: Date;
    updatedAt: Date;
}

export type LikeResponse = {
    liker: string;
    reviewer: string;
    reviewed: number;
    value: boolean;
    createdAt: Date;
}

export type ReactionResponse = {
    likes: number;
    dislikes: number;
}

export type GameResponse = {
    id: number;
    metadata: any;  // define a metadata type later maybe
}