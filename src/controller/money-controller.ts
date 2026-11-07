import MoneyView from "../view/money-view.ts";
import CreateUpgradeView from "../view/create-upgrade-view.ts";
import CreateAccountView from "../view/create-account-view.ts";
import { UpgradeType } from "../model/UpgradeType.ts";
import Account from "../model/Account/account.ts";
import PlayerPersistence from "../model/player-persistence.ts";
import DuplicateUserNameError from "../model/ErrorMethods/DuplicateUserNameError.ts";
import NoAccountFoundError from "../model/ErrorMethods/NoAccountFoundError.ts";
import InsufficientBuyPowerError from "../model/ErrorMethods/InsufficientBPError.ts";
import RoboBuy from "../model/RoboBuy";

export default class MoneyController {
    #account?: Account;
    #roboBuy: RoboBuy;
    #createAccountView?: CreateAccountView;
    #createUpgradeView?: CreateUpgradeView;
    #moneyView?: MoneyView;

    // Tracks money earned by clicks and buildings
    #lastBalance = 0;
    #isClicking = false;
    #incomeCheckInterval?: number;
    #autoSaveInterval?: number;
    #passiveFloaterTimer?: number;
    #pendingPassiveIncome = 0;
    #floaterCount = 0;

    constructor() {
        this.#createAccountView = new CreateAccountView(this);
        this.#createAccountView.show();
        this.#roboBuy = new RoboBuy();
    }

    /** Creates an account and opens the main game */
    public async createAccount(username: string, password: string): Promise<void> {
        try {
            this.#account = await Account.createAccount(username, password);
            this.#createAccountView?.close();

            this.#moneyView = new MoneyView(this.#account.player, this);
            this.updateMoneyBill();
            this.showCreateUpgradeView();
            this.#watchMoneyChanges();
            this.#startAutoSave(this.#account);
        } catch (error) {
            if (error instanceof DuplicateUserNameError) {
                this.#createAccountView?.showDuplicateError();
            } else {
                throw error;
            }
        }
    }

    /** Logs in and restores the saved game */
    public async login(username: string, password: string): Promise<void> {
        const account = await Account.login(username, password);

        if (account === null) {
            this.#createAccountView?.showErrorMessage();
            return;
        }

        this.#account = account;
        this.#createAccountView?.close();

        this.#moneyView = new MoneyView(account.player, this);
        this.updateMoneyBill();
        this.showCreateUpgradeView();
        this.#watchMoneyChanges();
        this.#startAutoSave(account);
    }

    /** Adds earnings from clicking the banknote */
    public async handleClick(): Promise<void> {
        if (this.#account === undefined) return;

        const player = this.#account.player;

        try {
            const balanceBefore = player.buyPower;

            // Suppress the passive-income floater for this manual click
            this.#isClicking = true;
            try {
                player.click();
            } finally {
                this.#isClicking = false;
            }

            const earned = player.buyPower - balanceBefore;
            this.#lastBalance = player.buyPower;

            // Show the real amount earned, even after click upgrades
            if (earned > 0) {
                this.#showMoneyFloater(earned, "click");
            }

            this.#runRoboBuy(player);
            this.#checkMoneyChanges(player);
            this.updateMoneyBill();

            const persistence = new PlayerPersistence(player);
            await persistence.savePlayer();
        } catch (error) {
            this.#moneyView?.displayProgressNotSaved();
        }
    }

    /** Shows the permanent Upgrade Store sidebar */
    public showCreateUpgradeView(): void {
        if (!this.#account) return;

        if (!this.#createUpgradeView) {
            this.#createUpgradeView = new CreateUpgradeView(this.#account.player, this);
        }
        this.#createUpgradeView.show();
    }

    /** Purchases a click upgrade */
    public async purchaseUpgrade(upgradeName: UpgradeType): Promise<void> {
        if (this.#account === undefined) return;

        try {
            const player = this.#account.player;
            const purchasedUpgrade = player.purchaseByName(upgradeName);

            this.#checkMoneyChanges(player);
            this.updateMoneyBill();

            if (purchasedUpgrade !== null) {
                this.#roboBuy.setState(upgradeName);
                const persistence = new PlayerPersistence(player);
                const playerId = await persistence.savePlayer();
                await persistence.saveUpgrade(purchasedUpgrade, playerId);
            }
        } catch (error) {
            if (error instanceof InsufficientBuyPowerError) {
                this.#createUpgradeView?.showInsufficientBuyPowerError();
            } else {
                throw error;
            }
        }
    }

    /** Purchases an auto-clicking building */
    public async purchaseBuilding(type: UpgradeType): Promise<void> {
        if (this.#account === undefined) {
            throw new NoAccountFoundError();
        }

        try {
            const player = this.#account.player;
            const building = player.purchaseBuilding(type);
            this.#checkMoneyChanges(player);

            if (building !== null) {
                this.#roboBuy.setState(type);
                const persistence = new PlayerPersistence(player);
                const playerId = await persistence.savePlayer();
                await persistence.saveBuilding(building, playerId);
            }
        } catch (error) {
            if (error instanceof InsufficientBuyPowerError) {
                this.#createUpgradeView?.showInsufficientBuyPowerError();
            } else {
                throw error;
            }
        }
    }

    /** Saves the player's progress every second */
    #startAutoSave(account: Account): void {
        if (this.#autoSaveInterval !== undefined) {
            window.clearInterval(this.#autoSaveInterval);
        }

        this.#autoSaveInterval = window.setInterval(async () => {
            this.#runRoboBuy(account.player);
            this.#checkMoneyChanges(account.player);
            this.updateMoneyBill();

            const persistence = new PlayerPersistence(account.player);
            await persistence.savePlayer();
        }, 1000);
    }

    public toggleRoboBuy(): boolean {
        this.#roboBuy.toggle();

        if (this.#roboBuy.isOn && this.#account !== undefined) {
            this.#runRoboBuy(this.#account.player);
            this.#checkMoneyChanges(this.#account.player);
            this.updateMoneyBill();
        }

        return this.#roboBuy.isOn;
    }

    /**
     * Runs RoboBuy and announces only purchases that actually changed a level
     * A balance drop alone is not enough to identify what was purchased
     */
    #runRoboBuy(player: Account["player"]): void {
        const types: UpgradeType[] = [
            UpgradeType.FinancialAdvisor,
            UpgradeType.Employer,
            UpgradeType.FreelanceContract,
            UpgradeType.SideBusiness,
            UpgradeType.InvestmentPortfolio,
            UpgradeType.PropertyEmpire,
            UpgradeType.TechStartup,
            UpgradeType.RoyalMint,
            UpgradeType.Banker,
            UpgradeType.ATMNetwork,
            UpgradeType.InvestmentFirm,
            UpgradeType.TechCompany,
            UpgradeType.BankHeadquarters,
            UpgradeType.GlobalCorporation
        ];

        // Snapshot levels just before RoboBuy changes the Player
        const before = types.map(type => player.findUpgradeLevel(type));
        this.#roboBuy.run(player);

        // Only RoboBuy purchases appear here, not manual purchases
        for (let i = 0; i < types.length; i++) {
            const bought = player.findUpgradeLevel(types[i]) - before[i];
            if (bought > 0) {
                this.#createUpgradeView?.showRoboBuyPurchase(types[i], bought);
            }
        }
    }

    private updateMoneyBill(): void {
        if (this.#account === undefined) return;

        const amount = this.#account.player.currClick;
        const button = document.querySelector<HTMLButtonElement>("#click-button");

        if (button !== null) {
            button.dataset.perClick = new Intl.NumberFormat("en-CA", {
                notation: "compact",
                maximumFractionDigits: 1
            }).format(amount);

            button.setAttribute("aria-label", `Click to earn ${amount} money`);
        }
    }

    /** Watches both manual and automatic changes in the player's balance */
    #watchMoneyChanges(): void {
        const player = this.#account?.player;
        if (player === undefined) return;

        // Stop watchers from a previous login
        if (this.#incomeCheckInterval !== undefined) {
            window.clearInterval(this.#incomeCheckInterval);
        }
        if (this.#passiveFloaterTimer !== undefined) {
            window.clearTimeout(this.#passiveFloaterTimer);
            this.#passiveFloaterTimer = undefined;
        }

        this.#pendingPassiveIncome = 0;
        this.#lastBalance = player.buyPower;

        // Immediate updates when the Player notifies its listeners
        player.registerListener({
            notify: () => {
                if (this.#account?.player === player) {
                    this.#checkMoneyChanges(player);
                }
            }
        });

        // Fallback for building timers that modify buyPower without notifying
        this.#incomeCheckInterval = window.setInterval(() => {
            if (this.#account?.player === player) {
                this.#checkMoneyChanges(player);
            }
        }, 200);
    }

    /** Detects positive balance changes not caused by a manual click */
    #checkMoneyChanges(player: Account["player"]): void {
        const currentBalance = player.buyPower;
        const earned = currentBalance - this.#lastBalance;
        this.#lastBalance = currentBalance;

        if (!this.#isClicking && earned > 0) {
            this.#pendingPassiveIncome += earned;

            // Combine frequent building payouts into one gentle floater
            if (this.#passiveFloaterTimer === undefined) {
                this.#passiveFloaterTimer = window.setTimeout(() => {
                    const total = this.#pendingPassiveIncome;
                    this.#pendingPassiveIncome = 0;
                    this.#passiveFloaterTimer = undefined;
                    this.#showMoneyFloater(total, "building");
                }, 450);
            }
        }
    }

    /** Displays a floating amount above the money bill */
    #showMoneyFloater(amount: number, kind: "click" | "building"): void {
        if (!Number.isFinite(amount) || amount <= 0) return;

        const button = document.querySelector<HTMLButtonElement>("#click-button");
        const clicker = document.querySelector<HTMLElement>("#clicker");
        if (button === null || clicker === null) return;

        const floater = document.createElement("span");
        floater.className = `mc-earning-floater mc-earning-floater--${kind}`;
        floater.textContent = `+$${new Intl.NumberFormat("en-CA", {
            notation: "compact",
            maximumFractionDigits: 1
        }).format(amount)}`;
        floater.setAttribute("aria-hidden", "true");

        const billRect = button.getBoundingClientRect();
        const clickerRect = clicker.getBoundingClientRect();
        const x = billRect.left - clickerRect.left + billRect.width * (kind === "click" ? 0.5 : 0.7);
        const y = billRect.top - clickerRect.top + billRect.height * (kind === "click" ? 0.38 : 0.25);

        floater.style.left = `${x}px`;
        floater.style.top = `${y}px`;
        floater.style.setProperty("--mc-drift", `${(this.#floaterCount++ % 5 - 2) * 22}px`);

        clicker.appendChild(floater);
        window.setTimeout(() => floater.remove(), 1400);
    }
}
