import assert from "../assertions.ts";
import type Listener from "./listener.ts";
import Upgrade from "./upgrade.ts";
import {UpgradeType} from "./UpgradeType.ts";
import type Account from "./Account/account.ts";
import Building from "./building.ts";
import PlayerIdNotFoundError from "./ErrorMethods/PlayerIDNotFoundError.ts";
import NoAccountFoundError from "./ErrorMethods/NoAccountFoundError.ts";
import InsufficientBuyPowerError from "./ErrorMethods/InsufficientBPError.ts";

/**
 * Represents the player in the game
 * Stores the player's buy power, click amount, upgrades, and buildings that autoclicks
 */

export default class Player {
    #name: string;
    #id: number | null = null;
    #account: Account | null = null;
    #buyPower: number; // The current money or buy power the user has
    #currClick: number; // How much user earns per click
    #upgrades: Array<Upgrade>; // List of upgrades the user has
    #buildings: Array<Building>; // List of buildings the user has
    #listeners: Array<Listener>;

    constructor(name: string) {
        this.#name = name;
        this.#currClick = 1; // Defaults to 1 click power
        this.#buyPower = 0; // Starts with 0 buy power
        this.#upgrades = new Array<Upgrade>();
        this.#buildings = new Array<Building>();
        this.#listeners = new Array<Listener>();
        this.#notifyAll();
        this.#checkName();
        this.#checkMoney();
        this.#checkClick();
    }

    /**
     * Starts automatic clickers for buildings that the player has purchased.
     *
     * Side effects: starts timers that increase buy power and notify listeners.
     */
    public startBuildingAutoClickers(): void {
        for (let i = 0; i < this.#buildings.length; i++) { // Check every building because a player may own more than one
            const building = this.#buildings[i];

            if (building.upgradeLevel > 0) { // Level zero means the building has not been purchased
                building.startAutoClicker((amount: number) => {
                    this.#addAutomaticBuyPower(amount);
                });
            }
        }
    }

    get name(): string {
        return this.#name;
    }

    get id(): number {
        if (this.#id === null) {
            throw new PlayerIdNotFoundError();
        }

        return this.#id;
    }
    set id(id: number){
        this.#id = id;
    }

    get buyPower(): number {
        this.#checkMoney();
        return this.#buyPower;
    }

    get account(): Account {
        if (this.#account === null) {
            throw new NoAccountFoundError();
        }

        return this.#account;
    }

    set account(account: Account) {
        this.#account = account;
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
     * Gets the current level of an upgrade or building
     *
     * @param type The type being searched for
     * @return The current level or zero when the type is not found
     * Postcondition: The player's state is unchanged
     */
    findUpgradeLevel(type: UpgradeType): number {
        let level = 0;

        // Searches the regular upgrades until the matching type is found
        for (let i = 0; i < this.#upgrades.length; i++) {
            if (this.#upgrades[i].upgradeName === type) {
                level = this.#upgrades[i].upgradeLevel;
            }
        }

        // Check the buildings
        for (let i = 0; i < this.#buildings.length; i++) {
            if (this.#buildings[i].upgradeName === type) {
                level = this.#buildings[i].upgradeLevel;
            }
        }

        return level;
    }
    /**
     * Gets the current price of an upgrade or building
     *
     * @param type The type being searched for
     * @return The current price or zero when the type is not found
     * Postcondition: The player's state is unchanged
     */
    findPrice(type: UpgradeType): number {
        let price = 0;

        // Check regular upgrades
        for (let i = 0; i < this.#upgrades.length; i++) {
            if (this.#upgrades[i].upgradeName === type) {
                price = this.#upgrades[i].buyPowerCost;
            }
        }

        // Check buildings
        for (let i = 0; i < this.#buildings.length; i++) {
            if (this.#buildings[i].upgradeName === type) {
                price = this.#buildings[i].buyPowerCost;
            }
        }

        return price;
    }

    /**
     * Attempts to purchase an upgrade the player can afford
     *
     * @param upgrade The upgrade or building being purchased
     * @return True when the purchase succeeds and false otherwise
     * Side effects: May change buy power, click amount, level and cost
     */
    #purchaseUpgrade(upgrade: Upgrade): boolean {
        let purchaseSuccessful = false;
        const cost = upgrade.buyPowerCost;

        // Only continue when the player has enough buy power
        if (this.#buyPower >= cost) {
            this.#buyPower -= cost;

            // Increases the level and calculates the cost of the next purchase
            upgrade.increaseLevel();
            upgrade.updateBuyPowerCost();

            // Buildings produce buy power automatically over time (autoclicking)
             if (upgrade instanceof Building) {
                upgrade.startAutoClicker((amount: number) => {
                    this.#buyPower += amount;
                    this.#notifyAll();
                });
            }else { // If it's a regular upgrade
                 this.#currClick += upgrade.productionValue;
             }


            this.#checkMoney();
            this.#checkClick();
            this.#notifyAll();

            purchaseSuccessful = true;
        }else{
            throw new InsufficientBuyPowerError();
        }

        return purchaseSuccessful;
    }

    /**
     * Attempts to purchase the specified regular upgrade
     *
     * @param type the type of regular upgrade being purchased
     * @return the purchased upgrade, or null if it was not found or the
     * player could not afford it
     * Side effects: may decrease buy power, increase the upgrade level,
     * increase the upgrade cost and increase the current click amount
     */
    public purchaseByName(type: UpgradeType): Upgrade | null {
        let purchasedUpgrade: Upgrade | null = null;
        let found = false;

        for (let i = 0; i < this.#upgrades.length && !found; i++) {
            if (this.#upgrades[i].upgradeName === type) { // Search until the matching upgrade is found
                found = true;

                const purchaseSuccessful = this.#purchaseUpgrade(this.#upgrades[i]);

                if (purchaseSuccessful) {
                    purchasedUpgrade = this.#upgrades[i];
                }
            }
        }

        return purchasedUpgrade;
    }

    /**
     * Attempts to purchase a building by its type
     *
     * @param type The type of building being purchased
     * @return The purchased building or null when the purchase fails
     * Side effects: May change buy power, building level and building cost
     */

    public purchaseBuilding(type: UpgradeType): Building | null {
        let purchasedBuilding: Building | null = null;
        let found = false;

        for (let i = 0; i < this.#buildings.length && !found; i++) {
            const building = this.#buildings[i];

            if (building.upgradeName === type) { // Search until the matching building is found
                found = true;

                if (this.#buyPower >= building.buyPowerCost) {
                    this.#buyPower -= building.buyPowerCost;

                    building.increaseLevel();
                    building.updateBuyPowerCost();

                    building.startAutoClicker((amount: number) => {
                        this.#addAutomaticBuyPower(amount);
                    });

                    this.#checkMoney();
                    this.#notifyAll();

                    purchasedBuilding = building;
                }else{
                    throw new InsufficientBuyPowerError();
                }
            }
        }

        return purchasedBuilding;
    }

    /**
     * Adds buy power produced by a building
     *
     * @param amount The amount being added to the player's buy power
     * Side effects: Changes buy power and notifies listeners
     */
    #addAutomaticBuyPower(amount: number): void {
        this.#buyPower += amount;

        this.#checkMoney();
        this.#notifyAll();
    }

    set buyPower(value: number) {
        this.#buyPower = value;
        this.#checkMoney();
    }

    get currClick(): number {
        this.#checkClick();
        return this.#currClick;
    }

    set currClick(value: number) {
        this.#currClick = value;
        this.#checkClick();
    }

    get upgrades(): ReadonlyArray<Upgrade> {
        return this.#upgrades;
    }

    set upgrades(upgrades: Array<Upgrade>) {
        this.#upgrades = upgrades;
        this.#checkUpgrades();
    }

    get buildings(): ReadonlyArray<Building> {
        return this.#buildings;

    }

    set buildings(buildings: Array<Building>) {
        this.#buildings = buildings;
        this.#checkBuildings();

    }
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
    #checkName(): void {
        assert(this.#name.trim().length > 0, "player name can't be empty");
    }
    #checkUpgrades(): void {
        for (const upgrade of this.#upgrades) {
            assert(upgrade !== null && upgrade !== undefined, "upgrade can't be null");
        }
    }
    #checkBuildings(): void {
        for (const building of this.#buildings) {
            assert(building !== null && building !== undefined, "building can't be null");
        }
    }
}