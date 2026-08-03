/**
 * Displays the login and account creation dialog.
 * Sends login and create-account actions to the controller.
 */

import type MoneyController from "../controller/money-controller.ts";
import type Listener from "../model/listener.ts";

export default class CreateAccountView implements Listener {
    #controller: MoneyController;
    #dialog: HTMLDialogElement;

    constructor(controller: MoneyController) {
        this.#controller = controller;

        this.#dialog = document.createElement("dialog");
        this.#dialog.id = "make-account";

        this.#dialog.innerHTML = `
            <div class="account-header">
                <div class="account-logo" aria-hidden="true">$</div>

                <div>
                    <h2>Welcome to Money Clicker!</h2>
                    <p>
                        Log in or create an account to save your progress.
                    </p>
                </div>
            </div>

            <form id="account-form" class="account-form">
                <label class="account-field" for="username">
                    <span>Username</span>

                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Enter your username"
                        autocomplete="username"
                        required
                    />
                </label>

                <label class="account-field" for="password">
                    <span>Password</span>

                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        autocomplete="current-password"
                        required
                    />
                </label>

                <p
                    id="account-error"
                    class="account-error"
                    role="alert"
                    hidden
                ></p>

                <div class="account-actions">
                    <button id="login-button" type="submit">
                        Log In
                    </button>

                    <button id="create-button" type="button">
                        Create Account
                    </button>
                </div>
            </form>
        `;

        /*
         * Using the form's submit event means the user can also
         * press Enter to log in.
         */
        this.#dialog
            .querySelector<HTMLFormElement>("#account-form")!
            .addEventListener("submit", (event) => {
                event.preventDefault();
                this.#login();
            });

        this.#dialog
            .querySelector<HTMLButtonElement>("#create-button")!
            .addEventListener("click", () => this.#createAccount());

        this.#dialog
            .querySelector<HTMLInputElement>("#username")!
            .addEventListener("input", () => this.#clearErrorMessage());

        this.#dialog
            .querySelector<HTMLInputElement>("#password")!
            .addEventListener("input", () => this.#clearErrorMessage());

        document.body.appendChild(this.#dialog);
    }

    /**
     * Opens the account dialog.
     */
    show(): void {
        this.#clearErrorMessage();

        if (!this.#dialog.open) {
            this.#dialog.show();
        }

        this.#dialog
            .querySelector<HTMLInputElement>("#username")!
            .focus();
    }

    /**
     * Closes the account dialog.
     */
    close(): void {
        if (this.#dialog.open) {
            this.#dialog.close();
        }
    }

    /**
     * Updates the view when the model changes.
     */
    notify(): void {
        // There is currently no account information to update.
    }

    /**
     * Sends the entered username and password to the controller.
     */
    #login(): void {
        const username = this.#getUsername();
        const password = this.#getPassword();

        if (!this.#validateInputs(username, password)) {
            return;
        }

        void this.#controller.login(username, password);
    }

    /**
     * Sends the entered account information to the controller.
     */
    #createAccount(): void {
        const username = this.#getUsername();
        const password = this.#getPassword();

        if (!this.#validateInputs(username, password)) {
            return;
        }

        void this.#controller.createAccount(username, password);
    }

    /**
     * Gets the username entered by the user.
     */
    #getUsername(): string {
        return this.#dialog
            .querySelector<HTMLInputElement>("#username")!
            .value
            .trim();
    }

    /**
     * Gets the password entered by the user.
     */
    #getPassword(): string {
        return this.#dialog
            .querySelector<HTMLInputElement>("#password")!
            .value;
    }

    /**
     * Checks that both account fields contain values.
     */
    #validateInputs(username: string, password: string): boolean {
        let valid = true;

        if (username.length === 0) {
            this.#displayErrorMessage("Please enter a username.");
            valid = false;
        } else if (password.length === 0) {
            this.#displayErrorMessage("Please enter a password.");
            valid = false;
        }

        return valid;
    }

    /**
     * Shows an error when the login information is incorrect.
     */
    showErrorMessage(): void {
        this.#displayErrorMessage(
            "Incorrect username or password. Please try again."
        );

        this.#clearPassword();
    }

    /**
     * Shows an error when the username already exists.
     */
    showDuplicateError(): void {
        this.#displayErrorMessage(
            "That username already exists. Try logging in or choose another username."
        );

        this.#clearPassword();
    }

    /**
     * Displays an error inside the account dialog.
     */
    #displayErrorMessage(message: string): void {
        const errorBox =
            this.#dialog.querySelector<HTMLParagraphElement>(
                "#account-error"
            )!;

        errorBox.textContent = message;
        errorBox.hidden = false;
    }

    /**
     * Removes the current error message.
     */
    #clearErrorMessage(): void {
        const errorBox =
            this.#dialog.querySelector<HTMLParagraphElement>(
                "#account-error"
            )!;

        errorBox.textContent = "";
        errorBox.hidden = true;
    }

    /**
     * Clears the password while keeping the username.
     */
    #clearPassword(): void {
        const passwordInput =
            this.#dialog.querySelector<HTMLInputElement>("#password")!;

        passwordInput.value = "";
        passwordInput.focus();
    }
}