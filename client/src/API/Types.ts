// ===================== User Types =====================

export type UserData = {
    displayName: string;
    gender: string | null;
    bio: string | null;
};

export type UserPublic = {
    accountName: string;
    avatar: string | null;
    isPrivate: boolean;
    createdAt: string;
    userData: UserData;
};

export type UserPrivate = {
    accountName: string;
    avatar: string | null;
    isPrivate: boolean;
};

export type UserMe = {
    accountName: string;
    email: string;
    avatar: string | null;
    isPrivate: boolean;
    createdAt: string;
    userData: UserData;
};

export type AuthResponse = UserPublic & {
    token: string;
};

// ===================== Game Types =====================

export type GameFull = {
    id: number;
    name: string;
    metadata: unknown;
};

export type GameSearchResult = {
    id: number;
    name: string;
    cover?: string;
};

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

export type BigGameCover = {
    id: number;
    name: string;
    cover?: { url?: string };
    genres?: { name: string }[];
    screenshots?: { url?: string }[];
    artworks?: { url?: string }[];
    involved_companies?: {
        developer: boolean;
        company?: { name: string };
    }[];
};

// ===================== Review Types =====================

export type ReviewFull = {
    reviewer: string;
    reviewed: number;
    text: string;
    score: number;
    hoursPlayed: number | null;
    platforms: string[];
    createdAt: string;
    updatedAt: string;
};

export type ReviewWithAvatar = ReviewFull & {
    user?: { avatar: string | null };
};

export type ReviewShort = {
    reviewer: string;
    reviewed: number;
    text: string;
    score: number;
    hoursPlayed?: number;
    platforms?: string[];
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

export type CommentShort = {
    commentator: string;
    reviewer: string;
    reviewed: number;
    text: string;
};

// ===================== Follower Types =====================

export type FollowerPublic = {
    follows: string;
    followed: string;
    accepted: boolean;
    createdAt: string;
    updatedAt: string;

    // match backend include structure
    followedUser?: {
        avatar: string | null;
    };

    followsUser?: {
        avatar: string | null;
    };
};

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

export type ReactionStateResponse = {
    value: boolean | null;
};

export type ReactionResponse = {
    likes: number;
    dislikes: number;
};
