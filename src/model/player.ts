import assert from "../assertions.ts";
import type Listener from "./listener.ts";
// import type Upgrade from "./upgrade.ts";

// export default class Player {
//
//     //change later
//     #name: string;
//     #buyPower : number
//     #currClick : number
//     #upgrades: Array<Upgrade>;
//     #listeners: Array<Listener>;
//     constructor(name: string, clickPower: number, buyPower: number){
//         this.#name = name;
//         this.#currClick = clickPower;
//         this.#buyPower = buyPower;
//         this.#upgrades = new Array<Upgrade>;
//         this.#listeners = new Array<Listener>();
//         this.#checkMoney();
//     }
//
//     get name(){
//         return this.#name;
//     }
//     get getBuyPower(){
//         return this.#buyPower;
//     }
//
//     increaseCPS(by: number) : void {
//         this.#checkClick();
//         this.#currClick+=by;
//         this.#notifyAll();
//     }
//     click():void{
//         this.#buyPower+=this.#currClick; // When a user clicks, it will increase buy power by currentClick
//     }
//
//     purchaseUpgrade(upgrade: Upgrade): void{
//         this.#checkMoney();
//         if(this.#buyPower >= upgrade.getBuyPowerCost()){
//             this.#buyPower -= upgrade.getBuyPowerCost();
//             this.increaseCPS(upgrade.getProduction());
//             this.#upgrades.push(upgrade);
//         }
//         this.#checkClick();
//     }
//
//
//     #checkMoney(){
//         assert(this.#buyPower >=0, "buyPower can't be negative")
//     }
//     #checkClick(){
//         assert(this.#currClick >=0, "currentClick can't be negative")
//     }
//     registerListener(listener: Listener){
//         this.#listeners.push(listener);
//     }
//
//     #notifyAll(){
//         this.#listeners.forEach((l) => l.notify());
//     }
//     private notifyListeners(): void {
//         for (const listener of this.listeners) {
//             listener.playerChanged();
//         }
//     }
// }


export default class Player {
    #name: string;
    #buyPower: number;
    #currClick: number;
    // #upgrades: Array<Upgrade>;
    #listeners: Array<Listener>;

    constructor(name: string, clickPower: number, buyPower: number) {
        this.#name = name;
        this.#currClick = clickPower;
        this.#buyPower = buyPower;
        // this.#upgrades = new Array<Upgrade>();
        this.#listeners = new Array<Listener>();
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

    increaseCPS(by: number): void {
        this.#currClick += by;
        this.#checkClick();
        this.#notifyAll();
    }

    click(): void {
        this.#buyPower += 1;
        console.log("buyPower is now", this.#buyPower);
        this.#checkMoney();
        this.#notifyAll();
    }

    // purchaseUpgrade(upgrade: Upgrade): void {
    //     this.#checkMoney();
    //
    //     if (this.#buyPower >= upgrade.getBuyPowerCost()) {
    //         this.#buyPower -= upgrade.getBuyPowerCost();
    //         this.increaseCPS(upgrade.getProduction());
    //         this.#upgrades.push(upgrade);
    //         this.#notifyAll();
    //     }
    //
    //     this.#checkMoney();
    //     this.#checkClick();
    // }

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
