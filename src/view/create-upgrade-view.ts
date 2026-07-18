import type MoneyController from "../controller/money-controller.ts";
import type Player from "../model/player.ts";
// import {FinancialAdvisor} from "../model/financial-advisor.ts";
import type Listener from "../model/listener.ts";

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
                this.#controller.purchaseUpgrade("Financial Advisor");
            });
        this.#dialog
            .querySelector<HTMLButtonElement>("#purchase-employer")!
            .addEventListener("click", () => {
                this.#controller.purchaseUpgrade("Employer");
            });
    }

    show(): void {
       this.notify();
        this.#dialog.showModal();
    }
    notify(): void {
        this.updateLevel();
        this.updatePrice()
    }
    private updateLevel(): void {
        this.#dialog.querySelector<HTMLSpanElement>("#advisor-level")!
            .textContent = this.#player.getAdvisorLevel("Financial Advisor").toString();
        this.#dialog.querySelector<HTMLSpanElement>("#employer-level")!
            .textContent = this.#player.getAdvisorLevel("Employer").toString();
    }
    private updatePrice(): void {
        this.#dialog.querySelector<HTMLSpanElement>("#advisor-price")!
            .textContent = this.#player.getPrice("Financial Advisor").toString();
        this.#dialog.querySelector<HTMLSpanElement>("#employer-price")!
            .textContent = this.#player.getPrice("Employer").toString();
    }

}