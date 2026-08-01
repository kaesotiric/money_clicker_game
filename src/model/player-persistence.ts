import Player from "./player.ts";
import Upgrade from "./upgrade.ts";
import Building from "./building.ts";
import db from "./connection.ts";
import { UpgradeType } from "./UpgradeType.ts";

import UnknownUpgradeTypeError
    from "./ErrorMethods/UnknownUpgradeTypeError.ts";

import NoPLayerFoundError
    from "./ErrorMethods/NoPlayerFoundError.ts";

export default class PlayerPersistence {
    #player: Player;

    constructor(player: Player) {
        this.#player = player;
    }


    /**
     * Saves the player's buy power and current click amount.
     */
    public async savePlayer(): Promise<number> {
        const results = await db().query<{
            id: number;
        }>(
            `
                UPDATE player
                SET
                    buypower = $1,
                    curr_click = $2
                WHERE account = $3
                    RETURNING id, buypower, curr_click;
            `,
            [
                this.#player.buyPower,
                this.#player.currClick,
                this.#player.account.username
            ]
        );

        if (results.rows.length === 0) {
            throw new NoPLayerFoundError();
        }

        return results.rows[0].id;
    }

    /**
     * Saves a regular upgrade belonging to the player.
     */
    public async saveUpgrade(
        upgrade: Upgrade,
        playerId: number
    ): Promise<void> {
        const results = await db().query(
            `
                UPDATE upgrade_inventory
                SET
                    upgrade_level = $1,
                    upgrade_production = $2,
                    buypower_cost = $3
                WHERE player_id = $4
                  AND upgrade_name = $5;
            `,
            [
                upgrade.upgradeLevel,
                upgrade.productionValue,
                upgrade.buyPowerCost,
                playerId,
                upgrade.upgradeName
            ]
        );

        if (results.affectedRows === 0) {
            throw new Error(
                "Upgrade was not found in the player's inventory."
            );
        }
    }

    /**
     * Saves a building belonging to the player.
     */
    public async saveBuilding(
        building: Building,
        playerId: number
    ): Promise<void> {
        const upgradeResult = await db().query(
            `
                UPDATE upgrade_inventory
                SET
                    upgrade_level = $1,
                    upgrade_production = $2,
                    buypower_cost = $3
                WHERE player_id = $4
                  AND upgrade_name = $5;
            `,
            [
                building.upgradeLevel,
                building.productionValue,
                building.buyPowerCost,
                playerId,
                building.upgradeName
            ]
        );

        if (upgradeResult.affectedRows === 0) {
            throw new Error(
                "Upgrade was not found in the player's inventory."
            );
        }

        const buildingResult = await db().query(
            `
                UPDATE buildings
                SET interval_speed = $1
                WHERE upgrade_id = (
                    SELECT id
                    FROM upgrade_inventory
                    WHERE player_id = $2
                      AND upgrade_name = $3
                );
            `,
            [
                building.intervalSpeed,
                playerId,
                building.upgradeName
            ]
        );

        if (buildingResult.affectedRows === 0) {
            throw new Error(
                "Building was not found in the buildings table."
            );
        }
    }

    /**
     * Loads the player's regular upgrades.
     */
    public async loadUpgrade(): Promise<void> {
        const results = await db().query<{
            id: number;
            upgrade_name: string;
            upgrade_level: number;
            upgrade_production: number;
            buypower_cost: number;
            player_id: number;
        }>(
            `
                SELECT
                    id,
                    upgrade_name,
                    upgrade_level,
                    upgrade_production,
                    buypower_cost,
                    player_id
                FROM upgrade_inventory
                WHERE player_id = $1
                  AND upgrade_name IN (
                    SELECT name
                    FROM upgrade_catalog
                    WHERE LOWER(TRIM(upgrade_kind))
                        <> 'building'
                )
                ORDER BY id;
            `,
            [this.#player.id]
        );

        // const upgrades = new Array<Upgrade>();
        //
        // for (const row of results.rows) {
        //     const upgradeType =
        //         PlayerPersistence.#toUpgradeType(
        //             row.upgrade_name
        //         );
        //
        //     const loadedUpgrade = new Upgrade(
        //         upgradeType,
        //         row.upgrade_level,
        //         row.upgrade_production,
        //         row.buypower_cost
        //     );
        //
        //     upgrades.push(loadedUpgrade);
        // }
        //
        // this.#player.upgrades = upgrades;

        const upgrades: Upgrade[] = [];

        for (const row of results.rows) {
            const upgradeType = PlayerPersistence.#toUpgradeType(row.upgrade_name);

            const loadedUpgrade = new Upgrade(
                upgradeType,
                row.upgrade_level,
                row.upgrade_production,
                row.buypower_cost
            );

            upgrades.push(loadedUpgrade);
        }

        this.#player.upgrades = upgrades;
    }

    /**
     * Loads the player's buildings.
     */
    public async loadBuildings(): Promise<void> {
        const results = await db().query<{
            id: number;
            upgrade_name: string;
            upgrade_level: number;
            upgrade_production: number;
            buypower_cost: number;
            player_id: number;
        }>(
            `
                SELECT
                    id,
                    upgrade_name,
                    upgrade_level,
                    upgrade_production,
                    buypower_cost,
                    player_id
                FROM upgrade_inventory
                WHERE player_id = $1
                  AND upgrade_name IN (
                    SELECT name
                    FROM upgrade_catalog
                    WHERE upgrade_kind = 'BUILDING'
                )
                ORDER BY id;
            `,
            [this.#player.id]
        );

        const buildings = new Array<Building>();

        for (const row of results.rows) {
            const intervalResult = await db().query<{
                interval_speed: number;
            }>(
                `
                    SELECT interval_speed
                    FROM buildings
                    WHERE upgrade_id = $1;
                `,
                [row.id]
            );

            if (intervalResult.rows.length === 0) {
                throw new Error(
                    `Building information was not found for ${row.upgrade_name}.`
                );
            }

            const intervalSpeed =
                intervalResult.rows[0].interval_speed;

            const upgradeType =
                PlayerPersistence.#toUpgradeType(
                    row.upgrade_name
                );

            const loadedBuilding = new Building(
                upgradeType,
                row.upgrade_level,
                row.upgrade_production,
                row.buypower_cost,
                intervalSpeed
            );

            buildings.push(loadedBuilding);
        }

        this.#player.buildings = buildings;

        console.log(
            "Loaded buildings:",
            this.#player.buildings
        );
    }

    /**
     * Loads a player using the account username.
     */
    static async getPlayerByAccount(
        username: string
    ): Promise<Player | null> {
        const results = await db().query<{
            id: number;
            playername: string;
            buypower: number;
            curr_click: number;
            account: string;
        }>(
            `
                SELECT
                    id,
                    playername,
                    buypower,
                    curr_click,
                    account
                FROM player
                WHERE account = $1;
            `,
            [username]
        );

        const row = results.rows[0];

        if (!row) {
            return null;
        }

        const player = new Player(row.playername);

        player.id = row.id;
        player.buyPower = row.buypower;
        player.currClick = row.curr_click;

        const persistence =
            new PlayerPersistence(player);

        await persistence.loadUpgrade();
        await persistence.loadBuildings();

        // Restart building timers for the loaded player.
        player.startBuildingAutoClickers();

        return player;
    }

    /**
     * Converts a database upgrade name into an UpgradeType.
     */
    static #toUpgradeType(
        name: string
    ): UpgradeType {
        let upgradeType: UpgradeType;

        if (name === "Financial Advisor") {
            upgradeType =
                UpgradeType.FinancialAdvisor;
        } else if (name === "Employer") {
            upgradeType =
                UpgradeType.Employer;
        } else if (name === "Royal Mint") {
            upgradeType =
                UpgradeType.RoyalMint;
        } else if (name === "Banker") {
            upgradeType =
                UpgradeType.Banker;
        } else {
            throw new UnknownUpgradeTypeError();
        }

        return upgradeType;
    }
    static async initializeBuildings(
        playerId: number
    ): Promise<void> {
        await db().query(
            `
            INSERT INTO buildings (
                upgrade_id,
                interval_speed
            )
            SELECT
                upgrade_inventory.id,
                (
                    SELECT base_interval_speed
                    FROM upgrade_catalog
                    WHERE name =
                        upgrade_inventory.upgrade_name
                )
            FROM upgrade_inventory
            WHERE player_id = $1
              AND upgrade_name IN (
                  SELECT name
                  FROM upgrade_catalog
                  WHERE upgrade_kind = 'BUILDING'
                    AND base_interval_speed IS NOT NULL
              )
            ON CONFLICT (upgrade_id) DO NOTHING;
        `,
            [playerId]
        );
    }
}