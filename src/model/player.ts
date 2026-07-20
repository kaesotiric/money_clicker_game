import assert from "../assertions.ts";
import type Listener from "./listener.ts";
import type {Upgrade} from "./upgrade.ts";
import {Employer} from "./employer.ts";
import {FinancialAdvisor} from "./financial-advisor.ts";

export default class Player {
    // #name: string;
    #buyPower: number; // The current money/buy power the user has
    #currClick: number; // How much per click is
    #upgrades: Array<Upgrade>; // List of upgrades the user has
    #listeners: Array<Listener>;

    constructor() {
        this.#currClick = 1;
        this.#buyPower = 0;
        this.#upgrades = new Array<Upgrade>();
        this.#listeners = new Array<Listener>();
        this.fillArray()
        this.#notifyAll();
        this.#checkMoney();
        this.#checkClick();
    }


    get buyPower(): number {
        return this.#buyPower;
    }
    get upgrades(){
        return this.#upgrades;
    }
    setBuyPower(value: number ){
        this.#buyPower = value;
}

    get currClick(): number {
        return this.#currClick;
    }
    getAdvisorLevel(name: string): number{
        for(let i = 0; i<this.#upgrades.length; i++) {
            if (this.#upgrades[i].getName() === ("Financial Advisor") && name === "Financial Advisor"){
                return this.#upgrades[i].getLevel();
            }else if(this.#upgrades[i].getName() === ("Employer") && name === "Employer"){
                return this.#upgrades[i].getLevel();
            }
        }
        return 0;
    }
    //Change Later
    getPrice(type:string):number{ //**make more dynamic
        for(let i = 0; i<this.#upgrades.length; i++) {
            if (this.#upgrades[i].getName() === ("Financial Advisor") && type === "Financial Advisor"){
                return this.#upgrades[i].getBuyPowerCost();
            }else if (this.#upgrades[i].getName() === ("Employer") && type === "Employer"){
                return this.#upgrades[i].getBuyPowerCost();
            }
        }
        return 0;
    }

    increaseCPS(by: number): void {
        this.#currClick += by;
        this.#checkClick();
        this.#notifyAll();
    }

    click(): void {
        this.#buyPower += this.currClick;
        console.log("buyPower is now", this.#buyPower);
        this.#checkMoney();
        this.#notifyAll();
    }

    purchaseUpgrade(upgrade: Upgrade): void { ///**PROLLY WANT TO MAKE THIS A GENERAL METHOD IE PURCHASE USING STRING NAME
        this.#checkMoney();
        console.log("buyPowerCOST is now", upgrade.getBuyPowerCost());
        // upgrade.setBuyPowerCost();
        const cost = upgrade.getBuyPowerCost();

        if (this.#buyPower < cost) {
            return;
        }

        this.#buyPower -= cost;
        upgrade.increaseLevel();
        upgrade.setBuyPowerCost();

        // Update the exact upgrade that was clicked

        this.#currClick += upgrade.getProduction();

        this.#checkMoney();
        this.#checkClick();
        this.#notifyAll();
    }


    fillArray(){
        this.#upgrades.push(new FinancialAdvisor());
        this.#upgrades.push(new Employer());
        this.#notifyAll();

    }

    purchaseByName(upgradeName : string):void{
        if(this.#upgrades.length >=1){
           for(let i = 0; i<this.#upgrades.length; i++) {
               if (this.#upgrades[i].getName() === ("Financial Advisor")
                   && upgradeName === "Financial Advisor") {
                   this.purchaseUpgrade(this.#upgrades[i]); // this will check first if player has enough money
               }else if (this.#upgrades[i].getName() === ("Employer")
                   && upgradeName === "Employer"){
                   this.purchaseUpgrade(this.#upgrades[i]); // this will check first if player has enough money
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
