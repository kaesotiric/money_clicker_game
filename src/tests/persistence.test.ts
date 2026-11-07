import {beforeEach, describe, expect, test} from "vitest";
import db from "../model/connection.ts";
import Account from "../model/Account/account.ts";
import PlayerPersistence from "../model/player-persistence.ts";
import ddl from "../../create-tables.sql?raw";
import {UpgradeType} from "../model/UpgradeType.ts";

describe("PlayerPersistence", () => {

    beforeEach(async () => {
        // New db
        await db().exec(`
            DROP SCHEMA IF EXISTS public CASCADE;
            CREATE SCHEMA public;
        `);

        // Recreate all the tables
        await db().exec(ddl);
    });

    test("Saves the player's buy power", async () => {
        const account = await Account.createAccount("kate", "password123");

        account.player.buyPower = 100;

        const persistence = new PlayerPersistence(account.player);

        await persistence.savePlayer();

        const results = await db().query<{
            buypower: number;
        }>(
            `
                SELECT buypower
                FROM player
                WHERE id = $1;
            `,
            [account.player.id]
        );

        expect(results.rows[0].buypower).toBe(100);
    });

    test("Loads the player's upgrades", async () => {
        const account = await Account.createAccount("kate", "password123");

        // Financial Advisor and Employer
        expect(account.player.upgrades.length).toBe(2);
    });

    test("Returns null when a player does not exist", async () => {
        const player = await PlayerPersistence.getPlayerByAccount("unknown-user");

        expect(player).toBeNull();
    });
    test("Saves the player's upgrade", async () => {
        const account = await Account.createAccount("kate", "password123");

        // Give the player enough money to purchase the Employer
        account.player.buyPower = 1000;

        const purchasedUpgrade = account.player.purchaseByName(UpgradeType.Employer);

        if (purchasedUpgrade === null) {
            throw new Error("Employer was not purchased");
        }

        const persistence = new PlayerPersistence(account.player);
        await persistence.saveUpgrade(purchasedUpgrade, account.player.id);

        const results = await db().query<{
            upgrade_level: number;
            buypower_cost: number;
        }>(
            `
            SELECT upgrade_level, buypower_cost
            FROM upgrade_inventory
            WHERE player_id = $1
              AND upgrade_name = $2;
        `,
            [account.player.id, UpgradeType.Employer]
        );

        expect(results.rows[0].upgrade_level).toBe(1);
        expect(results.rows[0].buypower_cost).toBe(purchasedUpgrade.buyPowerCost);
    });
    test("Loads a saved player by account", async () => {
        const account = await Account.createAccount("kate", "password123");

        account.player.buyPower = 250;

        const persistence = new PlayerPersistence(account.player);
        await persistence.savePlayer();

        const loadedPlayer = await PlayerPersistence.getPlayerByAccount("kate");

        expect(loadedPlayer).not.toBeNull();
        expect(loadedPlayer?.name).toBe("kate");
        expect(loadedPlayer?.buyPower).toBe(250);
        expect(loadedPlayer?.upgrades.length).toBe(2);
        expect(loadedPlayer?.buildings.length).toBe(2);
    });

    test("Saves the player's building", async () => {
        const account = await Account.createAccount("kate", "password123");

        const building = account.player.buildings.find((building) => building.upgradeName === UpgradeType.RoyalMint);

        if (building === undefined) {
            throw new Error("Royal Mint was not found");
        }

        building.increaseLevel();
        building.updateBuyPowerCost();

        const persistence = new PlayerPersistence(account.player);
        await persistence.saveBuilding(building, account.player.id);

        const results = await db().query<{
            upgrade_level: number;
            buypower_cost: number;
        }>(
            `
            SELECT upgrade_level, buypower_cost
            FROM upgrade_inventory
            WHERE player_id = $1
              AND upgrade_name = $2;
        `,
            [account.player.id, UpgradeType.RoyalMint]
        );

        expect(results.rows[0].upgrade_level).toBe(1);
        expect(results.rows[0].buypower_cost).toBe(building.buyPowerCost);
    });
});