/**
 * Handles user actions from the views
 * Connects the views to the player model
 */
import Player from "../model/player.ts";
import MoneyView from "../view/money-view.ts";
import CreateUpgradeView from "../view/create-upgrade-view.ts";
import {UpgradeType} from "../model/UpgradeType.ts";
// import db from "../model/connection.ts";
import CreateAccountView from "../view/create-account-view.ts";
import Account from "../model/account.ts";

export default class MoneyController {

    #player?: Player;
    #createUpgradeView?: CreateUpgradeView;
    #createAccountView?: CreateAccountView;

    constructor() {
        // Get all players from the database.
        const playersPromise: Promise<Array<Player>> =
            Player.getAllPLayers();

        playersPromise.then((allPlayers) => {
            if (allPlayers.length === 0) {
                // No player exists, so show the account creation view.
                this.#createAccountView = new CreateAccountView(this);

                this.#createAccountView.show();
            } else {
                // Use the first player found in the database.
                this.#player = allPlayers[0];

                // Only create MoneyView after the player has loaded.
                this.#createAccountView = new CreateAccountView(this);

                this.#createAccountView.show();
                // new MoneyView(this.#player, this);
            }
        });
    }
    createAccount(username: string, password: string): void {
        const account = new Account(username, password);

        this.#player = new Player(username);
        this.#player.account = account;

        this.#createAccountView?.close();

        new MoneyView(this.#player, this);
    }
    //     //Are there any player in the database
    //
    //     // let Promise<Array<Player>> playersPromise = Player.getAllPlayers();
    //     // If no instance of player, then make an instance of make account
    //     let Promise<Array<Player>> playersPromise = Player.getAllPLayers();
    //     playersPromise.then((allPlayers) =>{
    //         if(allPlayers.length === 0){
    //             //Show make-account-view and make the user create an account
    //         }else{
    //             this.#player = allPlayers.at(0);
    //             this.#player
    //         }
    //     )};
    //     // Player.getAllPLayers().then;
    //     //If there are player, then make an instance of this view
    //     this.#player = new Player("");
    //     //
    //
    //     //If curr no player, make an instance of  create account view
    //
    //     new MoneyView(this.#player, this);
    // }
    // static async getAllPLayers(): Promise<Array<Player>> {
    //     const allPLayers = new Array<Player>();
    //     //
    //     let results = await db()
    //         .query<{name: string}>("select name from player"); // Asking PGLite to give us data from db
    //     // We then need to transform those rows into instances of Player
    //
    //     results.rows.forEach((row) => {
    //         allPLayers.push(new Player(row.name));
    //     })
    //     return allPLayers;
    // }

    /**
     * Handles the money button click from the view
     * Side effects: tells the player model to process the click
     */
    handleClick(): void {
        if (this.#player) {
            this.#player.click();
        }
    }

    /**
     * Handles showing the upgrade store from the view
     * Side effects: creates the upgrade view if it does not already exist and shows it
     */
    showCreateUpgradeView(): void {
        if (!this.#player) {
            return;
        }
        // Create the dialog the first time
        if (!this.#createUpgradeView) {
            this.#createUpgradeView = new CreateUpgradeView(this.#player, this);
        }

        // Show the dialog
        this.#createUpgradeView.show();
    }
    showCreateAccountView(): void {
        if (!this.#player) {
            return;
        }
        // Create the dialog the first time
        if (!this.#createAccountView) {
            this.#createAccountView = new CreateAccountView(this);
        }

        // Show the dialog
        this.#createAccountView.show();
    }

    /**
     * Handles an upgrade purchase request from the view
     * @param upgradeName the type of upgrade being purchased
     * Side effects: tells the player model to attempt the purchase
     */
    purchaseUpgrade(upgradeName: UpgradeType) {
        if (this.#player) {
            this.#player.purchaseByName(upgradeName);
        }

        }


}