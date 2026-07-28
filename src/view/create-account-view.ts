/**
 * Displays the upgrade store
 * Shows upgrade levels and prices and sends purchase actions to the controller
 */

import type MoneyController from "../controller/money-controller.ts";
import type Listener from "../model/listener.ts";
// import Account from "../model/account.ts";

export default class CreateAccountView implements Listener{
    // #account : Account;
    #controller: MoneyController;
    #dialog: HTMLDialogElement;

    constructor( controller: MoneyController) {
        this.#controller = controller;

        this.#dialog = document.createElement("dialog");

        this.#dialog.id = "make-account";

        this.#dialog.innerHTML = `
        <h2>Log in to the Money Clicker Game!</h2>

        <input type="text" id="username" name="username" />
        <input type="password" id="password" name="password" />
        
        <p id="account-error"></p>
        
        <button id="login-button" type="button">
            Log In
        </button>

        <button id="create-button" type="button">
            Create Account
        </button>
`;

        this.#dialog.querySelector("#login-button")!
            .addEventListener("click", () => this.#login());

        this.#dialog.querySelector("#create-button")!
            .addEventListener("click", () => this.#createAccount());

        this.#dialog.querySelector("#username")!
            .addEventListener("input", () => this.#clearErrorMessage());

        this.#dialog.querySelector("#password")!
            .addEventListener("input", () => this.#clearErrorMessage());

        document.body.appendChild(this.#dialog);
        // Close button

    }
    /**
     * Shows the upgrade store
     * Side effects: updates the upgrade information and opens the dialog
     */
    show(): void {
        this.notify();
        this.#dialog.showModal();
    }
    close(): void {
        this.#dialog.close();
    }

    /**
     * Updates the view when the player model changes
     * Side effects: updates the displayed upgrade levels and prices
     */
    notify(): void {
        // this.#updateLevel();
        // this.#updatePrice()
    }
    #login():void {
        const username =
            this.#dialog
                .querySelector<HTMLInputElement>("#username")!
                .value.trim();

        const password =
            this.#dialog
                .querySelector<HTMLInputElement>("#password")!
                .value;

        void this.#controller.login(
            username,
            password
        );
    }
    #createAccount(){
        const username =
            this.#dialog
                .querySelector<HTMLInputElement>("#username")!
                .value
                .trim();

        const password =
            this.#dialog
                .querySelector<HTMLInputElement>("#password")!
                .value;

        void this.#controller.createAccount(
            username,
            password
        );
        // let username:string = this.#dialog.querySelector<HTMLInputElement>("input")!.value.trim();
        // let password: string = this.#dialog.querySelector<HTMLInputElement>("input")!.value.trim();
        // // this.#controller.createAccount(username, password);
        // this.#controller.createAccount(username, password);
}
    showErrorMessage(): void {
        const box =
            this.#dialog.querySelector<HTMLDivElement>(
                "#account-error"
            )!;

        box.textContent = "Incorrect username or password";
        box.hidden = false;
    }
    #clearErrorMessage(): void {
        const box =
            this.#dialog.querySelector<HTMLDivElement>(
                "#account-error"
            )!;

        box.textContent = "";
        box.hidden = true;
    }



}