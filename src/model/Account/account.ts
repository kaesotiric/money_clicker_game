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

    // public static async createAccount(
    //
    //     username: string,
    //     password: string
    // ): Promise<Account> {
    //     const results = await db().query<{ username: string }>(
    //         `
    //             INSERT INTO account(username, password)
    //             VALUES ($1, $2)
    //                 ON CONFLICT (username) DO NOTHING
    //     RETURNING username;
    //         `,
    //         [username, password]
    //     );
    //
    //     if (results.rows.length === 0) {
    //         throw new DuplicateUserNameError();
    //     }
    //     console.log("test");
    //     return new Account(username, password);
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

        return new Account(username, password);
    }
    // static async login( username: string, password: string): Promise<Account | null> {
    //     const results = await db().query<{
    //         username: string;
    //         password: string;
    //     }>(`select username, password from account where username = $1;`,
    //         [username]
    //     );
    //
    //     const row = results.rows[0];
    //
    //     if (!row) {
    //         return null;
    //     }
    //
    //     if (password !== row.password) {
    //         return null;
    //     }
    //
    //     const account = new Account(
    //         row.username,
    //         row.password
    //     );
    //
    //     const loadedPlayer =
    //         await Player.getPlayerByAccount(row.username);
    //
    //     if (loadedPlayer === null) {
    //         throw new NoPLayerFoundError();
    //
    //     }
    //
    //     account.player = loadedPlayer;
    //
    //     return account;
    // }
    static async login(
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

        account.player = loadedPlayer;

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