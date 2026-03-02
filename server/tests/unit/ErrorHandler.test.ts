// tests/unit/utils/ErrorHandler.test.ts
import { describe, it, expect, jest } from "@jest/globals";
import { AsyncHandler, MakeSuccess } from "../../src/utils/ErrorHandler";

describe("utils/ErrorHandler (unit)", () => {
    it("MakeSuccess wraps the payload and calls res.status().json()", () => {
        
        // "Mocks": fake functions that record calls

        // Create a mock response the same way as a real response
        const res: any = {};
        res.status = jest.fn(() => res); // mock function
        res.json = jest.fn(() => res);   // mock function

        // call the function
        MakeSuccess(res, 201, { ok: true });

        // compares
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ status: "success", data: { ok: true } });
    });

    it("AsyncHandler forwards thrown/rejected errors to next()", async () => {
        const req: any = {};
        const res: any = {};
        const next = jest.fn(); // mock function

        const wrapped = AsyncHandler(async () => {
            throw new Error("boom");
        });

        await wrapped(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect((next.mock.calls[0][0] as Error).message).toBe("boom");
    });
});