import {Upgrade} from "./upgrade.ts";


export class FinancialAdvisor extends Upgrade {
    constructor(){
        super("Financial Advisor", 1, 20, 1000)
    }

    calculateCost(level:number):number{
        return (level+1)*this.getBuyPowerCost(); // Returns the new cost to purchase the upgrade
    }
    calculateProduction(level:number):number{
        return (level*1.5)*this.getProduction(); // Each upgrade will add additional n clicks per click on item
    }
}