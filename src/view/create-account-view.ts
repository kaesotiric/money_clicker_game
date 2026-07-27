/**
 * Displays the upgrade store
 * Shows upgrade levels and prices and sends purchase actions to the controller
 */

import type MoneyController from "../controller/money-controller.ts";
import type Listener from "../model/listener.ts";

export default class CreateAccountView implements Listener{
    // #account : Account;
    #controller: MoneyController;
    #dialog: HTMLDialogElement;

    constructor( controller: MoneyController) {
        // this.#account = account;
        this.#controller = controller;
        // this.#account.registerListener(this);

        this.#dialog =
            document.createElement("dialog");

        this.#dialog.id = "make-account";

        this.#dialog.innerHTML = `
            <h2>Create Account</h2>

           <input type="string" id="username" name="username:"/>
           <input type="string" id="password" name="password:" />
            <button>Create Account</button>
           
        `;
        this.#dialog.querySelector("button")!
            .addEventListener("click", () => this.#createAccount())
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
    #createAccount(){
        let username:string = this.#dialog.querySelector<HTMLInputElement>("input")!.value.trim();
        let password: string = this.#dialog.querySelector<HTMLInputElement>("input")!.value.trim();
        this.#controller.createAccount(username, password);


}


}