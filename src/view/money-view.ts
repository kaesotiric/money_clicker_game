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

        // Create the main game view
        document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
            <h1>Money Clicker</h1>
            <hr/>

            <div class="mc-balance-card" aria-label="Available money balance">
                <div class="mc-balance-top">
                </div>
                <div class="mc-balance-amount">
                    <span class="mc-currency" aria-hidden="true">$</span>
                    <span id="buy-power">0</span>
                </div>
            </div>

            <div id="money-error" hidden></div>

            <div id="clicker">
                <button id="click-button" type="button">Click Me!</button>
                <button id="purchase-upgrades" type="button">Upgrade Store</button>
                <button id="robo-buy" type="button">Robo Buy: OFF</button>
            </div>
        `;

        // Click money button
        document.querySelector<HTMLButtonElement>("#click-button")!
            .addEventListener("click", () => {
                void this.#moneyController.handleClick();
            });

        // Open upgrade store
        document.querySelector<HTMLButtonElement>("#purchase-upgrades")!
            .addEventListener("click", () => {
                this.#moneyController.showCreateUpgradeView();
            });

        // Toggle RoboBuy
        document.querySelector<HTMLButtonElement>("#robo-buy")!
            .addEventListener("click", () => {
                const isOn = this.#moneyController.toggleRoboBuy();
                document.querySelector<HTMLButtonElement>("#robo-buy")!
                    .textContent = `Robo Buy: ${isOn ? "ON" : "OFF"}`;
            });

        this.notify();
    }

    /** Updates the view when the player model changes */
    notify(): void {
        this.#updateBuyPower();
    }

    /** Updates the balance with commas for thousands */
    #updateBuyPower(): void {
        const balance = document.querySelector<HTMLSpanElement>("#buy-power");
        if (balance !== null) {
            balance.textContent = this.#player.buyPower.toLocaleString("en-CA", {
                maximumFractionDigits: 2
            });
        }
    }

    /** Shows an error when progress cannot be saved */
    public displayProgressNotSaved(): void {
        const errorElement = document.querySelector<HTMLDivElement>("#money-error");
        if (errorElement !== null) {
            errorElement.textContent = "Progress could not be saved. Please try again.";
            errorElement.hidden = false;
        }
    }
}
