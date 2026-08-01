import {beforeEach, describe, expect, test} from "vitest";
import db from "../model/connection.ts";
import Account from "../model/Account/account.ts";
import {UpgradeType} from "../model/UpgradeType.ts";
import ddl from "../../create-tables.sql?raw";

describe("Player upgrades", () => {

    beforeEach(async () => {
        // Give every test a fresh database
        await db().exec(`
            DROP SCHEMA IF EXISTS public CASCADE;
            CREATE SCHEMA public;
        `);

        // Recreate the tables and upgrade catalog
        await db().exec(ddl);
    });

    test("Can purchase the advisor upgrade", async () => {
        const account = await Account.createAccount("kate", "password123");
        const player = account.player;

        // First purchase
        const firstPrice = player.findPrice(UpgradeType.FinancialAdvisor);
        player.buyPower = firstPrice;

        player.purchaseByName(UpgradeType.FinancialAdvisor);

        expect(player.findUpgradeLevel(UpgradeType.FinancialAdvisor)).toBe(1);

        // Second purchase
        const secondPrice = player.findPrice(UpgradeType.FinancialAdvisor);
        player.buyPower = secondPrice;

        player.purchaseByName(UpgradeType.FinancialAdvisor);

        expect(player.findUpgradeLevel(UpgradeType.FinancialAdvisor)).toBe(2);
    });

    test("Can purchase the employer upgrade", async () => {
        const account = await Account.createAccount("kate", "password123");
        const player = account.player;

        // First purchase
        const firstPrice = player.findPrice(UpgradeType.Employer);
        player.buyPower = firstPrice;

        player.purchaseByName(UpgradeType.Employer);

        expect(player.findUpgradeLevel(UpgradeType.Employer)).toBe(1);

        // Second purchase
        const secondPrice = player.findPrice(UpgradeType.Employer);
        player.buyPower = secondPrice;

        player.purchaseByName(UpgradeType.Employer);

        expect(player.findUpgradeLevel(UpgradeType.Employer)).toBe(2);
    });

});