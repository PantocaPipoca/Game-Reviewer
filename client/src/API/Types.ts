export type UserData = {
    displayName: string;
    gender: string | null;
    bio: string | null;
};

export type UserPublic = {
    accountName: string;
    isPrivate: boolean;
    userData: UserData | null;
    createdAt: string | null;
};

export type AuthResponse = UserPublic & {
    token: string;
};

export type GameFull = {
    gameID: number;
    gameName: string;
    metadata: object;
};

export type GameSearchResult = {
    id: number;
    name: string;
    cover?: string;
};

export type ReviewFull = {
    reviewer: string;
    reviewed: number;
    text: string;
    score: number;
    createdAt: string;
    updatedAt: string;
};

export type CommentFull = {
    id: string; // BigInt serialized as string
    commentator: string;
    reviewer: string;
    reviewed: number;
    text: string;
    createdAt: string;
    updatedAt: string;
};

export type FollowerFull = {
    follows: string;
    followed: string;
    accepted: boolean;
    createdAt: string;
    updatedAt: string;
};

export type LikeShort = {
    liker: string;
    reviewer: string;
    reviewed: number;
    value: boolean;
};
