import {Upgrade} from "./upgrade.ts";
import {UpgradeType} from "./UpgradeType.ts";


export class Employer extends Upgrade {
    constructor() {
        super(UpgradeType.Employer, 0, 20, 100)
    }

    calculateCost(level: number): number {
        return (level + 1) * this.buyPowerCost; // Returns the new cost to purchase the upgrade
    }

    calculateProduction(level: number): number {
        return (level + 1) * this.productionValue; // Each upgrade will add additional n clicks per click on item
    }
}