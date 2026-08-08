import modelData from "../training/model.json";
import { UpgradeType } from "./UpgradeType";
import type Player from "./player.ts";

// Represents the structure of the trained Markov model
type Model = Record<string, Record<string, number>>;

export default class RoboBuy {
    #on: boolean;
    #previousState: string;
    #nextState: string | null;
    #model: Model;
    #mapping: Record<string, UpgradeType>;
    #reverseMapping: Record<string, string>;

    /**
     * Creates a RoboBuy that starts turned off
     * Starts at state a when there has not been a previous purchase
     */
    public constructor() {
        this.#on = false;
        this.#previousState = "a";
        this.#nextState = null;
        this.#model = modelData as Model; // Loads the probabilities created from training data

        // Maps each Markov state to an upgrade/building in game
        this.#mapping = {
            a: UpgradeType.FinancialAdvisor,
            b: UpgradeType.Employer,
            c: UpgradeType.FreelanceContract,
            d: UpgradeType.SideBusiness,
            e: UpgradeType.InvestmentPortfolio,
            f: UpgradeType.PropertyEmpire,
            g: UpgradeType.TechStartup,
            h: UpgradeType.RoyalMint,
            i: UpgradeType.Banker,
            j: UpgradeType.ATMNetwork
        };
        // Maps an upgrade or building back to the Markov state
        this.#reverseMapping = {
            [UpgradeType.FinancialAdvisor]: "a",
            [UpgradeType.Employer]: "b",
            [UpgradeType.FreelanceContract]: "c",
            [UpgradeType.SideBusiness]: "d",
            [UpgradeType.InvestmentPortfolio]: "e",
            [UpgradeType.PropertyEmpire]: "f",
            [UpgradeType.TechStartup]: "g",
            [UpgradeType.RoyalMint]: "h",
            [UpgradeType.Banker]: "i",
            [UpgradeType.ATMNetwork]: "j"
        };
    }

    /**
     * Turns RoboBuy on when it is off and off when it is on
     *
     * Side effects: Changes the RoboBuy on or off state
     */
    public toggle(): void {
        this.#on = !this.#on;
    }
    /**
     * Gets whether RoboBuy is currently turned on
     *
     * @return True when RoboBuy is on and false when it is off
     */
    public get isOn(): boolean {
        return this.#on;
    }
    /**
     * Updates the previous state after a manual purchase
     *
     * @param item The upgrade or building that was purchased
     * Side effects: Changes the previous state and clears the current target
     */
    public setState(item: UpgradeType): void {
        const state = this.#reverseMapping[item];

        // Only update the state when the purchased item has a Markov state
        if (state !== undefined) {
            this.#previousState = state;
            this.#nextState = null;// Clear the target so nxt purchase is chosen using new state
        }
    }
    /**
     * Attempts to automatically purchase the next item selected by the Markov model
     *
     * @param player The player whose upgrade or building may be purchased
     * Side effects: May decrease buy power and increase an upgrade or building level
     */
    public run(player: Player): void {
        if (this.#on) { // RoboBuy should only do something when its turned on
            if (this.#nextState === null) { // Choose a new target only when one has not already been selected
                this.#nextState = this.getNextState(this.#previousState);
            }

            const item = this.#mapping[this.#nextState]; // Convert the selected state into the matching game item

            if (item !== undefined) {
                const price = player.findPrice(item);

                // **Testing logs**
                // console.log("Previous state:", this.#previousState);
                // console.log("Next state:", this.#nextState);
                // console.log("Selected item:", item);
                // console.log("Money:", player.buyPower);
                // console.log("Price:", price);

                if (player.buyPower >= price) { // Buy the selected item once the player has enough buy power
                    // console.log("Purchasing:", item); // For testing

                    if (this.#nextState === "h" || this.#nextState === "i" || this.#nextState === "j") {// States h, i and j represent buildings
                        player.purchaseBuilding(item);
                    } else {
                        player.purchaseByName(item);
                    }

                    this.#previousState = this.#nextState; // The item that was just purchased becomes the previous state
                    this.#nextState = null; // Clear the target so the Markov model can choose the next purchase
                }
            }
        }
    }

    /**
     * Chooses the next state using the probabilities from the trained Markov model
     *
     * @param current The state representing the last purchased item
     * @return The next state selected by the Markov model
     */
    private getNextState(current: string): string {
        const transitions = this.#model[current];


        let result = current; // Use the current state as the default if no transition selected

        if (transitions !== undefined) {
            const random = Math.random(); // Random number generator
            let cumulative = 0;
            let found = false;

            // Build the probability ranges until the random value falls ti one
            for (const [next, probability] of Object.entries(transitions)) {
                if (!found) {
                    cumulative += probability;
                    // Select this state when random value falls inside its range
                    if (random <= cumulative) {
                        result = next;
                        found = true;
                    }
                }
            }
        }

        return result;
    }


}