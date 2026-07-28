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

    // public static async createAccount(username: string, password: string): Promise<Account> {
    //     const results = await db().query<{ username: string }>(
    //         `
    //     INSERT INTO account(username, password)
    //     VALUES ($1, $2)
    //     ON CONFLICT (username) DO NOTHING
    //     RETURNING username;
    //     `,
    //         [username, password]
    //     );
    //
    //     if (results.rows.length === 0) { // No row was inserted because the username already exists
    //         throw new DuplicateUserNameError();
    //     }
    //
    //     const acc = new Account(username, password);
    //     await Player.savePlayer(acc.player);
    //
    //     // // Save the player created by the acc constructor
    //     // await db().query(
    //     //     `
    //     //         INSERT INTO player(
    //     //             playername,
    //     //             buypower,
    //     //             curr_click,
    //     //             account
    //     //         )
    //     //         VALUES ($1, $2, $3, $4);
    //     //     `,
    //     //     [username, 0, 1, username]
    //     // );
    //
    //
    //     return acc;
    // }
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

        // This constructor already creates the Player object
        const acc = new Account(username, password);
        Player
        // Saves that existing Player object into SQL
        // await Player.savePlayer(acc.player);

        return acc;
    }

    static async login( username: string, password: string): Promise<Account | null> {
        const results = await db().query<{
            username: string;
            password: string;
        }>(`select username, password from account where username = $1;`,
            [username]
        );

        const row = results.rows[0];

        if (!row) {
            return null;
        }

        if (password !== row.password) {
            return null;
        }

        const account = new Account(
            row.username,
            row.password
        );

        const loadedPlayer =
            await Player.getPlayerByAccount(row.username);

        if (loadedPlayer === null) {
            throw new NoPLayerFoundError();

        }

        account.player = loadedPlayer;

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