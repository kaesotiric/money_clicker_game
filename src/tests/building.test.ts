// import {
//     afterEach,
//     beforeEach,
//     expect,
//     test,
//     vi
// } from "vitest";
//
// import Player from "../model/player.ts";
// import { UpgradeType } from "../model/UpgradeType.ts";
// import Building from "../model/building.ts";
//
// beforeEach(() => {
//     vi.useFakeTimers();
// });
//
// afterEach(() => {
//     vi.clearAllTimers();
//     vi.useRealTimers();
// });
//
// test("Can purchase the building upgrade", () => {
//     const player = new Player("test-player");
//
//     // First purchase
//     const firstPrice =
//         player.findPrice(UpgradeType.Banker);
//
//     expect(firstPrice).toBeGreaterThan(0);
//
//     player.updatedBuyPower = firstPrice;
//
//     const firstPurchase =
//         player.purchaseBuilding(UpgradeType.Banker);
//
//     expect(firstPurchase).not.toBeNull();
//
//     expect(
//         player.findUpgradeLevel(UpgradeType.Banker)
//     ).toBe(1);
//
//     // Second purchase
//     const secondPrice =
//         player.findPrice(UpgradeType.Banker);
//
//     expect(secondPrice).toBeGreaterThan(0);
//
//     player.updatedBuyPower = secondPrice;
//
//     const secondPurchase =
//         player.purchaseBuilding(UpgradeType.Banker);
//
//     expect(secondPurchase).not.toBeNull();
//
//     expect(
//         player.findUpgradeLevel(UpgradeType.Banker)
//     ).toBe(2);
// });





import {afterEach, beforeEach, describe, expect, test, vi} from "vitest";
import db from "../model/connection.ts";
import Account from "../model/Account/account.ts";
import {UpgradeType} from "../model/UpgradeType.ts";
import ddl from "../../create-tables.sql?raw";
import Building from "../model/building.ts";

describe("Player buildings", () => {

    beforeEach(async () => {
        // Give every test a fresh database
        await db().exec(`
            DROP SCHEMA IF EXISTS public CASCADE;
            CREATE SCHEMA public;
        `);

        // Recreate the tables and upgrade catalog
        await db().exec(ddl);

        // Prevent the building from creating a real running timer
        vi.useFakeTimers();
    });

    afterEach(() => {
        // Remove any auto-clicker timers created during the test
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    test("Can purchase the building upgrade", async () => {
        const account = await Account.createAccount("kate", "password123");
        const player = account.player;

        // First purchase
        const firstPrice = player.findPrice(UpgradeType.Banker);

        expect(firstPrice).toBeGreaterThan(0);

        player.updatedBuyPower = firstPrice;

        const firstPurchase = player.purchaseBuilding(UpgradeType.Banker);

        expect(firstPurchase).not.toBeNull();
        expect(player.findUpgradeLevel(UpgradeType.Banker)).toBe(1);

        // Second purchase
        const secondPrice = player.findPrice(UpgradeType.Banker);
        player.updatedBuyPower = secondPrice;

        const secondPurchase = player.purchaseBuilding(UpgradeType.Banker);

        expect(secondPurchase).not.toBeNull();
        expect(player.findUpgradeLevel(UpgradeType.Banker)).toBe(2);
    });

    test("Building produces repeatedly after each interval", () => {
        const building = new Building(UpgradeType.Banker, 1, 20, 100, 1000);

        const addBuyPower = vi.fn();

        building.startAutoClicker(addBuyPower);

        // Three intervals should cause three productions
        vi.advanceTimersByTime(3000);

        expect(addBuyPower).toHaveBeenCalledTimes(3);
    });
    test("Purchased building automatically produces buy power", () => {
        const building = new Building(UpgradeType.Banker, 1, 20, 100, 1000);

        const addBuyPower = vi.fn();

        building.startAutoClicker(addBuyPower);

        // The interval is 1s
        vi.advanceTimersByTime(1000);

        expect(addBuyPower).toHaveBeenCalledTimes(1);

        expect(addBuyPower).toHaveBeenCalledWith(
            building.calculateProduction(
                building.upgradeLevel
            )
        );
    });

});