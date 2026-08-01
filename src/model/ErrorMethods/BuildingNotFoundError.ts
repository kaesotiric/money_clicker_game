export default class BuildingNotFoundError extends Error {
    constructor() {
        super( "Building not found in the buildings table/database");
    }
}