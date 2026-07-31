export default class NoAccountFoundError extends Error {
    constructor() {
        super("No account found error");
    }
}