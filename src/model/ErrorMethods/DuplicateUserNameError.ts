export default class DuplicateUserNameError extends Error {
    constructor() {
        super("Username already exists");
    }
}