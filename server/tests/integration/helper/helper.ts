import request from "supertest";
import type { Express } from "express";
import { StatusCodes } from "http-status-codes";
import type { UserPK, AuthResponse } from "../../../src/types/Types";
import { prisma } from "../../../src/prisma";

export async function Register(
    app: Express,
    accountName: UserPK,
    displayName: string,
    password: string,
    email: string
): Promise<AuthResponse> {
    const res = await request(app)
        .post("/api/users")
        .send({ accountName, displayName, password, email })
        .expect(StatusCodes.CREATED);

    return res.body.data as AuthResponse;
}

export async function CreateGame() {
    return prisma.game.create({
        data: {
            gameID: Math.floor(Math.random() * 100000),
            gameName: "game_" + Date.now(),
            metadata: {},
        },
    });
}
