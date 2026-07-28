import Player from "./player.ts";
import db from "./connection.ts";
import NoPLayerFoundError from "./NoPlayerFoundError.ts";
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
            // Constructor temporarily creates the default player.
            const account = new Account(
                row.username,
                row.password
            );

            // Load the actual saved player.
            const loadedPlayer =
                await Player.getPlayerByAccount(row.username);

            if (loadedPlayer === null) {
                throw new NoPLayerFoundError();

            }

            // Replace the temporary player with the saved player.
            account.player = loadedPlayer;

            allAccounts.push(account);
        }

        return allAccounts;
    }

    public static async createAccount(username: string, password: string): Promise<Account> {
        const acc = new Account(username, password);
        acc.#player = await Player.create(username);

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

}