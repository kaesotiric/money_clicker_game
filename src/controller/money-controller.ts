// /**
//  * Handles user actions from the views
//  * Connects the views to the player model
//  */
// import MoneyView from "../view/money-view.ts";
// import CreateUpgradeView from "../view/create-upgrade-view.ts";
// import {UpgradeType} from "../model/UpgradeType.ts";
// // import db from "../model/connection.ts";
// import CreateAccountView from "../view/create-account-view.ts";
// import Account from "../model/Account/account.ts";
// import DuplicateUserNameError from "../model/ErrorMethods/DuplicateUserNameError.ts";
// import NoAccountFoundError from "../model/ErrorMethods/NoAccountFoundError.ts";
//
// export default class MoneyController {
//
//     // #player?: Player;
//     #account?: Account; // logged in account
//     #createAccountView?: CreateAccountView;
//     #createUpgradeView?: CreateUpgradeView;
//     #moneyView?: MoneyView;
//
//     constructor() {
//
//         this.#createAccountView = new CreateAccountView(this);
//         this.#createAccountView.show();
//     }
//
//     async createAccount(username: string, password: string): Promise<void> {
//         try {
//             this.#account = await Account.createAccount(username, password);
//             console.log("creating account in controller test")
//             this.#createAccountView?.close();
//
//             this.#moneyView = new MoneyView(this.#account.player, this);
//         } catch (error) {
//             if (error instanceof DuplicateUserNameError) {
//                 this.#createAccountView?.showDuplicateError();
//             }
//         }
//     }
//
//     async login(username: string, password: string): Promise<void> {
//         const account = await Account.login(username, password);
//
//         if (account === null) {
//             this.#createAccountView?.showErrorMessage();
//             return;
//         }
//
//         this.#account = account;
//         this.#createAccountView?.close();
//
//         new MoneyView(this.#account.player, this);
//     }
//
//
//     async handleClick(): Promise<void> {
//         if (!this.#account) {
//             return;
//         }
//
//         try {
//             const player = this.#account.player;
//
//             player.click();
//             await player.savePlayer();
//         } catch (error) {
//             this.#moneyView?.displayProgressNotSaved();
//         }
//     }
//
//     /**
//      * Handles showing the upgrade store from the view
//      * Side effects: creates the upgrade view if it does not already exist and shows it
//      */
//     showCreateUpgradeView(): void {
//         if (!this.#account) {
//             return;
//         }
//
//         // Create the dialog the first time
//         if (!this.#createUpgradeView) {
//             this.#createUpgradeView = new CreateUpgradeView(this.#account.player, this);
//         }
//
//         // Show the dialog
//         this.#createUpgradeView.show();
//     }
//
//     async purchaseUpgrade(upgradeName: UpgradeType): Promise<void> {
//         if (this.#account) {
//             const player = this.#account.player;
//
//             const purchasedUpgrade =
//                 player.purchaseByName(upgradeName);
//
//             if (purchasedUpgrade !== null) {
//                 const playerId = await player.savePlayer();
//
//                 await player.saveUpgrade(
//                     purchasedUpgrade,
//                     playerId
//                 );
//             }
//         }
//     }
//     public async purchaseBuilding(
//         type: UpgradeType
//     ): Promise<void> {
//         if (this.#account === undefined) {
//             throw new NoAccountFoundError();
//         }
//
//         const player = this.#account.player;
//         const building = player.purchaseBuilding(type);
//
//         if (building !== null) {
//             await player.saveBuilding(
//                 building,
//                 player.id
//             );
//         }
//     }
//
// }
//
//
//
//
//
//
/**
 * Handles user actions from the views.
 * Connects the views to the player model.
 */

import MoneyView from "../view/money-view.ts";
import CreateUpgradeView from "../view/create-upgrade-view.ts";
import CreateAccountView from "../view/create-account-view.ts";

import {UpgradeType} from "../model/UpgradeType.ts";
import Account from "../model/Account/account.ts";
import PlayerPersistence
    from "../model/player-persistence.ts";

import DuplicateUserNameError
    from "../model/ErrorMethods/DuplicateUserNameError.ts";
import NoAccountFoundError
    from "../model/ErrorMethods/NoAccountFoundError.ts";

export default class MoneyController {
    #account?: Account;
    #createAccountView?: CreateAccountView;
    #createUpgradeView?: CreateUpgradeView;
    #moneyView?: MoneyView;

    constructor() {
        this.#createAccountView = new CreateAccountView(this);

        this.#createAccountView.show();
    }

    async createAccount(
        username: string,
        password: string
    ): Promise<void> {
        try {
            this.#account =
                await Account.createAccount(username, password);

            console.log(
                "creating account in controller test"
            );

            this.#createAccountView?.close();

            this.#moneyView = new MoneyView(this.#account.player, this);
        } catch (error) {
            if (
                error instanceof DuplicateUserNameError
            ) {
                this.#createAccountView?.showDuplicateError();
            }
        }
    }

    async login(
        username: string,
        password: string
    ): Promise<void> {
        const account = await Account.login(username, password);

        if (account === null) {
            this.#createAccountView?.showErrorMessage();
            return;
        }

        this.#account = account;
        this.#createAccountView?.close();

        this.#moneyView = new MoneyView(
            this.#account.player, this);
    }

    async handleClick(): Promise<void> {
        if (!this.#account) {
            return;
        }

        try {
            const player = this.#account.player;

            player.click();

            const persistence = new PlayerPersistence(player);

            await persistence.savePlayer();
        } catch (error) {
            this.#moneyView?.displayProgressNotSaved();
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

    async purchaseUpgrade(
        upgradeName: UpgradeType
    ): Promise<void> {
        if (!this.#account) {
            return;
        }

        const player = this.#account.player;

        const purchasedUpgrade =
            player.purchaseByName(upgradeName);

        if (purchasedUpgrade !== null) {
            const persistence = new PlayerPersistence(player);

            // Saves the player's new buy power.
            const playerId = await persistence.savePlayer();

            // Saves the new upgrade level, cost,
            // and production.
            await persistence.saveUpgrade(purchasedUpgrade, playerId);
        }
    }

    public async purchaseBuilding(
        type: UpgradeType
    ): Promise<void> {
        if (this.#account === undefined) {
            throw new NoAccountFoundError();
        }

        const player = this.#account.player;

        const building =
            player.purchaseBuilding(type);

        if (building !== null) {
            const persistence = new PlayerPersistence(player);

            // Save the money spent on the building.
            const playerId = await persistence.savePlayer();

            // Save the building level, cost,
            // production and interval.
            await persistence.saveBuilding(building, playerId);
        }
    }
}