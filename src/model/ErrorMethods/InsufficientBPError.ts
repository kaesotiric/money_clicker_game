/**
 * Thrown when the player cannot afford an upgrade
 */
export default class InsufficientBuyPowerError extends Error {

    /**
     * Creates an error for an unaffordable purchase
     */
    constructor() {
        super("You do not have enough buy power");

        this.name = "InsufficientBuyPowerError";
    }
}