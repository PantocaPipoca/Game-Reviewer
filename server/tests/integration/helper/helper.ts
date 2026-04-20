import bcrypt from "bcrypt";
import request from "supertest";
import type { Express } from "express";
import { StatusCodes } from "http-status-codes";
import type { UserPK, AuthResponse, GameFull } from "../../../src/types/Types";
import { PRISMA } from "../../../src/Prisma";
import { AccountService } from "../../../src/services/AccountService";
import { UserRepository } from "../../../src/Repository/UserRepository";
import { GameRepository } from "../../../src/Repository/GameRepository";
import { FollowerRepository } from "../../../src/Repository/FollowerRepository";
import { ReviewRepository } from "../../../src/Repository/ReviewRepository";
import { CommentRepository } from "../../../src/Repository/CommentRepository";
import { LikeRepository } from "../../../src/Repository/LikeRepository";

export async function register(
    app: Express,
    accountName: UserPK,
    displayName: string,
    password: string,
    email: string
): Promise<AuthResponse> {
    return (await AccountService.registerUser(accountName, displayName, password, email, false)) as AuthResponse;
    // const res = await request(app)
    //     .post("/api/users")
    //     .send({ accountName, displayName, password, email })
    //     .expect(StatusCodes.CREATED);

    // return res.body.data as AuthResponse;
}

// Username-email pair utility
export interface UserMicro {
    accountName: string;
    email: string;
}

// Prepares a username and email
export function makeSomeUser(): UserMicro {
    const accountName: string = `svc_login_${Date.now()}`;
    const email: string = `${accountName}@test.com`;
    return { accountName, email } as UserMicro;
}

// Short-hand for registering a user, for tests
export async function quickRegisterUser(): Promise<string> {
    const user: UserMicro = makeSomeUser();
    await AccountService.registerUser(user.accountName, "", "aaaaaaaa", user.email, false);
    return user.accountName;
}

// Short-hand for creating a game, for tests
export async function createGame(): Promise<GameFull> {
    return PRISMA.game.create({
        data: {
            gameID: Math.floor(Math.random() * 1000000),
            gameName: "game_" + Date.now(),
            metadata: {},
        },
    });
}
//
//
//
//
//
// new fast functions to create db elements
export function fastCreateUser(name: string) {
    return bcrypt.hash(name, 10).then((hash) => {
        return UserRepository.insertUser({
            accountName: name,
            passwordHash: hash,
            avatar: null,
            userData: {},
            isPrivate: false,
            email: `${name}@test.com`,
        });
    });
}

export function fastCreateUserAndValidate(name: string) {
    return fastCreateUser(name).then((user) => {
        return UserRepository.verify(user.accountName, user.emailValidation as number);
    });
}

export function fastCreateFollower(follows: string, followed: string, accepted: boolean) {
    return FollowerRepository.insertFollower({ follows, followed, accepted });
}

export function fastCreateGame(id: number) {
    return GameRepository.insertGame({
        gameID: id,
        gameName: `${id}`,
        metadata: {},
    });
}

export function fastCreateReview(reviewer: string, reviewed: number) {
    return ReviewRepository.insertReview({
        reviewer,
        reviewed,
        text: `${reviewer},${reviewed}`,
        score: 10,
        hoursPlayed: null,
        platforms: [],
    });
}

export function fastCreateComment(reviewer: string, reviewed: number, commentator: string) {
    return CommentRepository.insertComment({
        reviewer,
        reviewed,
        text: `${reviewer},${reviewed},,${commentator}`,
        commentator,
    });
}

export function fastCreateLike(reviewer: string, reviewed: number, liker: string) {
    return LikeRepository.insertLike({
        reviewer,
        reviewed,
        value: true,
        liker,
    });
}
