import Player from "../model/player.ts";
import MoneyView from "../view/money-view.ts";
import CreateUpgradeView from "../view/create-upgrade-view.ts";

export default class MoneyController {

    #player: Player;
    #view: MoneyView;
    #createUpgradeView?: CreateUpgradeView;

    constructor() {
        this.#player = new Player();
        this.#player.fillArray()

        this.#view = new MoneyView(this.#player, this);

        this.#player.fillArray();
    }

    handleClick(): void {
        this.#player.click();
    }

    showCreateUpgradeView(): void {

        // Create the dialog the first time
        if (!this.#createUpgradeView) {
            this.#createUpgradeView = new CreateUpgradeView(this.#player, this);
        }

        // Show the dialog
        this.#createUpgradeView.show();
    }
    purchaseUpgrade(upgradeName:string){
        this.#player.purchaseByName(upgradeName);
    }


}