import Player from "../player.ts";
import db from "../connection.ts";
import NoPLayerFoundError from "./NoPlayerFoundError.ts";
import DuplicateUserNameError from "./DuplicateUserNameError.ts";
// import type Player from "./player.ts";

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
        const results = await db().query<{ username: string }>(
            `
        INSERT INTO account(username, password)
        VALUES ($1, $2)
        ON CONFLICT (username) DO NOTHING
        RETURNING username;
        `,
            [username, password]
        );

        if (results.rows.length === 0) {
            throw new DuplicateUserNameError();
        }

        // The constructor creates the Player object in memory
        const account = new Account(username, password);

        // Insert the Player and return its generated ID
        const playerResult = await db().query<{ id: number }>(
            `
        INSERT INTO player(playername, account)
        VALUES ($1, $2)
        RETURNING id;
        `,
            [username, username]
        );


        const playerId = playerResult.rows[0].id;


        // Give the new player all upgrades at level 0
        await db().query(
            `
        INSERT INTO upgrade_inventory(
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
        account.player.id = playerId;
        return account;
    }

    static async login( // Remove logs later after done debugging
        username: string,
        password: string
    ): Promise<Account | null> {
        console.log("LOGIN 1: Method started");
        console.log("Entered username:", JSON.stringify(username));
        console.log("Entered password:", JSON.stringify(password));

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

        console.log("LOGIN 2: Query completed");
        console.log("Rows returned:", results.rows);

        const row = results.rows[0];

        if (!row) {
            console.log("LOGIN FAILED: Username was not found");
            return null;
        }

        console.log("Stored username:", JSON.stringify(row.username));
        console.log("Stored password:", JSON.stringify(row.password));
        console.log(
            "Password matches:",
            password === row.password
        );

        if (password !== row.password) {
            console.log("LOGIN FAILED: Password does not match");
            return null;
        }

        console.log("LOGIN 3: Username and password are correct");

        const account = new Account(
            row.username,
            row.password
        );

        console.log("LOGIN 4: Account object created");

        const loadedPlayer =
            await Player.getPlayerByAccount(row.username);

        console.log("LOGIN 5: Player result:", loadedPlayer);

        if (loadedPlayer === null) {
            console.log(
                "LOGIN FAILED: Account exists, but no player row was found"
            );

            throw new NoPLayerFoundError();
        }
        loadedPlayer.account = account;
        account.player = loadedPlayer;
        await account.player.loadUpgrade();


        console.log("LOGIN 6: Loaded player added to account");
        console.log("LOGIN SUCCESS:", account);

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