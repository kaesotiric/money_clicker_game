/**
 * Represents the player in the game
 * Stores the player's buy power, click amount and upgrades
 */

import assert from "../assertions.ts";
import type Listener from "./listener.ts";
import type {Upgrade} from "./upgrade.ts";
import {Employer} from "./employer.ts";
import {FinancialAdvisor} from "./financial-advisor.ts";
import type {UpgradeType} from "./UpgradeType.ts";

export default class Player {
    #buyPower: number; // The current money or buy power the user has
    #currClick: number; // How much user earns per click
    #upgrades: Array<Upgrade>; // List of upgrades the user has
    #listeners: Array<Listener>;

    private constructor() {
        this.#currClick = 1;
        this.#buyPower = 0;
        this.#upgrades = new Array<Upgrade>();
        this.#listeners = new Array<Listener>();
        this.#fillArray(); // Initializes the player with all available upgrades at level 0
        this.#notifyAll();
        this.#checkMoney();
        this.#checkClick();
    }

    get buyPower(): number {
        this.#checkMoney();
        return this.#buyPower;
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

    /**
     * Attempts to purchase the specified upgrade
     * @param upgrade upgrade being purchased
     * Postcondition: if the player has enough buy power, the cost is removed,
     * the upgrade level increases and currClick increases
     * If the player cannot afford it, nothing changes
     * Side effects: can change buyPower, currClick, upgrade level and upgrade cost
     */
    #purchaseUpgrade(upgrade: Upgrade): void {
        this.#checkMoney();
        const cost = upgrade.buyPowerCost;

        if (this.#buyPower >= cost) {
            this.#buyPower -= cost;
            upgrade.increaseLevel();
            upgrade.updateBuyPowerCost();

            this.#currClick += upgrade.productionValue; // Update the exact upgrade that was clicked

            this.#checkMoney();
            this.#checkClick();
            this.#notifyAll();

        }

    }

    /**
     * Adds all available upgrades to the player's upgrade list
     * Postcondition: the upgrade list contains a Financial Advisor and Employer
     * Side effects: adds upgrades to the list and notifies listeners
     */
    #fillArray(): void {
        this.#upgrades.push(new FinancialAdvisor());
        this.#upgrades.push(new Employer());
    }

    /**
     * Attempts to purchase an upgrade using its type
     * @param type the type of upgrade being purchased
     * Must be a valid UpgradeType
     * Side effects: may change buyPower, currClick, upgrade level and upgrade cost
     */
    purchaseByName(type: UpgradeType): void {
        if (this.#upgrades.length >= 1) {
            for (let i = 0; i < this.#upgrades.length; i++) {
                if (this.#upgrades[i].upgradeName === type) {
                    this.#purchaseUpgrade(this.#upgrades[i]); // This will check first if player has enough money
                }
            }
        }
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
