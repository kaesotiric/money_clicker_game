/**
 * Displays the upgrade store
 * Shows upgrade levels and prices and sends purchase actions to the controller
 */

import type MoneyController from "../controller/money-controller.ts";
import type Player from "../model/player.ts";
import type Listener from "../model/listener.ts";
import {UpgradeType} from "../model/UpgradeType.ts";

export default class CreateUpgradeView implements Listener {
    #player: Player;
    #controller: MoneyController;
    #dialog: HTMLDialogElement;

    constructor(player: Player, controller: MoneyController) {
        this.#player = player;
        this.#controller = controller;
        this.#player.registerListener(this);

        this.#dialog =
            document.createElement("dialog");

        this.#dialog.id = "upgrade-store";

        // this.#dialog.innerHTML = `
        //     <h2>Upgrade Store</h2>
        //
        //     <div id="upgrade-error" hidden></div>
        //
        //     <button id="purchase-advisor">
        //         Buy Financial Advisor
        //     </button>
        //     <span>Level: <span id="advisor-level">0</span></span>
        //     <span>Price: <span id="advisor-price">20</span></span>
        //
        //     <br><br>
        //
        //     <button id="purchase-employer">
        //         Buy Employer
        //     </button>
        //      <span>Level: <span id="employer-level">0</span></span>
        //     <span>Price: <span id="employer-price">100</span></span>
        //
        //     <br><br>
        //
        //     <button id="purchase-mint">
        //         Buy Royal Mint
        //     </button>
        //      <span>Level: <span id="mint-level"></span></span>
        //     <span>Price: <span id="mint-price"></span></span>
        //
        //     <br><br>
        //
        //     <button id="purchase-banker">
        //         Buy Banker
        //     </button>
        //      <span>Level: <span id="banker-level"></span></span>
        //     <span>Price: <span id="banker-price"></span></span>
        //
        //     <br><br>
        //
        //     <button id="close-store">
        //         Exit
        //     </button>
        // `;

        this.#dialog.innerHTML = `
    <h2>Upgrade Store</h2>

    <div id="upgrade-error" hidden></div>

    <h3>Upgrades</h3>

    <button id="purchase-advisor">
        Buy Financial Advisor
    </button>
    <span>Level: <span id="advisor-level">0</span></span>
    <span>Price: <span id="advisor-price">50</span></span>

    <br><br>

    <button id="purchase-employer">
        Buy Employer
    </button>
    <span>Level: <span id="employer-level">0</span></span>
    <span>Price: <span id="employer-price">100</span></span>

    <br><br>

    <button id="purchase-freelance">
        Buy Freelance Contract
    </button>
    <span>Level: <span id="freelance-level">0</span></span>
    <span>Price: <span id="freelance-price">250</span></span>

    <br><br>

    <button id="purchase-side-business">
        Buy Side Business
    </button>
    <span>Level: <span id="side-business-level">0</span></span>
    <span>Price: <span id="side-business-price">500</span></span>

    <br><br>

    <button id="purchase-investment-portfolio">
        Buy Investment Portfolio
    </button>
    <span>Level: <span id="investment-portfolio-level">0</span></span>
    <span>Price: <span id="investment-portfolio-price">1500</span></span>

    <br><br>

    <button id="purchase-property-empire">
        Buy Property Empire
    </button>
    <span>Level: <span id="property-empire-level">0</span></span>
    <span>Price: <span id="property-empire-price">5000</span></span>

    <br><br>

    <button id="purchase-tech-startup">
        Buy Tech Startup
    </button>
    <span>Level: <span id="tech-startup-level">0</span></span>
    <span>Price: <span id="tech-startup-price">15000</span></span>

    <br><br>

    <h3>Buildings</h3>

    <button id="purchase-mint">
        Buy Royal Mint
    </button>
    <span>Level: <span id="mint-level">0</span></span>
    <span>Price: <span id="mint-price">500</span></span>

    <br><br>

    <button id="purchase-banker">
        Buy Banker
    </button>
    <span>Level: <span id="banker-level">0</span></span>
    <span>Price: <span id="banker-price">1000</span></span>

    <br><br>

    <button id="purchase-atm">
        Buy ATM Network
    </button>
    <span>Level: <span id="atm-level">0</span></span>
    <span>Price: <span id="atm-price">2500</span></span>

    <br><br>

    <button id="purchase-investment-firm">
        Buy Investment Firm
    </button>
    <span>Level: <span id="investment-firm-level">0</span></span>
    <span>Price: <span id="investment-firm-price">7500</span></span>

    <br><br>

    <button id="purchase-tech-company">
        Buy Tech Company
    </button>
    <span>Level: <span id="tech-company-level">0</span></span>
    <span>Price: <span id="tech-company-price">20000</span></span>

    <br><br>

    <button id="purchase-bank-headquarters">
        Buy Bank Headquarters
    </button>
    <span>Level: <span id="bank-headquarters-level">0</span></span>
    <span>Price: <span id="bank-headquarters-price">50000</span></span>

    <br><br>

    <button id="purchase-global-corporation">
        Buy Global Corporation
    </button>
    <span>Level: <span id="global-corporation-level">0</span></span>
    <span>Price: <span id="global-corporation-price">100000</span></span>

    <br><br>

    <button id="close-store">
        Exit
    </button>
`;

        document.body.appendChild(this.#dialog);

        // Close button
        this.#dialog
            .querySelector<HTMLButtonElement>("#close-store")!
            .addEventListener("click", () => {
                this.#dialog.close();
            });
        this.#dialog
            .querySelector<HTMLButtonElement>("#purchase-advisor")!
            .addEventListener("click", () => {
                this.#controller.purchaseUpgrade(UpgradeType.FinancialAdvisor);
            });
        this.#dialog
            .querySelector<HTMLButtonElement>("#purchase-employer")!
            .addEventListener("click", () => {
                this.#controller.purchaseUpgrade(UpgradeType.Employer);
            });
        this.#dialog
            .querySelector<HTMLButtonElement>("#purchase-banker")!
            .addEventListener("click", () => {
                this.#controller.purchaseBuilding(UpgradeType.Banker);
            });
        this.#dialog
            .querySelector<HTMLButtonElement>("#purchase-mint")!
            .addEventListener("click", () => {
                this.#controller.purchaseBuilding(UpgradeType.RoyalMint);
            });

        // 10 New Buildings and Upgrades
        this.#dialog
            .querySelector<HTMLButtonElement>("#purchase-freelance")!
            .addEventListener("click", () => {
                this.#controller.purchaseUpgrade(UpgradeType.FreelanceContract);
            });

        this.#dialog
            .querySelector<HTMLButtonElement>("#purchase-side-business")!
            .addEventListener("click", () => {
                this.#controller.purchaseUpgrade(UpgradeType.SideBusiness);
            });

        this.#dialog
            .querySelector<HTMLButtonElement>("#purchase-investment-portfolio")!
            .addEventListener("click", () => {
                this.#controller.purchaseUpgrade(UpgradeType.InvestmentPortfolio);
            });

        this.#dialog
            .querySelector<HTMLButtonElement>("#purchase-property-empire")!
            .addEventListener("click", () => {
                this.#controller.purchaseUpgrade(UpgradeType.PropertyEmpire);
            });

        this.#dialog
            .querySelector<HTMLButtonElement>("#purchase-tech-startup")!
            .addEventListener("click", () => {
                this.#controller.purchaseUpgrade(UpgradeType.TechStartup);
            });

        this.#dialog
            .querySelector<HTMLButtonElement>("#purchase-atm")!
            .addEventListener("click", () => {
                this.#controller.purchaseBuilding(UpgradeType.ATMNetwork);
            });

        this.#dialog
            .querySelector<HTMLButtonElement>("#purchase-investment-firm")!
            .addEventListener("click", () => {
                this.#controller.purchaseBuilding(UpgradeType.InvestmentFirm);
            });

        this.#dialog
            .querySelector<HTMLButtonElement>("#purchase-tech-company")!
            .addEventListener("click", () => {
                this.#controller.purchaseBuilding(UpgradeType.TechCompany);
            });

        this.#dialog
            .querySelector<HTMLButtonElement>("#purchase-bank-headquarters")!
            .addEventListener("click", () => {
                this.#controller.purchaseBuilding(UpgradeType.BankHeadquarters);
            });

        this.#dialog
            .querySelector<HTMLButtonElement>("#purchase-global-corporation")!
            .addEventListener("click", () => {
                this.#controller.purchaseBuilding(UpgradeType.GlobalCorporation);
            });
    }

    /**
     * Shows the upgrade store
     * Side effects: updates the upgrade information and opens the dialog
     */
    show(): void {
        this.notify();
        this.#dialog.showModal();
    }

    /**
     * Updates the view when the player model changes
     * Side effects: updates the displayed upgrade levels and prices
     */
    notify(): void {
        this.#updateLevel();
        this.#updatePrice()
    }

    /**
     * Updates the displayed levels using the current upgrade levels from the player model
     * Side effects: changes the advisor and employer levels shown in the view
     */
    #updateLevel(): void {
        this.#dialog.querySelector<HTMLSpanElement>("#advisor-level")!
            .textContent = this.#player.findUpgradeLevel(UpgradeType.FinancialAdvisor).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#employer-level")!
            .textContent = this.#player.findUpgradeLevel(UpgradeType.Employer).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#banker-level")!
            .textContent = this.#player.findUpgradeLevel(UpgradeType.Banker).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#mint-level")!
            .textContent = this.#player.findUpgradeLevel(UpgradeType.RoyalMint).toString();

        this.#dialog.querySelector<HTMLSpanElement>("#freelance-level")!
            .textContent = this.#player.findUpgradeLevel(UpgradeType.FreelanceContract).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#side-business-level")!
            .textContent = this.#player.findUpgradeLevel(UpgradeType.SideBusiness).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#investment-portfolio-level")!
            .textContent = this.#player.findUpgradeLevel(UpgradeType.InvestmentPortfolio).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#property-empire-level")!
            .textContent = this.#player.findUpgradeLevel(UpgradeType.PropertyEmpire).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#tech-startup-level")!
            .textContent = this.#player.findUpgradeLevel(UpgradeType.TechStartup).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#atm-level")!
            .textContent = this.#player.findUpgradeLevel(UpgradeType.ATMNetwork).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#investment-firm-level")!
            .textContent = this.#player.findUpgradeLevel(UpgradeType.InvestmentFirm).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#tech-company-level")!
            .textContent = this.#player.findUpgradeLevel(UpgradeType.TechCompany).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#bank-headquarters-level")!
            .textContent = this.#player.findUpgradeLevel(UpgradeType.BankHeadquarters).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#global-corporation-level")!
            .textContent = this.#player.findUpgradeLevel(UpgradeType.GlobalCorporation).toString();

    }

    /**
     * Updates the displayed prices using the current upgrade prices from the player model
     * Side effects: changes the advisor and employer prices shown in the view
     */
    #updatePrice(): void {
        this.#dialog.querySelector<HTMLSpanElement>("#advisor-price")!
            .textContent = this.#player.findPrice(UpgradeType.FinancialAdvisor).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#employer-price")!
            .textContent = this.#player.findPrice(UpgradeType.Employer).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#banker-price")!
            .textContent = this.#player.findPrice(UpgradeType.Banker).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#mint-price")!
            .textContent = this.#player.findPrice(UpgradeType.RoyalMint).toString();

        this.#dialog.querySelector<HTMLSpanElement>("#freelance-price")!
            .textContent = this.#player.findPrice(UpgradeType.FreelanceContract).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#side-business-price")!
            .textContent = this.#player.findPrice(UpgradeType.SideBusiness).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#investment-portfolio-price")!
            .textContent = this.#player.findPrice(UpgradeType.InvestmentPortfolio).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#property-empire-price")!
            .textContent = this.#player.findPrice(UpgradeType.PropertyEmpire).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#tech-startup-price")!
            .textContent = this.#player.findPrice(UpgradeType.TechStartup).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#atm-price")!
            .textContent = this.#player.findPrice(UpgradeType.ATMNetwork).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#investment-firm-price")!
            .textContent = this.#player.findPrice(UpgradeType.InvestmentFirm).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#tech-company-price")!
            .textContent = this.#player.findPrice(UpgradeType.TechCompany).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#bank-headquarters-price")!
            .textContent = this.#player.findPrice(UpgradeType.BankHeadquarters).toString();
        this.#dialog.querySelector<HTMLSpanElement>("#global-corporation-price")!
            .textContent = this.#player.findPrice(UpgradeType.GlobalCorporation).toString();
    }

    displayPlayerMustBeLoggedIn() {
        const errorElement =
            document.querySelector<HTMLDivElement>("#upgrade-error");

        if (errorElement !== null) {
            errorElement.textContent = "Player must be logged in first.";
            errorElement.hidden = false;
        }
    }

    /**
     * Shows an error when the player cannot afford a purchase
     */
    public showInsufficientBuyPowerError(): void {
        alert("You do not have enough money for this purchase");
    }

}