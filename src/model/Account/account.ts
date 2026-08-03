import Player from "../player.ts";
import PlayerPersistence from "../player-persistence.ts";
import db from "../connection.ts";
import DuplicateUserNameError from "../ErrorMethods/DuplicateUserNameError.ts";
import Security from "./security.ts";
import NoPlayerFoundError from "../ErrorMethods/NoPlayerFoundError.ts";

/**
 * Represents a user's account and manages account creation and login
 */

export default class Account {
    #username: string;
    #password: string;
    #player: Player;

    constructor(username: string, password: string) {
        this.#username = username;
        this.#password = password;

        this.#player = new Player(username);
        this.#player.account = this;
    }

    /**
     * Creates and saves a new account
     *
     * @param username The unique username for the account
     * @param password The plain password that will be hashed
     * @return The newly created account
     * @throws DuplicateUserNameError When the username already exists
     * Side effects: Adds account, player, upgrade and building rows to the database
     */
    public static async createAccount(
        username: string,
        password: string
    ): Promise<Account> {
        const security = new Security();

        const hashedPass =
            await security.hashPassword(password);

        const results = await db().query<{
            username: string;
        }>(
            `
                INSERT INTO account (username, password)
                VALUES ($1, $2)
                ON CONFLICT (username) DO NOTHING
                RETURNING username;
            `,
            [username, hashedPass]
        );

        if (results.rows.length === 0) { // No row is returned when the username already exists
            throw new DuplicateUserNameError();
        }

        // Creates the Player object in memory
        const account = new Account(username, hashedPass);

        // Insert the player and return its generated ID by the db
        const playerResult = await db().query<{
            id: number;
        }>(
            `
                INSERT INTO player (
                    playername,
                    account
                )
                VALUES ($1, $2)
                RETURNING id;
            `,
            [username, username]
        );

        const playerId = playerResult.rows[0].id;

        // Give the player every upgrade from the catalog
        await db().query(
            `
                INSERT INTO upgrade_inventory (
                    player_id,
                    upgrade_name,
                    upgrade_level,
                    upgrade_production,
                    buypower_cost
                )
                SELECT
                    $1,
                    name,
                    0,
                    base_production,
                    base_buypower_cost
                FROM upgrade_catalog;
            `,
            [playerId]
        );

        // Create the extra database rows for buildings
        await PlayerPersistence.initializeBuildings(playerId);

        account.player.id = playerId;

        // The persistence object has access to this player
        const persistence = new PlayerPersistence(account.player);

        // Load the player's upgrades using the values stored in the db
        await persistence.loadUpgrade();
        await persistence.loadBuildings();

        return account;
    }

    /**
     * Attempts to log in using a username and password
     *
     * @param username The username being used to log in
     * @param password The plain password being checked
     * @return The account when login succeeds or null when it fails
     * @throws NoPLayerFoundError When the account exists without a saved player
     */
    static async login(
        username: string,
        password: string
    ): Promise<Account | null> {
        let loggedInAccount: Account | null = null;

        const results = await db().query<{
            username: string;
            password: string;
        }>(
            `
                SELECT username, password
                FROM account
                WHERE username = $1;
            `,
            [username]
        );

        const row = results.rows[0];

        // Only check the password when the username exists
        if (row !== undefined) {
            const security = new Security();

            const passwordMatches = await security.verifyPassword(password, row.password);

            // Only load the player when the password is correct
            if (passwordMatches) {
                const account = new Account(row.username, row.password);

                const loadedPlayer =
                    await PlayerPersistence.getPlayerByAccount(row.username);

                if (loadedPlayer === null) {
                    throw new NoPlayerFoundError();
                }

                // The setter connects the loaded player back to the account
                account.player = loadedPlayer;
                loggedInAccount = account;
            }
        }

        return loggedInAccount;
    }


    // Getters and setters \\

    get player(): Player {
        return this.#player;
    }

    set player(player: Player) {
        this.#player = player;
        this.#player.account = this; // To keep player and account connected
    }

    get username(): string {
        return this.#username;
    }

}