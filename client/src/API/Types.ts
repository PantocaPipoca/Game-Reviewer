// ===================== User Types =====================

export type UserData = {
    displayName: string;
    gender: string | null;
    bio: string | null;
};

export type UserPublic = {
    accountName: string;
    profilePic: string | null;
    isPrivate: boolean;
    createdAt: string;
    userData: UserData;
};

export type UserPrivate = {
    accountName: string;
    profilePic: string | null;
    isPrivate: boolean;
};

export type UserMe = {
    accountName: string;
    email: string;
    profilePic: string | null;
    isPrivate: boolean;
    createdAt: string;
    userData: UserData;
};

// Matches backend AuthResponse
export type AuthResponse = UserPublic & {
    token: string;
};

// ===================== Game Types =====================

export type GameFull = {
    id: number;
    name: string;
    metadata: unknown;
};

// Backend GameShort equivalent for search/UI usage
export type GameSearchResult = {
    id: number;
    name: string;
    cover?: string;
};

// ===================== Review Types =====================

export type ReviewFull = {
    reviewer: string;
    reviewed: number;
    text: string;
    score: number;
    createdAt: string;
    updatedAt: string;
};

export type ReviewShort = {
    reviewer: string;
    reviewed: number;
    text: string;
    score: number;
};

// ===================== Comment Types =====================

export type CommentFull = {
    id: string; // bigint serialized
    commentator: string;
    reviewer: string;
    reviewed: number;
    text: string;
    createdAt: string;
    updatedAt: string;
};

// Matches CommentShort
export type CommentShort = {
    commentator: string;
    reviewer: string;
    reviewed: number;
    text: string;
};

// ===================== Follower Types =====================

export type FollowerFull = {
    follows: string;
    followed: string;
    accepted: boolean;
    createdAt: string;
    updatedAt: string;
};

// Matches FollowerShort
export type FollowerShort = {
    follows: string;
    followed: string;
    accepted: boolean;
};

// ===================== Reaction Types =====================

export type LikeShort = {
    liker: string;
    reviewer: string;
    reviewed: number;
    value: boolean;
};

export type ReactionResponse = {
    likes: number;
    dislikes: number;
};

// ===================== Extra =====================

// Matches backend GameCover
export type GameCover = {
    id: number;
    name: string;
    cover: {
        id: number;
        alpha_channel: boolean;
        animated: boolean;
        game: number;
        height: number;
        image_id: string;
        url: string;
        width: number;
    };
};
