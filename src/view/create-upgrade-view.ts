/**
 * Displays the upgrade store
 * Shows upgrade levels and prices and sends purchase actions to the controller
 */

import type MoneyController from "../controller/money-controller.ts";
import type Player from "../model/player.ts";
import type Listener from "../model/listener.ts";
import {UpgradeType} from "../model/UpgradeType.ts";

export default class CreateUpgradeView implements Listener{
    #player : Player;
    #controller: MoneyController;
    #dialog: HTMLDialogElement;

    constructor(player: Player, controller: MoneyController) {
        this.#player = player;
        this.#controller = controller;
        this.#player.registerListener(this);

        this.#dialog =
            document.createElement("dialog");

        this.#dialog.id = "upgrade-store";

        this.#dialog.innerHTML = `
            <h2>Upgrade Store</h2>

            <button id="purchase-advisor">
                Buy Financial Advisor
            </button>
            <span>Level: <span id="advisor-level">0</span></span>
            <span>Price: <span id="advisor-price">20</span></span>

            <br><br>

            <button id="purchase-employer">
                Buy Employer
            </button>
             <span>Level: <span id="employer-level">0</span></span>
            <span>Price: <span id="employer-price">100</span></span>

            <br><br>
            
            <button id="purchase-mint">
                Buy Royal Mint
            </button>
             <span>Level: <span id="mint-level"></span></span>
            <span>Price: <span id="mint-price"></span></span>

            <br><br>
            
            <button id="purchase-banker">
                Buy Banker
            </button>
             <span>Level: <span id="banker-level"></span></span>
            <span>Price: <span id="banker-price"></span></span>

            <br><br>

            <button id="close-store">
                Exit
            </button>
        `;

        document.body.appendChild(this.#dialog);

        // Close button
        this.#dialog
            .querySelector<HTMLButtonElement>("#close-store")!
            .addEventListener("click", () => {
                this.#dialog.close();
            });
        this.#dialog
            .querySelector<HTMLButtonElement>("#purchase-advisor")!
            .addEventListener("click", () => {
                this.#controller.purchaseUpgrade(UpgradeType.FinancialAdvisor);
            });
        this.#dialog
            .querySelector<HTMLButtonElement>("#purchase-employer")!
            .addEventListener("click", () => {
                this.#controller.purchaseUpgrade(UpgradeType.Employer);
            });
        this.#dialog
            .querySelector<HTMLButtonElement>("#purchase-banker")!
            .addEventListener("click", () => {
                this.#controller.purchaseBuilding(UpgradeType.Banker);
            });
        this.#dialog
            .querySelector<HTMLButtonElement>("#purchase-mint")!
            .addEventListener("click", () => {
                this.#controller.purchaseBuilding(UpgradeType.RoyalMint);
            });
    }
    /**
     * Shows the upgrade store
     * Side effects: updates the upgrade information and opens the dialog
     */
    show(): void {
       this.notify();
        this.#dialog.showModal();
    }
    /**
     * Updates the view when the player model changes
     * Side effects: updates the displayed upgrade levels and prices
     */
    notify(): void {
        this.#updateLevel();
        this.#updatePrice()
    }
    /**
     * Updates the displayed levels using the current upgrade levels from the player model
     * Side effects: changes the advisor and employer levels shown in the view
     */
    #updateLevel(): void {
        this.#dialog.querySelector<HTMLSpanElement>("#advisor-level")!
            .textContent = this.#player.findUpgradeLevel(UpgradeType.FinancialAdvisor).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#employer-level")!
            .textContent = this.#player.findUpgradeLevel(UpgradeType.Employer).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#banker-level")!
            .textContent = this.#player.findUpgradeLevel(UpgradeType.Banker).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#mint-level")!
            .textContent = this.#player.findUpgradeLevel(UpgradeType.RoyalMint).toString();
    }
    /**
     * Updates the displayed prices using the current upgrade prices from the player model
     * Side effects: changes the advisor and employer prices shown in the view
     */
    #updatePrice(): void {
        this.#dialog.querySelector<HTMLSpanElement>("#advisor-price")!
            .textContent = this.#player.findPrice(UpgradeType.FinancialAdvisor).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#employer-price")!
            .textContent = this.#player.findPrice(UpgradeType.Employer).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#banker-price")!
            .textContent = this.#player.findPrice(UpgradeType.Banker).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#mint-price")!
            .textContent = this.#player.findPrice(UpgradeType.RoyalMint).toString();
    }

}