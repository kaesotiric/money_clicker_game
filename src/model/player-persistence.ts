import Player from "./player.ts";
import Upgrade from "./upgrade.ts";
import Building from "./building.ts";
import db from "./connection.ts";
import { UpgradeType } from "./UpgradeType.ts";
import UnknownUpgradeTypeError from "./ErrorMethods/UnknownUpgradeTypeError.ts";
import NoPlayerFoundError from "./ErrorMethods/NoPlayerFoundError.ts";
import UpgradeNotFoundError from "./ErrorMethods/UpgradeNotFoundError.ts";
import BuildingNotFoundError from "./ErrorMethods/BuildingNotFoundError.ts";

/**
 * Saves and loads player information from the database
 */
export default class PlayerPersistence {
    #player: Player;

    constructor(player: Player) {
        this.#player = player;
    }

    /**
     * Saves the player's buy power and click amount
     *
     * @return The ID of the saved player
     * @throws NoPLayerFoundError When the player is not found
     * Side effects: Updates the player table
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
        // No returned row means the player was not found
        if (results.rows.length === 0) {
            throw new NoPlayerFoundError();
        }

        return results.rows[0].id;
    }

    /**
     * Saves a regular upgrade owned by the player
     *
     * @param upgrade The upgrade being saved
     * @param playerId The ID of the player who owns the upgrade
     * @throws UpgradeNotFoundError When the upgrade is not found
     * Side effects: Updates the upgrade inventory table
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
            throw new UpgradeNotFoundError();
        }
    }


    /**
     * Saves a building owned by the player
     *
     * @param building The building being saved
     * @param playerId The ID of the player who owns the building
     * @throws BuildingNotFoundError When the building is not found
     * Side effects: Updates the upgrade inventory and buildings tables
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
            throw new UpgradeNotFoundError();

        }
        // The buildings table only stores information specific to buildings
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
            throw new BuildingNotFoundError();
        }
    }

    /**
     * Loads the player's regular upgrades
     *
     * Side effects: Replaces the player's regular upgrade array
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

        const upgrades: Upgrade[] = []; // Uses a new arr so previously loaded values are not duplicated

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

        this.#player.upgrades = upgrades; // This will replace the player's current list with the database values
    }

    /**
     * Loads the player's buildings
     *
     * @throws Error When a building is missing its interval information
     * Side effects: Replaces the player's building array
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

    public static async getPlayerByAccount(
        username: string
    ): Promise<Player | null> {
        let loadedPlayer: Player | null = null;

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

        // Only create the player when a matching row was found
        if (row !== undefined) {
            const player = new Player(row.playername);

            // Restore the player's saved values
            player.id = row.id;
            player.buyPower = row.buypower;
            player.currClick = row.curr_click;

            const persistence =
                new PlayerPersistence(player);

            // Load the upgrades that belong to the saved player
            await persistence.loadUpgrade();
            await persistence.loadBuildings();

            // Restart timers for buildings that were already purchased
            player.startBuildingAutoClickers();

            loadedPlayer = player;
        }

        return loadedPlayer;
    }


    /**
     * Converts a database upgrade name into an UpgradeType enum
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

    /**
     * Creates the extra database rows needed by building upgrades
     *
     * @param playerId The ID of the player receiving the buildings
     * Side effects: Adds rows to the buildings table
     */
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