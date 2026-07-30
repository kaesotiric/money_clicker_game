/**
 * Represents the player in the game
 * Stores the player's buy power, click amount and upgrades
 */

import assert from "../assertions.ts";
import type Listener from "./listener.ts";
import Upgrade from "./upgrade.ts";
import {UpgradeType} from "./UpgradeType.ts";
import db from "./connection.ts";
import type Account from "./Account/account.ts";

export default class Player {
    #name: string;
    #account: Account;
    #buyPower: number; // The current money or buy power the user has
    #currClick: number; // How much user earns per click
    #upgrades: Array<Upgrade>; // List of upgrades the user has
    #listeners: Array<Listener>;

    constructor(name: string) {
        this.#name = name;
        this.#currClick = 1;
        this.#buyPower = 0;
        this.#upgrades = new Array<Upgrade>();
        this.#listeners = new Array<Listener>();
        this.#fillArray(); // Initializes the player with all available upgrades at level 0
        this.#notifyAll();
        this.#checkMoney();
        this.#checkClick();
    }
    //Write a class static method that will get access to all players in the database
    //returns all players in the database, it promises to contain an array of players
    static async getAllPLayers(): Promise<Array<Player>> {
        const allPLayers = new Array<Player>();
        //
        let results = await db()
            .query<{playername: string}>("select playername from player"); // Asking PGLite to give us data from db
        // We then need to transform those rows into instances of Player

        results.rows.forEach((row) => {
            allPLayers.push(new Player(row.playername));
        })
        return allPLayers;
    }

    public static async create(name:string): Promise<Player>{
        return new Player(name);
        // await player.loadUpgrade();
        // await player.loadBuilding();
        // return player;
    }
    public async savePlayer(): Promise<number> {
        const results = await db().query<{ id: number }>(
            `
                UPDATE player
                SET
                    buypower = $1,
                    curr_click = $2
                WHERE account = $3
                    RETURNING id, buypower, curr_click;
            `,
            [
                this.#buyPower,
                this.#currClick,
                this.#account.username
            ]
        );

        if (results.rows.length === 0) {
            throw new Error("Player was not found in the database.");
        }

        return results.rows[0].id;
    }

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
            throw new Error("Upgrade was not found in the player's inventory.");
        }
    }

    public async loadUpgrade(playerId:number): Promise<void>{
        const results = await db().query<{
            id: number;
            upgrade_name: UpgradeType;
            upgrade_level: number;
            upgrade_production: number;
            buypower_cost: number;
            player: number;
        }>
        (`select id, upgrade_name, upgrade_level, upgrade_production, 
       buypower_cost, player 
        from upgrades where player = $1 
        order by id;`,
            [playerId]
        );
        // const upgrades:Upgrade[] = this.#upgrades;
        // for(const row of results.rows){
        //     const upgradeType: UpgradeType = this.#toUpgradeType(row.upgrade_name);
        //     upgrades.push(new Upgrade(upgradeType, row.upgrade_level, row.upgrade_production, row.buypower_cost))
        //
        //     }
        //     // upgrades.push(new Upgrade(upgradeType, row.upgrade_level, row.upgrade_production, row.buypower_cost))
        //
        // this.#upgrades = upgrades;

        const upgrades: Upgrade[] = this.#upgrades;

        for (const row of results.rows) {
            const upgradeType: UpgradeType =
                this.#toUpgradeType(row.upgrade_name);

            const index = upgrades.findIndex(
                (upgrade) => upgrade.upgradeName === upgradeType
            );

            const loadedUpgrade = new Upgrade(
                upgradeType,
                row.upgrade_level,
                row.upgrade_production,
                row.buypower_cost
            );

            if (index >= 0) {
                upgrades[index] = loadedUpgrade;
            } else {
                upgrades.push(loadedUpgrade);
            }
        }

        this.#upgrades = upgrades;
    }
    static async getPlayerByAccount(username:string): Promise<Player | null>{
        const results = await db().query<{
            id: number;
            playername: string;
            buypower: number;
            curr_click: number;
            account: string;
        }>
        (`select id, playername, buypower, curr_click, account from player where account = $1;`,
            [username]
        );
        const row = results.rows[0];
        if(!row){
            return null;
        }
        const player = new Player(row.playername);
        player.#buyPower = row.buypower;
        player.#currClick = row.curr_click;

        await player.loadUpgrade(row.id);

        player.#checkMoney();
        player.#checkClick();

        return player;

    }

    #toUpgradeType(name: string): UpgradeType {
        switch (name) {
            case UpgradeType.Employer:
                return UpgradeType.Employer;

            case UpgradeType.FinancialAdvisor:
                return UpgradeType.FinancialAdvisor;

            default:
                throw new Error(`upgrade type is building: ${name}`);
        }
    }
    get buyPower(): number {
        this.#checkMoney();
        return this.#buyPower;
    }

    get account():Account{
        return this.#account;
    }
    set account(account){
        this.#account = account;
    }
    /**
     * Sets the player's current buy power to the given value, used for testing
     * @param value the new amount of buy power. Must be greater than or equal to 0.
     * Postcondition: the player's buy power is equal to value.
     * Side effects: Changes the player's current buy power.
     */
    set updatedBuyPower(value: number) {
        this.#checkMoney();
        this.#buyPower = value;
        this.#checkMoney();
    }


    /**
     * Increases the player's buy power by the current click amount
     * Postcondition: buy power is increased by currClick
     * Side effects: changes buyPower, prints the new buy power and notifies listeners
     */
    click(): void {
        this.#buyPower += this.#currClick;
        this.#checkMoney();
        this.#notifyAll();
    }

    /**
     * Gets current level of the specified upgrade
     * @param type the type of upgrade whose level is being retrieved
     *             Must be a valid UpgradeType.
     * @return the current level of the matching upgrade, or 0 if no
     *         matching upgrade is found.
     * Postcondition: the player's state is unchanged.
     */
    findUpgradeLevel(type: UpgradeType): number {
        let level = 0;
        for (let i = 0; i < this.#upgrades.length; i++) {
            if (this.#upgrades[i].upgradeName === type) {
                level = this.#upgrades[i].upgradeLevel;
            }
        }
        return level;
    }

    /**
     * Gets current price of the specified upgrade
     * @param type the type of upgrade whose price is being retrieved
     * Must be a valid UpgradeType
     * @return the current price of the matching upgrade, or 0 if no matching upgrade is found
     * Postcondition: the player's state is unchanged
     */
    findPrice(type: UpgradeType): number {
        let price = 0;
        for (let i = 0; i < this.#upgrades.length; i++) {
            if (this.#upgrades[i].upgradeName === type) {
                price = this.#upgrades[i].buyPowerCost;
            }
        }
        return price;
    }


    #purchaseUpgrade(upgrade: Upgrade): boolean {
        let purchaseSuccessful = false;
        const cost = upgrade.buyPowerCost;

        if (this.#buyPower >= cost) {
            this.#buyPower -= cost;

            upgrade.increaseLevel();
            upgrade.updateBuyPowerCost();

            this.#currClick += upgrade.productionValue;

            this.#checkMoney();
            this.#checkClick();
            this.#notifyAll();

            purchaseSuccessful = true;
        }

        return purchaseSuccessful;
    }
    // /**
    //  * Attempts to purchase the specified upgrade
    //  * @param upgrade upgrade being purchased
    //  * Postcondition: if the player has enough buy power, the cost is removed,
    //  * the upgrade level increases and currClick increases
    //  * If the player cannot afford it, nothing changes
    //  * Side effects: can change buyPower, currClick, upgrade level and upgrade cost
    //  */
    // #purchaseUpgrade(upgrade: Upgrade): boolean {
    //     this.#checkMoney();
    //     const cost = upgrade.buyPowerCost;
    //
    //     if (this.#buyPower >= cost) {
    //         this.#buyPower -= cost;
    //         upgrade.increaseLevel();
    //         upgrade.updateBuyPowerCost();
    //
    //         this.#currClick += upgrade.productionValue; // Update the exact upgrade that was clicked
    //         this.#checkMoney();
    //         this.#checkClick();
    //         this.#notifyAll();
    //
    //     }
    //
    // }

    /**
     * Adds all available upgrades to the player's upgrade list
     * Postcondition: the upgrade list contains a Financial Advisor and Employer
     * Side effects: adds upgrades to the list and notifies listeners
     */
    #fillArray(): void {
        // 15,20 financial
        //20, 100 employer
        this.#upgrades.push(new Upgrade(UpgradeType.FinancialAdvisor, 0, 20, 50));
        this.#upgrades.push(new Upgrade(UpgradeType.Employer, 0, 20, 100));
        // this.#upgrades.push(upgrade);
        // this.#upgrades.push(new Employer());
    }
    getUpgrade(type: UpgradeType): Upgrade {
        for (let i = 0; i < this.#upgrades.length; i++) {
            if (this.#upgrades[i].upgradeName === type) {
                return this.#upgrades[i];
            }
        }
        return new Upgrade(UpgradeType.Employer, 0, 0, 0); // no value
    }

    public purchaseByName(type: UpgradeType): Upgrade | null {
        let purchasedUpgrade: Upgrade | null = null;
        let found = false;

        for (
            let i = 0;
            i < this.#upgrades.length && !found;
            i++
        ) {
            if (this.#upgrades[i].upgradeName === type) {
                found = true;

                const purchaseSuccessful =
                    this.#purchaseUpgrade(this.#upgrades[i]);

                if (purchaseSuccessful) {
                    purchasedUpgrade = this.#upgrades[i];
                }
            }
        }

        return purchasedUpgrade;
    }

    // /**
    //  * Attempts to purchase an upgrade using its type
    //  * @param type the type of upgrade being purchased
    //  * Must be a valid UpgradeType
    //  * Side effects: may change buyPower, currClick, upgrade level and upgrade cost
    //  */
    // purchaseByName(type: UpgradeType): Upgrade | null{
    //     let purchasedUpgrade: Upgrade | null = null;
    //     // if(this.#upgrades.upgradeName === type)
    //     // if (this.#upgrades.length >= 1) {
    //     for (let i = 0; i < this.#upgrades.length; i++) {
    //         if (this.#upgrades[i].upgradeName === type) {
    //             this.#purchaseUpgrade(this.#upgrades[i]); // This will check first if player has enough money
    //             purchasedUpgrade = this.#upgrades[i];
    //         }
    //     }
    //     return purchasedUpgrade;
    // }

    registerListener(listener: Listener): void {
        this.#listeners.push(listener);
    }

    #notifyAll(): void {
        this.#listeners.forEach((listener) => listener.notify());
    }

    #checkMoney(): void {
        assert(this.#buyPower >= 0, "buyPower can't be negative");
    }

    #checkClick(): void {
        assert(this.#currClick >= 0, "currentClick can't be negative");
    }

}