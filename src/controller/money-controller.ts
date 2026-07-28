/**
 * Handles user actions from the views
 * Connects the views to the player model
 */
import MoneyView from "../view/money-view.ts";
import CreateUpgradeView from "../view/create-upgrade-view.ts";
import {UpgradeType} from "../model/UpgradeType.ts";
// import db from "../model/connection.ts";
import CreateAccountView from "../view/create-account-view.ts";
import Account from "../model/Account/account.ts";
import DuplicateUserNameError from "../model/Account/DuplicateUserNameError.ts";

export default class MoneyController {

    // #player?: Player;
    #account?: Account; // logged in account
    #createAccountView?: CreateAccountView;
    #createUpgradeView?: CreateUpgradeView;

    constructor() {
        this.#createAccountView = new CreateAccountView(this);
        this.#createAccountView.show();
        // void this.#loadAccount();
        // // Get all players from the database.
        // const playersPromise: Promise<Array<Player>> =
        //     Player.getAllPLayers();
        //
        // playersPromise.then((allPlayers) => {
        //     if (allPlayers.length === 0) {
        //         // No player exists, so show the account creation view.
        //         this.#createAccountView = new CreateAccountView(this);
        //
        //         this.#createAccountView.show();
        //     } else {
        //         // Use the first player found in the database.
        //         this.#player = allPlayers[0];
        //
        //         // Only create MoneyView after the player has loaded.
        //         this.#createAccountView = new CreateAccountView(this);
        //
        //         this.#createAccountView.show();
        //         new MoneyView(this.#player,this);
        //     }
        // });
    }
    // async #loadAccount(): Promise<void>{
    //     const allAccounts: Account[] = await Account.getAllAccounts();
    //     if (allAccounts.length === 0) {
    //         this.#createAccountView = new CreateAccountView(this);
    //         this.#createAccountView.show();
    //         return; // Return when there is no acc to load
    //     }
    //     this.#account = allAccounts[0];
    //     // this.#createAccountView = new CreateAccountView(this);
    //     // this.#createAccountView.show();
    //
    //     new MoneyView(this.#account.player, this);
    // }
    async createAccount(username: string, password: string): Promise<void> {
        try {
            const account = await Account.createAccount(username, password);

            this.#account = account;
            this.#createAccountView?.close();

            new MoneyView(this.#account.player, this);
        } catch (error) {
            if (error instanceof DuplicateUserNameError) {
                this.#createAccountView?.showDuplicateError();
            }
        }
    }
    async login(username: string, password: string): Promise<void> {
        const account = await Account.login(username, password);

        if (account === null) {
            this.#createAccountView?.showErrorMessage();
            return;
        }

        this.#account = account;
        this.#createAccountView?.close();

        new MoneyView(this.#account.player, this);
    }


    /**
     * Handles the money button click from the view
     * Side effects: tells the player model to process the click
     */
    handleClick(): void {
        if (!this.#account) {
            return;
        }

        this.#account.player.click();

    }

    /**
     * Handles showing the upgrade store from the view
     * Side effects: creates the upgrade view if it does not already exist and shows it
     */
    showCreateUpgradeView(): void {
        if (!this.#account) {
            return;
        }

        // Create the dialog the first time
        if (!this.#createUpgradeView) {
            this.#createUpgradeView = new CreateUpgradeView(this.#account.player, this);
        }

        // Show the dialog
        this.#createUpgradeView.show();
    }
    showCreateAccountView(): void {
        if (!this.#account) {
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
        if (!this.#account) {
            return;
        }
        this.#account.player.purchaseByName(upgradeName);


        }


}