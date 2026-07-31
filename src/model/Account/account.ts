import Player from "../player.ts";
import db from "../connection.ts";
import NoPLayerFoundError from "../ErrorMethods/NoPlayerFoundError.ts";
import DuplicateUserNameError from "../ErrorMethods/DuplicateUserNameError.ts";
// import type Player from "./player.ts";
import Security from "./security.ts";

export default class Account {
    #username: string;
    #password: string;
    #player: Player

    constructor(username: string, password: string) {
        this.#username = username;
        this.#password = password;

        this.#player = new Player(username);
        this.#player.account = this;
    }

    static async getAllAccounts(): Promise<Account[]> {
        const results = await db().query<{
            username: string;
            password: string;
        }>(`select username, password from account;`);

        const allAccounts: Account[] = [];

        for (const row of results.rows) {
            // Constructor temporarily creates the default player
            const account = new Account(
                row.username,
                row.password
            );

            // Load the actual saved player
            const loadedPlayer =
                await Player.getPlayerByAccount(row.username);

            if (loadedPlayer === null) {
                throw new NoPLayerFoundError();

            }

            // Replace the temporary player with the saved player
            account.player = loadedPlayer;

            allAccounts.push(account);
        }

        return allAccounts;
    }


    public static async createAccount(
        username: string,
        password: string
    ): Promise<Account> {
        const security = new Security();
        const hashedPass = await security.hashPassword(password);
        const results = await db().query<{ username: string }>(
            `
        INSERT INTO account (
            username,
            password
        )
        VALUES ($1, $2)
        ON CONFLICT (username) DO NOTHING
        RETURNING username;
        `,
            [username, hashedPass]
        );

        if (results.rows.length === 0) {
            throw new DuplicateUserNameError();
        }

        // The constructor creates the Player object in memory
        const account = new Account(username, hashedPass);

        // Insert the player and return its generated ID
        const playerResult = await db().query<{ id: number }>(
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

        await this.initializeBuildings(playerId); // Give the player's building upgrades their building information

        account.player.id = playerId;
        await account.player.loadUpgrade();
        await account.player.loadBuildings();


        return account;
    }
    static async initializeBuildings(playerId: number){
        // Give the player's building upgrades their building information
        await db().query(
            `
    INSERT INTO buildings (
        upgrade_id,
        interval_speed
    )
    SELECT
        upgrade_inventory.id,
        (
            SELECT base_interval_speed
            FROM upgrade_catalog
            WHERE name = upgrade_inventory.upgrade_name
        )
    FROM upgrade_inventory
    WHERE player_id = $1
      AND upgrade_name IN (
          SELECT name
          FROM upgrade_catalog
          WHERE LOWER(upgrade_kind) = 'building'
            AND base_interval_speed IS NOT NULL
      )
    ON CONFLICT (upgrade_id) DO NOTHING;
    `,
            [playerId]
        );
    }
    static async login(
        username: string,
        password: string
    ): Promise<Account | null> {
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

        // Username does not exist
        if (!row) {
            return null;
        }

        const security = new Security();
        const passwordMatches = await security.verifyPassword(password, row.password);

        // Password is incorrect
        if (!passwordMatches) {
            return null;
        }

        const account = new Account(row.username, row.password);

        const loadedPlayer =
            await Player.getPlayerByAccount(row.username);

        if (loadedPlayer === null) {
            throw new NoPLayerFoundError();
        }

        loadedPlayer.account = account;
        account.player = loadedPlayer;

        await loadedPlayer.loadUpgrade();
        await loadedPlayer.loadBuildings();

        loadedPlayer.startBuildingAutoClickers();
        return account;
    }

    get player(): Player {
        return this.#player;
    }

    set player(player:Player){
        this.#player = player;
    }
    set username(user:string){
        this.#username = user;
    }
    set password(pass:string){
        this.#password = pass;
    }
    get username(): string {
        return this.#username;
    }

}