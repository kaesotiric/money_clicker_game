import {Upgrade} from "./upgrade.ts";
import {UpgradeType} from "./UpgradeType.ts";


export class FinancialAdvisor extends Upgrade {
    constructor() {
        super(UpgradeType.FinancialAdvisor, 0, 15, 20)
    }

    calculateCost(level: number): number {
        return (level + 1) * this.buyPowerCost; // Returns the new cost to purchase the upgrade
    }

    calculateProduction(level: number): number {
        return (1 + level * 2) * this.productionValue; // Each upgrade will add additional n clicks per click on item
    }

}