
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

    notify(): void {
        console.log("View notified");
        this.updateBuyPower();
    }

    updateBuyPower(): void {
        document.querySelector("#buy-power")!.textContent =
            this.#player.buyPower.toString();
    }
    level():void{
        document.querySelector("#buy-power")!.textContent =
            this.#player.buyPower.toString();
    }
}