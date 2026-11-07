import {beforeEach, describe, expect, test} from "vitest";
import db from "../model/connection.ts";
import Account from "../model/Account/account.ts";
import DuplicateUserNameError from "../model/ErrorMethods/DuplicateUserNameError.ts";
import ddl from "../../create-tables.sql?raw";

describe("Account", () => {

    beforeEach(async () => {
        // New db
        await db().exec(`
            DROP SCHEMA IF EXISTS public CASCADE;
            CREATE SCHEMA public;
        `);

        // Recreate all the tables
        await db().exec(ddl);
    });
    test("Returns null when username does not exist", async () => {
        const account = await Account.login("unknown", "password123");

        expect(account).toBeNull();
    });
    test("Creates an account", async () => {
        const account = await Account.createAccount("kate", "password123");

        expect(account.username).toBe("kate");
        expect(account.player.name).toBe("kate");
    });

    test("Logs in with the correct password", async () => {
        await Account.createAccount("kate", "password123");

        const account = await Account.login("kate", "password123");

        expect(account).not.toBeNull();
        expect(account?.username).toBe("kate");
    });

    test("Returns null for an incorrect password", async () => {
        await Account.createAccount("kate", "password123");

        const account = await Account.login("kate", "wrongPassword");

        expect(account).toBeNull();
    });

    test("Returns null when username does not exist", async () => {
        const account = await Account.login("unknown", "password123");

        expect(account).toBeNull();
    });
    test("Does not allow duplicate usernames", async () => {
        await Account.createAccount("kate", "password123");

        await expect(Account.createAccount("kate", "newPassword")).rejects.toBeInstanceOf(DuplicateUserNameError);
    });

});
