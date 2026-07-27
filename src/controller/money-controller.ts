/**
 * Handles user actions from the views
 * Connects the views to the player model
 */
import Player from "../model/player.ts";
import MoneyView from "../view/money-view.ts";
import CreateUpgradeView from "../view/create-upgrade-view.ts";
import {UpgradeType} from "../model/UpgradeType.ts";

export default class MoneyController {

    #player: Player;
    #createUpgradeView?: CreateUpgradeView;

    constructor() {
        //Are there any player in the database
        //If no instance of player, then make an instance of make account
        //If there are player, then make an instance of this view
        this.#player = new Player();
        new MoneyView(this.#player, this);
    }

    /**
     * Handles the money button click from the view
     * Side effects: tells the player model to process the click
     */
    handleClick(): void {
        this.#player.click();
    }

    /**
     * Handles showing the upgrade store from the view
     * Side effects: creates the upgrade view if it does not already exist and shows it
     */
    showCreateUpgradeView(): void {

        // Create the dialog the first time
        if (!this.#createUpgradeView) {
            this.#createUpgradeView = new CreateUpgradeView(this.#player, this);
        }

        // Show the dialog
        this.#createUpgradeView.show();
    }

    /**
     * Handles an upgrade purchase request from the view
     * @param upgradeName the type of upgrade being purchased
     * Side effects: tells the player model to attempt the purchase
     */
    purchaseUpgrade(upgradeName: UpgradeType) {
        this.#player.purchaseByName(upgradeName);
    }


}