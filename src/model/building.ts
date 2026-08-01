
import assert from "../assertions.ts";
import Upgrade from "./upgrade.ts";
import { UpgradeType } from "./UpgradeType.ts";

/**
 * Represents an upgrade that automatically produces buy power over time.
 */
export default class Building extends Upgrade {
    #intervalSpeed: number;
    #autoClickTimer: ReturnType<typeof setInterval> | undefined;

    constructor(upgradeName: UpgradeType, level: number, production: number,
        buyPowerCost: number, intervalSpeed: number) {
        super(upgradeName, level, production, buyPowerCost);
        this.#intervalSpeed = intervalSpeed;
        this.#autoClickTimer = undefined;
        this.#checkIntervalSpeed();
    }

    /**
     * Starts the building's automatic production when it has been purchased.
     *
     * @param addBuyPower the function used to add the produced amount to
     * the player.
     * Side effects: starts a repeating timer. The timer is only started once.
     */
    public startAutoClicker(addBuyPower: (amount: number) => void): void {
        if (this.upgradeLevel > 0 && this.#autoClickTimer === undefined) {
            this.#autoClickTimer = globalThis.setInterval(
                () => this.#autoClick(addBuyPower), this.#intervalSpeed
            );
        }
    }
    /**
     * Calculates and adds the buy power produced by the building.
     *
     * @param addBuyPower the function used to add the produced amount.
     * Side effects: increases the player's buy power through the callback.
     */
    #autoClick(addBuyPower: (amount: number) => void): void {
        const amount = this.calculateProduction(this.upgradeLevel);
        addBuyPower(amount);
    }

    get intervalSpeed(): number {
        return this.#intervalSpeed;
    }

    #checkIntervalSpeed(): void {
        assert(this.#intervalSpeed > 0, "intervalSpeed must be greater than 0");
    }
}