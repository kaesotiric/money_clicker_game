export default class PlayerIdNotFoundError extends Error {
    constructor() {
        super("Player ID not found error");
    }
}