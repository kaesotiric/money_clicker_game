
import assert from "../assertions.ts";
import type Listener from "./listener.ts";
import Upgrade from "./upgrade.ts";
import { UpgradeType } from "./UpgradeType.ts";
import type Account from "./Account/account.ts";
import Building from "./building.ts";
import PlayerIdNotFoundError from "./ErrorMethods/PlayerIDNotFoundError.ts";
import NoAccountFoundError from "./ErrorMethods/NoAccountFoundError.ts";
import InsufficientBuyPowerError from "./ErrorMethods/InsufficientBPError.ts";

/**
 * Represents the player in the game
 * Stores buy power, click amount, upgrades and buildings
 */
export default class Player {
    #name: string;
    #id: number | null = null;
    #account: Account | null = null;
    #buyPower: number;
    #currClick: number;
    #upgrades: Array<Upgrade>;
    #buildings: Array<Building>;
    #listeners: Array<Listener>;

    constructor(name: string) {
        this.#name = name;
        this.#currClick = 1;
        this.#buyPower = 0;
        this.#upgrades = new Array<Upgrade>();
        this.#buildings = new Array<Building>();
        this.#listeners = new Array<Listener>();

        this.#notifyAll();
        this.#checkName();
        this.#checkMoney();
        this.#checkClick();
    }

    // Starts automatic clickers for purchased buildings
    public startBuildingAutoClickers(): void {
        for (let i = 0; i < this.#buildings.length; i++) {
            const building = this.#buildings[i];

            if (building.upgradeLevel > 0) {
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

    set id(id: number) {
        this.#id = id;
    }

    get buyPower(): number {
        this.#checkMoney();
        return this.#buyPower;
    }

    set buyPower(value: number) {
        this.#buyPower = value;
        this.#checkMoney();
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

    /**
     * Adds money when the player clicks
     */
    click(): void {
        this.#buyPower += this.#currClick;

        this.#checkMoney();
        this.#notifyAll();
    }

    /**
     * Gets the current level of an upgrade or building
     */
    findUpgradeLevel(type: UpgradeType): number {
        let level = 0;

        for (let i = 0; i < this.#upgrades.length; i++) {
            if (this.#upgrades[i].upgradeName === type) {
                level = this.#upgrades[i].upgradeLevel;
            }
        }

        for (let i = 0; i < this.#buildings.length; i++) {
            if (this.#buildings[i].upgradeName === type) {
                level = this.#buildings[i].upgradeLevel;
            }
        }

        return level;
    }

    /**
     * Gets the current price of an upgrade or building
     */
    findPrice(type: UpgradeType): number {
        let price = 0;

        for (let i = 0; i < this.#upgrades.length; i++) {
            if (this.#upgrades[i].upgradeName === type) {
                price = this.#upgrades[i].buyPowerCost;
            }
        }

        for (let i = 0; i < this.#buildings.length; i++) {
            if (this.#buildings[i].upgradeName === type) {
                price = this.#buildings[i].buyPowerCost;
            }
        }

        return price;
    }

    /**
     * Calculates the bonus for the next upgrade level
     */
    public getNextClickBonus(type: string): number {
        const upgrade = this.#upgrades.find(
            item => item.upgradeName === type
        );

        if (upgrade === undefined) {
            return 0;
        }

        // Every existing level adds 20% to the next bonus
        const bonus = Math.round(
            upgrade.productionValue *
            (1 + upgrade.upgradeLevel * 0.2)
        );

        return bonus;
    }

    /**
     * Purchases an upgrade when the player has enough money
     */
    #purchaseUpgrade(upgrade: Upgrade): boolean {
        let purchaseSuccessful = false;
        const cost: number = upgrade.buyPowerCost;

        // Calculate before increasing the level
        const clickBonus: number = upgrade instanceof Building
            ? 0
            : this.getNextClickBonus(upgrade.upgradeName);

        if (this.#buyPower >= cost) {
            this.#buyPower -= cost;

            upgrade.increaseLevel();
            upgrade.updateBuyPowerCost();

            if (upgrade instanceof Building) {
                upgrade.startAutoClicker((amount: number) => {
                    this.#addAutomaticBuyPower(amount);
                });
            } else {
                // Adds the scaled bonus to the player's click power
                this.#currClick += clickBonus;
            }

            this.#checkMoney();
            this.#checkClick();
            this.#notifyAll();

            purchaseSuccessful = true;
        } else {
            throw new InsufficientBuyPowerError();
        }

        return purchaseSuccessful;
    }

    /**
     * Purchases a regular upgrade by its type
     */
    public purchaseByName(type: UpgradeType): Upgrade | null {
        let purchasedUpgrade: Upgrade | null = null;
        let found = false;

        for (let i = 0; i < this.#upgrades.length && !found; i++) {
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

    /**
     * Purchases a building that produces money automatically
     */
    public purchaseBuilding(type: UpgradeType): Building | null {
        let purchasedBuilding: Building | null = null;
        let found = false;

        for (let i = 0; i < this.#buildings.length && !found; i++) {
            const building = this.#buildings[i];

            if (building.upgradeName === type) {
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
                } else {
                    throw new InsufficientBuyPowerError();
                }
            }
        }

        return purchasedBuilding;
    }

    /**
     * Adds money earned automatically from buildings
     */
    #addAutomaticBuyPower(amount: number): void {
        this.#buyPower += amount;

        this.#checkMoney();
        this.#notifyAll();
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
        assert(
            this.#name.trim().length > 0,
            "player name can't be empty"
        );
    }

    #checkUpgrades(): void {
        for (const upgrade of this.#upgrades) {
            assert(
                upgrade !== null && upgrade !== undefined,
                "upgrade can't be null"
            );
        }
    }

    #checkBuildings(): void {
        for (const building of this.#buildings) {
            assert(
                building !== null && building !== undefined,
                "building can't be null"
            );
        }
    }
}
