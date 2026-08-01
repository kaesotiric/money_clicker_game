

import MoneyView from "../view/money-view.ts";
import CreateUpgradeView from "../view/create-upgrade-view.ts";
import CreateAccountView from "../view/create-account-view.ts";
import {UpgradeType} from "../model/UpgradeType.ts";
import Account from "../model/Account/account.ts";
import PlayerPersistence from "../model/player-persistence.ts";
import DuplicateUserNameError from "../model/ErrorMethods/DuplicateUserNameError.ts";
import NoAccountFoundError from "../model/ErrorMethods/NoAccountFoundError.ts";
import InsufficientBuyPowerError from "../model/ErrorMethods/InsufficientBPError.ts";


export default class MoneyController {
    #account?: Account;
    #createAccountView?: CreateAccountView;
    #createUpgradeView?: CreateUpgradeView;
    #moneyView?: MoneyView;

    constructor() {
        this.#createAccountView = new CreateAccountView(this);
        this.#createAccountView.show();
    }

    /**
     * Creates a new account using the entered information
     *
     * @param username The username entered by the user
     * @param password The password entered by the user
     * Side effects: Saves a new account and opens the main game view
     */
    async createAccount(
        username: string,
        password: string
    ): Promise<void> {
        try {
            // Account creation also creates and loads the player's information
            this.#account = await Account.createAccount(username, password);
            this.#createAccountView?.close(); // Closes since account view is no longer needed after account creation

            // Open the game using the new player's info
            this.#moneyView = new MoneyView(this.#account.player, this);

        } catch (error) {
            if (error instanceof DuplicateUserNameError) {
                this.#createAccountView?.showDuplicateError();
            }
        }
    }

    /**
     * Attempts to log in using the entered information
     *
     * @param username The username entered by the user
     * @param password The password entered by the user
     * Side effects: May close the account view and open the main game view
     */
    async login(
        username: string,
        password: string
    ): Promise<void> {
        const account = await Account.login(username, password);

        if (account === null) {
            this.#createAccountView?.showErrorMessage();
            return;
        }

        this.#account = account; // Keep the successfully loaded account in the controller
        this.#createAccountView?.close();

        // Opens the game using the player's saved information
        this.#moneyView = new MoneyView(this.#account.player, this);
    }


    /**
     * Handles a click made by the player
     *
     * Side effects: Increases buy power, updates the view and saves the player
     */
    public async handleClick(): Promise<void> {
        if (this.#account !== undefined) {
            try {
                const player = this.#account.player;
                player.click(); // Updates the player in memory first
                const persistence = new PlayerPersistence(player);
                await persistence.savePlayer(); // Saves the new buy power after the click

            } catch (error) {
                // Let the user know their latest progress was not saved due to an error
                this.#moneyView?.displayProgressNotSaved();
            }
        }
    }

    /**
     * Handles showing the upgrade store.
     */
    showCreateUpgradeView(): void {
        if (!this.#account) {
            return;
        }

        if (!this.#createUpgradeView) {
            this.#createUpgradeView = new CreateUpgradeView(this.#account.player, this);
        }

        this.#createUpgradeView.show();
    }
    /**
     * Attempts to purchase and save a regular upgrade
     *
     * @param upgradeName The type of upgrade being purchased
     * Side effects: May change and save the player's money and upgrade
     */

    public async purchaseUpgrade(
        upgradeName: UpgradeType
    ): Promise<void> {
        if (this.#account !== undefined) {
            try {
                const player = this.#account.player;

                // This throws an error when the player cannot afford the upgrade
                const purchasedUpgrade = player.purchaseByName(upgradeName);

                if (purchasedUpgrade !== null) {
                    const persistence = new PlayerPersistence(player);

                    // Save the money spent on the upgrade
                    const playerId = await persistence.savePlayer();

                    // Save the new upgrade information
                    await persistence.saveUpgrade(purchasedUpgrade, playerId);
                }
            } catch (error) {
                if (error instanceof InsufficientBuyPowerError) {
                    // Tell the upgrade view to show the error
                    this.#createUpgradeView?.showInsufficientBuyPowerError();
                } else {
                    throw error;
                }
            }
        }
    }

    /**
     * Attempts to purchase and save a building
     *
     * @param type The type of building being purchased
     * @throws NoAccountFoundError When no account is logged in
     * Side effects: May change and save the player's money and building
     */
    public async purchaseBuilding(
        type: UpgradeType
    ): Promise<void> {
        if (this.#account === undefined) {
            throw new NoAccountFoundError();
        } else {
            try {
                const player = this.#account.player;

                // The player throws an error when they cannot afford the building
                const building = player.purchaseBuilding(type);

                if (building !== null) {
                    const persistence = new PlayerPersistence(player);

                    // Save the money spent and get the player's database ID
                    const playerId = await persistence.savePlayer();

                    // Save the level, cost, production and interval speed
                    await persistence.saveBuilding(building, playerId);
                }
            } catch (error) {
                if (error instanceof InsufficientBuyPowerError) {
                    // Tell the upgrade view to show the error
                    this.#createUpgradeView?.showInsufficientBuyPowerError();
                } else {
                    throw error;
                }
            }
        }
    }
}