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

    async createAccount(username: string, password: string): Promise<void> {
        try {
            const account = await Account.createAccount(username, password);

            this.#account = account;
            console.log("creating account in controller test")
            this.#createAccountView?.close();

            new MoneyView(this.#account.player, this);
        } catch (error) {
            if (error instanceof DuplicateUserNameError) {
                this.#createAccountView?.showDuplicateError();
            }
        }
    }

    // async createAccount(
    //     username: string,
    //     password: string
    // ): Promise<void> {
    //     try {
    //         console.log("CONTROLLER STEP 1: Request received");
    //
    //         const account = await Account.createAccount(
    //             username,
    //             password
    //         );
    //
    //         console.log("CONTROLLER STEP 2: Account received", account);
    //
    //         this.#account = account;
    //         this.#createAccountView?.close();
    //
    //         console.log("CONTROLLER STEP 3: Account view closed");
    //
    //         new MoneyView(this.#account.player, this);
    //
    //         console.log("CONTROLLER STEP 4: MoneyView created");
    //     } catch (error) {
    //         console.error("CREATE ACCOUNT FAILED:", error);
    //
    //         if (error instanceof DuplicateUserNameError) {
    //             this.#createAccountView?.showDuplicateError();
    //         } else {
    //             alert("Create account failed. Check the console.");
    //         }
    //     }
    // }
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
    // async handleClick(): Promise<void> {
    //     if (!this.#account) {
    //         return;
    //     }
    //
    //     const player = this.#account.player;
    //
    //     player.click();
    //     await player.savePlayer();
    // }
    async handleClick(): Promise<void> {
        if (!this.#account) {
            return;
        }

        try {
            const player = this.#account.player;

            player.click();

            console.log("Buy power before saving:", player.buyPower);

            await player.savePlayer();

            console.log("Player successfully saved");
        } catch (error) {
            console.error("Could not save player:", error);
        }
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

    // /**
    //  * Handles an upgrade purchase request from the view
    //  * @param upgradeName the type of upgrade being purchased
    //  * Side effects: tells the player model to attempt the purchase
    //  */
    // async purchaseUpgrade(upgradeName: UpgradeType) {
    //     if (!this.#account) {
    //         return;
    //     }
    //
    //     const purchasedUpgrade = this.#account.player.purchaseByName(upgradeName);
    //     const playerId = await this.#account.player.savePlayer();
    //     await this.#account.player.saveUpgrade(purchasedUpgrade, playerId);
    //
    //     }
    async purchaseUpgrade(upgradeName: UpgradeType): Promise<void> {
        if (this.#account) {
            const player = this.#account.player;

            const purchasedUpgrade =
                player.purchaseByName(upgradeName);

            if (purchasedUpgrade !== null) {
                const playerId = await player.savePlayer();

                await player.saveUpgrade(
                    purchasedUpgrade,
                    playerId
                );
            }
        }
    }
    public purchaseBuilding(type: UpgradeType): void {
        if (this.#account !== undefined) {
            this.#account.player.purchaseBuilding(type);
        }
    }

}