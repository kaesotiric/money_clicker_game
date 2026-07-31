
// class Building {
// - ~integer id
// - int intervalSpeed
// + calculateProduction(level) int
// + calculateCost(level) int
// + autoClick() void
// }

// export default class Building extends Upgrade {
//     #id: number;
//     #intervalSpeed: number;
//     #autoClickTimer: number | undefined;
//
//     constructor(upgradeName: UpgradeType, level: number, production: number,
//                 buyPowerCost: number, intervalSpeed: number) {
//         super(upgradeName, level, production, buyPowerCost);
//         this.#intervalSpeed = intervalSpeed;
//     }
//
//
//     public startAutoClicker(
//         addBuyPower: (amount: number) => void
//     ): void {
//         if (this.#autoClickTimer === undefined) {
//             this.#autoClickTimer = window.setInterval(() => {
//                 const amount =
//                     this.calculateProduction(this.upgradeLevel);
//
//                 addBuyPower(amount);
//             }, this.#intervalSpeed);
//         }
//     }
//
//     #autoClick(addBuyPower: (amount: number) => void): void {
//         const amount = this.calculateProduction(this.upgradeLevel);
//
//         addBuyPower(amount);
//     }
//
//     public stopAutoClicker(): void {
//         if (this.#autoClickTimer !== undefined) {
//             window.clearInterval(this.#autoClickTimer);
//             this.#autoClickTimer = undefined;
//         }
//     }
//     get intervalSpeed(){
//         return  this.#intervalSpeed;
//     }
//
// }









import Upgrade from "./upgrade.ts";
import { UpgradeType } from "./UpgradeType.ts";

export default class Building extends Upgrade {
    #intervalSpeed: number;
    #autoClickTimer: number | undefined;

    constructor(
        upgradeName: UpgradeType,
        level: number,
        production: number,
        buyPowerCost: number,
        intervalSpeed: number
    ) {
        super(
            upgradeName,
            level,
            production,
            buyPowerCost
        );

        this.#intervalSpeed = intervalSpeed;
        this.#autoClickTimer = undefined;
    }

    /**
     * Starts the building's automatic production.
     */
    public startAutoClicker(
        addBuyPower: (amount: number) => void
    ): void {
        /*
         * A level 0 building has not been purchased yet,
         * so it should not produce money.
         */
        if (
            this.upgradeLevel > 0 &&
            this.#autoClickTimer === undefined
        ) {
            this.#autoClickTimer = window.setInterval(
                () => this.#autoClick(addBuyPower),
                this.#intervalSpeed
            );
        }
    }

    /**
     * Produces money once.
     */
    #autoClick(
        addBuyPower: (amount: number) => void
    ): void {
        const amount =
            this.calculateProduction(this.upgradeLevel);

        addBuyPower(amount);
    }

    /**
     * Stops the building's automatic production.
     */
    public stopAutoClicker(): void {
        if (this.#autoClickTimer !== undefined) {
            window.clearInterval(this.#autoClickTimer);
            this.#autoClickTimer = undefined;
        }
    }

    get intervalSpeed(): number {
        return this.#intervalSpeed;
    }
}