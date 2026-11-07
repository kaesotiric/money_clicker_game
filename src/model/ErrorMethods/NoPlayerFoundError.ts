export default class NoPlayerFoundError extends Error {
    constructor() {
        super("Player not found in database");
    }
}