export default class NoPLayerFoundError extends Error {
    constructor() {
        super("Player not found");
    }
}