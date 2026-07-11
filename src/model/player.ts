import assert from "../assertions.ts";
import type Listener from "./listener.ts";
import type {Upgrade} from "./upgrade.ts";
import {Employer} from "./employer.ts";
import {FinancialAdvisor} from "./financial-advisor.ts";

export default class Player {
    #name: string;
    #buyPower: number;
    #currClick: number;
    #upgrades: Array<Upgrade>;
    #listeners: Array<Listener>;

    constructor(name: string, clickPower: number, buyPower: number) {
        this.#name = name;
        this.#currClick = clickPower;
        this.#buyPower = buyPower;
        this.#upgrades = new Array<Upgrade>();
        this.#listeners = new Array<Listener>();
        this.#notifyAll();
        this.#checkMoney();
        this.#checkClick();
    }

    get name(): string {
        return this.#name;
    }

    get buyPower(): number {
        return this.#buyPower;
    }

    get currClick(): number {
        return this.#currClick;
    }
    getAdvisorLevel(): number{
        for(let i = 0; i<this.#upgrades.length; i++) {
            if (this.#upgrades[i].getName() === ("Financial Advisor")){
                return this.#upgrades[i].getLevel();
            }
        }
        return 0;
    }

    getPrice():number{
        for(let i = 0; i<this.#upgrades.length; i++) {
            if (this.#upgrades[i].getName() === ("Financial Advisor")){
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

    purchaseUpgrade(upgrade: Upgrade): void {

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
        let advisor = new FinancialAdvisor();
        // let employer = new Employer();
        this.#upgrades.push(advisor);
        // this.#upgrades.push(employer);
        this.#notifyAll();

    }

    purchaseAdvisor():void{
        if(this.#upgrades.length >=1){
           for(let i = 0; i<this.#upgrades.length; i++) {
               if (this.#upgrades[i].getName() === ("Financial Advisor")
                   && this.#upgrades[i].getLevel() >= (0)) {
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
