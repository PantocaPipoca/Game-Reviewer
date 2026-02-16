export type UserData = {
    displayName: string;
    isPrivate: boolean;
    gender: string | null;
    bio: string | null;
    // other fields can be added here
}

export type UserResponse = {
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
    reviewed: string;
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
    id: string;
    commentator: string;
    reviewer: string;
    reviewed: string;
    text: string;
    createdAt: Date;
    updatedAt: Date;
}

export type LikeResponse = {
    liker: string;
    reviewer: string;
    reviewed: string;
    value: boolean;
    createdAt: Date;
}

export type GameResponse = {
    id: number;
    metadata: any;  // define a metadata type later maybe
}