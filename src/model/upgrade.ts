import { assert } from '../assertions.ts'

export abstract class Upgrade {
    #name: string;
    #level: number;
    #production: number;
    #buyPowerCost: number;

    constructor(name:string, level:number, production:number, buyPowerCost:number){
        this.#name = name;
        this.#level = level;
        this.#production = production;
        this.#buyPowerCost = buyPowerCost;
    }
        increaseLevel(): void {
            this.#level++;
        }
        abstract calculateProduction(level:number):number;
        abstract calculateCost(level:number):number;

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

}