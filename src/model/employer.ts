import {Upgrade} from "./upgrade.ts";


export class Employer extends Upgrade {
    constructor(){
        super("Financial Advisor", 1, 10, 100)
    }
    calculateCost(level:number):number{
        return level*this.getBuyPowerCost(); // Returns the new cost to purchase the upgrade
    }
    calculateProduction(level:number):number{
        return level*this.getProduction(); // Each upgrade will add additional n clicks per click on item
    }
}