export default class UnknownUpgradeTypeError extends Error {
    constructor() {
        super("An unknown upgrade type was found");
    }
}