/**
 * Represents the player in the game
 * Stores the player's buy power, click amount and upgrades
 */
//Need to move methods
import assert from "../assertions.ts";
import type Listener from "./listener.ts";
import Upgrade from "./upgrade.ts";
import {UpgradeType} from "./UpgradeType.ts";
import type Account from "./Account/account.ts";
import Building from "./building.ts";
import PlayerIdNotFoundError from "./ErrorMethods/PlayerIDNotFoundError.ts";
import NoAccountFoundError from "./ErrorMethods/NoAccountFoundError.ts";

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
        this.#currClick = 1;
        this.#buyPower = 0;
        this.#upgrades = new Array<Upgrade>();
        this.#buildings = new Array<Building>();
        this.#listeners = new Array<Listener>();
        // this.fillArray(); // Initializes the player with all available upgrades at level 0
        this.#notifyAll();
        this.#checkMoney();
        this.#checkClick();
    }

    public startBuildingAutoClickers(): void {
        for (let i = 0; i < this.#buildings.length; i++) {
            const building = this.#buildings[i];

            building.startAutoClicker(
                (amount: number) => {
                    this.#buyPower += amount;

                    this.#checkMoney();
                    this.#notifyAll();
                }
            );
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
    // findUpgradeLevel(type: UpgradeType): number {
    //     let level = 0;
    //     for (let i = 0; i < this.#upgrades.length; i++) {
    //         if (this.#upgrades[i].upgradeName === type) {
    //             level = this.#upgrades[i].upgradeLevel;
    //         }
    //     }
    //     return level;
    // }

    findUpgradeLevel(type: UpgradeType): number {
        let level = 0;

        // Check the regular upgrades
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
     * Gets current price of the specified upgrade
     * @param type the type of upgrade whose price is being retrieved
     * Must be a valid UpgradeType
     * @return the current price of the matching upgrade, or 0 if no matching upgrade is found
     * Postcondition: the player's state is unchanged
     */
    // findPrice(type: UpgradeType): number {
    //     let price = 0;
    //     for (let i = 0; i < this.#upgrades.length; i++) {
    //         if (this.#upgrades[i].upgradeName === type) {
    //             price = this.#upgrades[i].buyPowerCost;
    //         }
    //     }
    //     return price;
    // }

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


    #purchaseUpgrade(upgrade: Upgrade): boolean {
        let purchaseSuccessful = false;
        const cost = upgrade.buyPowerCost;

        if (this.#buyPower >= cost) {
            this.#buyPower -= cost;

            upgrade.increaseLevel();
            upgrade.updateBuyPowerCost();
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
        }

        return purchaseSuccessful;
    }

    /**
     * Adds all available upgrades to the player's upgrade list
     * Postcondition: the upgrade list contains a Financial Advisor and Employer
     * Side effects: adds upgrades to the list and notifies listeners
     */
    // fillArray(): void {
    //     // 15,20 financial
    //     //20, 100 employer
    //     this.#upgrades.push(new Upgrade(UpgradeType.FinancialAdvisor, 0, 20, 50));
    //     this.#upgrades.push(new Upgrade(UpgradeType.Employer, 0, 20, 100));
    //     // this.#upgrades.push(upgrade);
    //     // this.#upgrades.push(new Employer());
    //
    //         const banker = new Building(
    //             UpgradeType.Banker,
    //             0,      // starting level
    //             20,     // starting production
    //             200,    // starting cost
    //             1000    // interval speed in milliseconds
    //         );
    //
    //         const royalMint = new Building(
    //             UpgradeType.RoyalMint,
    //             0,
    //             40,
    //             500,
    //             1000
    //         );
    //
    //         this.#buildings.push(banker);
    //         this.#buildings.push(royalMint);
    // }

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
    public purchaseBuilding(type: UpgradeType): Building | null {
        let purchasedBuilding: Building | null = null;
        let found = false;

        for (
            let i = 0;
            i < this.#buildings.length && !found;
            i++
        ) {
            const building = this.#buildings[i];

            if (building.upgradeName === type) {
                found = true;

                if (this.#buyPower >= building.buyPowerCost) {
                    this.#buyPower -= building.buyPowerCost;

                    building.increaseLevel();
                    building.updateBuyPowerCost();

                    building.startAutoClicker(
                        (amount: number) => {
                            this.#addAutomaticBuyPower(amount);
                        }
                    );

                    this.#checkMoney();
                    this.#notifyAll();

                    purchasedBuilding = building;
                }
            }
        }

        return purchasedBuilding;
    }

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
    }

    get buildings(): ReadonlyArray<Building> {
        return this.#buildings;
    }

    set buildings(buildings: Array<Building>) {
        this.#buildings = buildings;
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

}