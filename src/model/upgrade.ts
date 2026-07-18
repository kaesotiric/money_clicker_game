import type Listener from "./listener.ts";

export abstract class Upgrade {
    #name: string;
    #level: number;
    #production: number;
    #buyPowerCost: number;
    #listeners: Array<Listener>;

    constructor(name:string, level:number, production:number, buyPowerCost:number){
        this.#name = name;
        this.#level = level;
        this.#production = production;
        this.#buyPowerCost = buyPowerCost;
        this.#listeners = new Array<Listener>();
    }
        increaseLevel(): void {
            this.#level += 1;
            // this.#notifyAll();
        }
        abstract calculateProduction(level:number):number;
        abstract calculateCost(level:number):number;

        setBuyPowerCost(){
            this.#buyPowerCost = this.calculateCost(this.#level);
            this.#notifyAll();

        }

    // Getters
    getName(): string {
        return this.#name;
    }

    getLevel(): number {
        return this.#level;
    }

    getProduction(): number { // How much money it will produce
        return this.#production;
    }

    getBuyPowerCost(): number {
        return this.#buyPowerCost;
    }
    registerListener(listener: Listener): void {
        this.#listeners.push(listener);
    }

    #notifyAll(): void {
        this.#listeners.forEach((listener) => listener.notify());
    }

}