import {describe, expect, test} from "vitest";
import Security from "../model/Account/security.ts";

describe("Security", () => {

    test("Hashes a password", async () => {
        const security = new Security();
        const hash = await security.hashPassword("password123");

        expect(hash).not.toBe("password123");
        expect(hash).toContain(":");
    });

    test("Verifies the correct password", async () => {
        const security = new Security();
        const hash = await security.hashPassword("password123");

        const matches = await security.verifyPassword("password123", hash);

        expect(matches).toBe(true);
    });

    test("Rejects an incorrect password", async () => {
        const security = new Security();
        const hash = await security.hashPassword("password123");

        const matches = await security.verifyPassword("wrongPassword", hash);

        expect(matches).toBe(false);
    });

    test("Rejects an invalid stored password", async () => {
        const security = new Security();

        const matches = await security.verifyPassword("password123", "invalid");

        expect(matches).toBe(false);
    });

});