export interface RegisterType {
    accountName: string;
    displayName: string;
    password: string;
    email: string;
}

export interface LoginType {
    accountName: string;
    password: string;
}

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