import request from "supertest";
import type { Express } from "express";
import { StatusCodes } from "http-status-codes";
import type { UserPK, AuthResponse, GameFull } from "../../../src/types/Types";
import { PRISMA } from "../../../src/Prisma";
import { AccountService } from "../../../src/services/AccountService";

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
