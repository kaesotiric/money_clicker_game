export default class UpgradeNotFoundError extends Error {
    constructor() {
        super( "Upgrade was not found in the player's inventory");
    }
}