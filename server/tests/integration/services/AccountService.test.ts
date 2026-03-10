import { describe, it, expect } from "@jest/globals";
import { prisma } from "../../../src/prisma";
import { AccountService } from "../../../src/services/AccountService";
import { AuthResponse } from "../../../src/types/Types";

// Jest docs: https://jestjs.io/docs/api

describe("AccountService (integration)", () => {
    it.todo("RegisterUser creates a user and returns token, not if duplicate");

    it.todo("AlterUser alters a user");

    it.todo("DeleteUser removes a user");
});