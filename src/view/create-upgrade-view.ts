/**
 * Permanent upgrade store
 * Displays live upgrade levels, prices and bonuses beside the game
 */

import type MoneyController from "../controller/money-controller.ts";
import type Player from "../model/player.ts";
import type Listener from "../model/listener.ts";
import { UpgradeType } from "../model/UpgradeType.ts";

type ShopItem = {
    id: string;
    name: string;
    type: UpgradeType;
    category: "upgrade" | "building";
};

export default class CreateUpgradeView implements Listener {
    #player: Player;
    #controller: MoneyController;
    #store: HTMLElement;
    #roboNotices: Array<{type: UpgradeType; count: number}> = [];
    #roboNoticeTimer?: number;
    #previousLevels = new Map<UpgradeType, number>();


    // These IDs match your old CSS, prices, and button handlers
    #items: ShopItem[] = [
        { id: "advisor", name: "Financial Advisor", type: UpgradeType.FinancialAdvisor, category: "upgrade" },
        { id: "employer", name: "Employer", type: UpgradeType.Employer, category: "upgrade" },
        { id: "freelance", name: "Freelance Contract", type: UpgradeType.FreelanceContract, category: "upgrade" },
        { id: "side-business", name: "Side Business", type: UpgradeType.SideBusiness, category: "upgrade" },
        { id: "investment-portfolio", name: "Investment Portfolio", type: UpgradeType.InvestmentPortfolio, category: "upgrade" },
        { id: "property-empire", name: "Property Empire", type: UpgradeType.PropertyEmpire, category: "upgrade" },
        { id: "tech-startup", name: "Tech Startup", type: UpgradeType.TechStartup, category: "upgrade" },
        { id: "mint", name: "Royal Mint", type: UpgradeType.RoyalMint, category: "building" },
        { id: "banker", name: "Banker", type: UpgradeType.Banker, category: "building" },
        { id: "atm", name: "ATM Network", type: UpgradeType.ATMNetwork, category: "building" },
        { id: "investment-firm", name: "Investment Firm", type: UpgradeType.InvestmentFirm, category: "building" },
        { id: "tech-company", name: "Tech Company", type: UpgradeType.TechCompany, category: "building" },
        { id: "bank-headquarters", name: "Bank Headquarters", type: UpgradeType.BankHeadquarters, category: "building" },
        { id: "global-corporation", name: "Global Corporation", type: UpgradeType.GlobalCorporation, category: "building" }
    ];

    constructor(player: Player, controller: MoneyController) {
        this.#player = player;
        this.#controller = controller;

        // Put the game and store in the SAME grid container
        const app = document.querySelector<HTMLElement>("#app");
        if (app === null) {
            throw new Error("Money Clicker #app container was not found");
        }

        let layout = document.querySelector<HTMLDivElement>("#money-layout");
        if (layout === null) {
            layout = document.createElement("div");
            layout.id = "money-layout";
            app.parentElement?.insertBefore(layout, app);
            layout.appendChild(app);
        }

        // An aside behaves like a normal page panel, unlike a dialog
        this.#store = document.createElement("aside");
        this.#store.id = "upgrade-store";
        this.#store.className = "money-sidebar";
        this.#store.hidden = true;

        this.#store.innerHTML = `
            <h2>Upgrade Store</h2>
            <p>Grow your earnings, one upgrade at a time.</p>
            <div id="upgrade-error" class="game-warning" role="alert" hidden></div>

            <div id="mc-robo-notice" class="mc-robo-notice" role="status" aria-live="polite" hidden>
                <span class="mc-robo-notice-icon" aria-hidden="true">↻</span>
                <div class="mc-robo-notice-copy">
                    <strong>ROBOBUY PURCHASED</strong>
                    <span id="mc-robo-notice-detail"></span>
                </div>
            </div>

            <div class="mc-shop-tabs-row">
                <div class="mc-shop-tabs" role="tablist" aria-label="Shop category">
                    <button type="button" class="mc-shop-tab" id="mc-shop-tab-upgrades"
                            role="tab" aria-controls="mc-shop-panel-upgrades" aria-selected="true" tabindex="0">
                        Upgrades <span class="mc-shop-tab-count">7</span>
                    </button>
                    <button type="button" class="mc-shop-tab" id="mc-shop-tab-buildings"
                            role="tab" aria-controls="mc-shop-panel-buildings" aria-selected="false" tabindex="-1">
                        Buildings <span class="mc-shop-tab-count">7</span>
                    </button>
                </div>

                <div class="mc-shop-info">
                    <button type="button" id="mc-shop-info-trigger" class="mc-shop-info-trigger"
                            aria-label="About Upgrades" aria-describedby="mc-shop-tooltip">i</button>
                    <div id="mc-shop-tooltip" class="mc-shop-tooltip" role="tooltip">
                        Upgrades increase how much money you earn each time you click the bill.
                    </div>
                </div>
            </div>

            <section id="mc-shop-panel-upgrades" class="mc-shop-panel" role="tabpanel"
                     aria-labelledby="mc-shop-tab-upgrades">
                ${this.#renderItems("upgrade")}
            </section>
            <section id="mc-shop-panel-buildings" class="mc-shop-panel" role="tabpanel"
                     aria-labelledby="mc-shop-tab-buildings" hidden>
                ${this.#renderItems("building")}
            </section>
        `;

        // Avoid duplicate stores if the view is ever recreated
        layout.querySelector("#upgrade-store")?.remove();
        layout.appendChild(this.#store);

        // The two tabs filter the shop without rebuilding the purchase buttons
        for (const category of ["upgrades", "buildings"] as const) {
            const tab = this.#store.querySelector<HTMLButtonElement>(`#mc-shop-tab-${category}`);
            tab?.addEventListener("click", () => this.#selectCategory(category));

            // Arrow keys also switch categories when using the keyboard
            tab?.addEventListener("keydown", (event) => {
                if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                    event.preventDefault();
                    const next = category === "upgrades" ? "buildings" : "upgrades";
                    this.#selectCategory(next);
                    this.#store.querySelector<HTMLButtonElement>(`#mc-shop-tab-${next}`)?.focus();
                }
            });
        }

        // Connect every Buy button to the existing controller methods
        for (const item of this.#items) {
            const button = this.#store.querySelector<HTMLButtonElement>(`#purchase-${item.id}`);

            button?.addEventListener("click", () => {
                this.#hideError();

                if (item.category === "upgrade") {
                    void this.#controller.purchaseUpgrade(item.type);
                } else {
                    void this.#controller.purchaseBuilding(item.type);
                }
            });
        }

        this.#player.registerListener(this);
        this.notify();
    }

    // Creates a shop card with an icon, name, level, price and purchase button
    #renderItems(category: "upgrade" | "building"): string {
        return this.#items
            .filter(item => item.category === category)
            .map(item => `
                <div class="mc-shop-item" data-upgrade="${item.id}">
                    <h4 class="mc-shop-item-name">${item.name}</h4>
                    <span>Level <span id="${item.id}-level">0</span></span>
                    <span>Price: $<span id="${item.id}-price">0</span></span>
                    <div class="mc-shop-impact">
                        <span class="mc-shop-impact-value" id="${item.id}-impact" aria-live="off">Calculating…</span>
                    </div>
                    <button type="button" id="purchase-${item.id}"
                            aria-label="Buy ${item.name}">Buy</button>
                </div>
            `)
            .join("");
    }

    // Displays one category while keeping the other category's prices and levels in memory
    #selectCategory(category: "upgrades" | "buildings"): void {
        for (const name of ["upgrades", "buildings"] as const) {
            const active = name === category;
            const tab = this.#store.querySelector<HTMLButtonElement>(`#mc-shop-tab-${name}`);
            const panel = this.#store.querySelector<HTMLElement>(`#mc-shop-panel-${name}`);

            if (tab !== null) {
                tab.setAttribute("aria-selected", String(active));
                tab.tabIndex = active ? 0 : -1;
            }

            if (panel !== null) panel.hidden = !active;
        }

        // Explain the selected category only when the user hovers or focuses the info icon
        const tooltip = this.#store.querySelector<HTMLElement>("#mc-shop-tooltip");
        const infoButton = this.#store.querySelector<HTMLButtonElement>("#mc-shop-info-trigger");

        if (tooltip !== null) {
            tooltip.textContent = category === "upgrades"
                ? "Upgrades increase how much money you earn each time you click the bill."
                : "Buildings are auto-clickers that earn money for you automatically over time.";
        }

        infoButton?.setAttribute("aria-label", `About ${category === "upgrades" ? "Upgrades" : "Buildings"}`);
        this.#hideError();
    }

    /** Shows the shop beside the money bill without blocking clicks */
    show(): void {
        this.notify();

        this.#store.hidden = false;
        document.querySelector("#purchase-upgrades")?.setAttribute("hidden", "");
    }

    /** Refreshes prices, levels and the next click bonus when Player changes */
    notify(): void {
        for (const item of this.#items) {
            const level = this.#player.findUpgradeLevel(item.type);
            const levelLabel = this.#store.querySelector<HTMLElement>(`#${item.id}-level`);
            const priceLabel = this.#store.querySelector<HTMLElement>(`#${item.id}-price`);
            const impact = this.#store.querySelector<HTMLElement>(`#${item.id}-impact`);

            if (levelLabel !== null) levelLabel.textContent = level.toString();
            if (priceLabel !== null) {
                priceLabel.textContent = this.#player.findPrice(item.type).toLocaleString("en-CA");
            }

            // The NEXT purchase bonus uses the exact calculation in Player.ts
            if (impact !== null) {
                const updatedText = this.#getPurchaseImpact(item);
                if (impact.textContent !== updatedText) impact.textContent = updatedText;
                if (item.category === "upgrade") {
                    impact.title = "Bonus you will get when you buy the next level";
                }

                // A brief highlight shows when a manual or RoboBuy purchase levels up
                const previousLevel = this.#previousLevels.get(item.type);
                if (previousLevel !== undefined && level > previousLevel) {
                    impact.classList.remove("mc-shop-impact-updated");
                    void impact.offsetWidth;
                    impact.classList.add("mc-shop-impact-updated");
                    window.setTimeout(() => impact.classList.remove("mc-shop-impact-updated"), 700);
                }
            }
            this.#previousLevels.set(item.type, level);
        }

        // Keep both printed banknote corner values synchronized with click power
        const bill = document.querySelector<HTMLButtonElement>("#click-button");
        if (bill !== null) {
            const clickPower = this.#player.currClick;
            bill.dataset.perClick = new Intl.NumberFormat("en-CA", {
                notation: "compact", maximumFractionDigits: 1
            }).format(clickPower);
            bill.setAttribute("aria-label", `Click to earn ${clickPower.toLocaleString("en-CA")} money`);
        }
    }

    /** Shows what the NEXT purchase contributes, using Player model values */
    #getPurchaseImpact(item: ShopItem): string {
        const money = (amount: number): string =>
            `$${amount.toLocaleString("en-CA", { maximumFractionDigits: 2 })}`;

        if (item.category === "upgrade") {
            const upgrade = this.#player.upgrades.find(u => u.upgradeName === item.type);
            if (upgrade === undefined) return "Click boost unavailable";
            // Ask Player for the actual bonus from the next purchase
            return `+${money(this.#player.getNextClickBonus(item.type))} per click`;
        }

        const building = this.#player.buildings.find(b => b.upgradeName === item.type);
        if (building === undefined) return "Auto income unavailable";

        // intervalSpeed goes directly into setInterval, so it is in milliseconds
        const model = building as unknown as {
            productionValue: number;
            intervalSpeed?: number;
            calculateProduction?: (level: number) => number;
        };
        const nextLevel = this.#player.findUpgradeLevel(item.type) + 1;
        const hasCalculation = typeof model.calculateProduction === "function";
        const earnings = hasCalculation
            ? model.calculateProduction!(nextLevel)
            : model.productionValue;
        const interval = Number(model.intervalSpeed);
        const cadence = Number.isFinite(interval) && interval > 0
            ? ` every ${Number((interval / 1000).toFixed(2))}s`
            : " per auto payout";

        // Mark base production explicitly when the model does not expose a calculator
        return hasCalculation
            ? `Next level: ${money(earnings)}${cadence}`
            : `Base: ${money(earnings)}${cadence}`;
    }

    /** Queues the name of each item RoboBuy actually purchased */
    showRoboBuyPurchase(type: UpgradeType, count: number): void {
        if (count <= 0) return;
        this.#roboNotices.push({ type, count });
        // Bound the queue in case RoboBuy is purchasing very quickly
        if (this.#roboNotices.length > 8) this.#roboNotices.shift();
        if (this.#roboNoticeTimer === undefined) this.#showNextRoboNotice();
    }

    #showNextRoboNotice(): void {
        const next = this.#roboNotices.shift();
        const notice = this.#store.querySelector<HTMLElement>("#mc-robo-notice");
        const detail = this.#store.querySelector<HTMLElement>("#mc-robo-notice-detail");

        if (next === undefined) {
            if (notice !== null) notice.hidden = true;
            this.#roboNoticeTimer = undefined;
            return;
        }

        const item = this.#items.find(i => i.type === next.type);
        const name = item?.name ?? "Upgrade";
        const level = this.#player.findUpgradeLevel(next.type);
        if (detail !== null) {
            detail.textContent = `${name}${next.count > 1 ? ` ×${next.count}` : ""} · Level ${level}`;
        }
        if (notice !== null) notice.hidden = false;

        // Give the newly purchased card a subtle highlight when visible
        if (item !== undefined) {
            const card = this.#store.querySelector<HTMLElement>(`[data-upgrade="${item.id}"]`);
            card?.classList.remove("mc-robo-bought");
            if (card !== null && card !== undefined) {
                void card.offsetWidth; // Restart the highlight on repeated purchases
                card.classList.add("mc-robo-bought");
                window.setTimeout(() => card.classList.remove("mc-robo-bought"), 1700);
            }
        }

        this.#roboNoticeTimer = window.setTimeout(() => {
            this.#roboNoticeTimer = undefined;
            this.#showNextRoboNotice();
        }, 2200);
    }

    #hideError(): void {
        const error = this.#store.querySelector<HTMLDivElement>("#upgrade-error");

        if (error !== null) {
            error.hidden = true;
            error.textContent = "";
        }
    }

    #showError(message: string): void {
        const error = this.#store.querySelector<HTMLDivElement>("#upgrade-error");

        if (error !== null) {
            error.textContent = message;
            error.hidden = false;
        }
    }

    displayPlayerMustBeLoggedIn(): void {
        this.#showError("Please log in before buying upgrades.");
    }

    showInsufficientBuyPowerError(): void {
        this.#showError("Not enough money yet. Keep clicking to afford this item.");
    }
}
