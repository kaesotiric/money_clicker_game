import assert from "../assertions.ts";
import type Listener from "./listener.ts";
import type Upgrade from "./upgrade.ts";

export default class Player {

    //change later
    #name: string;
    #buyPower : number
    #currClick : number
    #upgrades: Array<Upgrade>;
    #listeners: Array<Listener>;
    constructor(name: string, clickPower: number, buyPower: number){
        this.#name = name;
        this.#currClick = clickPower;
        this.#buyPower = buyPower;
        this.#upgrades = new Array<Upgrade>;
        this.#listeners = new Array<Listener>();
        this.#checkMoney();
    }

    get name(){
        return this.#name;
    }
    get buyPower(){
        return this.#buyPower;
    }

    increaseCPS(by: number) : void {
        if(by>=0){
            this.#currClick+=by;
        }
        this.#notifyAll();
    }
//     purchaseUpgrade(upgrade: Upgrade) void{
//
// }

    #checkMoney(){
        assert(this.#buyPower >=0, "buyPower can't be negative")
    }
    registerListener(listener: Listener){
        this.#listeners.push(listener);
    }

    #notifyAll(){
        this.#listeners.forEach((l) => l.notify());
    }
}

