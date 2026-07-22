/**
 * Displays the main money clicker view
 * Shows the player's buy power and sends user actions to the controller
 */

import type Player from "../model/player.ts";
import type Listener from "../model/listener.ts";
import type MoneyController from "../controller/money-controller.ts";

export default class MoneyView implements Listener {
    #player: Player;
    #moneyController: MoneyController;

    constructor(player: Player, controller: MoneyController) {
        this.#player = player;
        this.#moneyController = controller;

        this.#player.registerListener(this);

        // Create ALL the HTML at once
        document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
            <h1>Money Clicker</h1>

            <hr/>
            <div>
                Money $<span id="buy-power">0</span>
            </div>

            <br>
            <div id="clicker">
                <button id="click-button">
                    Click Me!
                </button>
                <button id="purchase-upgrades">
                    Upgrade Store
                </button>
            </div>
            <br>
        `;

        // Click money button
        document
            .querySelector<HTMLButtonElement>("#click-button")!
            .addEventListener("click", () => {
                this.#moneyController.handleClick();
            });

        // Open upgrade store
        document
            .querySelector<HTMLButtonElement>("#purchase-upgrades")!
            .addEventListener("click", () => {
                this.#moneyController.showCreateUpgradeView();
            });

        this.notify();
    }
    /**
     * Updates the view when the player model changes
     * Side effects: updates the displayed buy power and prints a message to the console
     */
    notify(): void {
        console.log("View notified");
        this.#updateBuyPower();
    }
    /**
     * Updates the displayed buy power using the current value from the player model
     * Side effects: changes the buy power shown on the page
     */
    #updateBuyPower(): void {
        document.querySelector("#buy-power")!.textContent =
            this.#player.buyPower.toString();
    }
    /**
     * Updates the displayed value using the player's current buy power
     * Side effects: changes the value shown in the buy-power element
     */
    // level():void{
    //     document.querySelector("#buy-power")!.textContent =
    //         this.#player.buyPower.toString();
    // }
}