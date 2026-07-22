/**
 * Represents an upgrade that can be purchased by the player
 * Stores the upgrade's type, level, production and cost
 */

import assert from "../assertions.ts";
import {UpgradeType} from "./UpgradeType.ts";

export abstract class Upgrade {
    #upgradeName: UpgradeType;
    #upgradeLevel: number;
    #upgradeProduction: number;
    #buyPowerCost: number;

    constructor(upgradeName: UpgradeType, level: number, production: number, buyPowerCost: number) {
        this.#upgradeName = upgradeName;
        this.#upgradeLevel = level;
        this.#upgradeProduction = production;
        this.#buyPowerCost = buyPowerCost;
        this.#checkInvariants();
    }

    /**
     * Increases the upgrade by 1
     * Postcondition: the upgrade level is increased by exactly 1
     * Side effects: changes the upgrade level
     */
    increaseLevel(): void {
        const oldLvl = this.#upgradeLevel; // Saves initial level
        this.#upgradeLevel++;
        assert(this.#upgradeLevel === oldLvl + 1, "Level should increase by 1"); //Post cond
        this.#checkInvariants();
    }

    abstract calculateProduction(level: number): number; // Calculates how much the upgrade produces at given level
    abstract calculateCost(level: number): number; // Calculates how much the upgrade cost at given level

    /**
     * Updates buy power cost based on the current upgrade level
     * Postcondition: buyPowerCost is equal to the calculated cost for the current level
     * Side effects: changes the upgrade's buy power cost
     */
    updateBuyPowerCost() {
        this.#buyPowerCost = this.calculateCost(this.#upgradeLevel);
        this.#checkInvariants();
    }

    // Getters
    get upgradeName(): string {
        return this.#upgradeName;
    }

    get upgradeLevel(): number {
        return this.#upgradeLevel;
    }

    get productionValue(): number { // How much money it will produce
        return this.#upgradeProduction;
    }

    get buyPowerCost(): number {
        return this.#buyPowerCost;
    }

    /**
     * Checks that the upgrade values follow the class invariants
     * Postcondition: level is at least 0, buyPowerCost is at least 1 and production is at least 1
     * Side effects: throws an assertion error if an invariant is broken
     */
    #checkInvariants(): void {
        assert(this.#upgradeLevel >= 0, "Level can't be negative");
        assert(this.#buyPowerCost >= 1, "buyPowerCost can't be negative");
        assert(this.#upgradeProduction >= 1, "An upgrade's production has to be at least 1");

    }
}