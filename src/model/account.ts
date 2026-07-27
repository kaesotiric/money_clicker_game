import type Listener from "./listener.ts";
import Player from "./player.ts";
import db from "./connection.ts";
// import type Player from "./player.ts";

export default class Account {
    #username: string;
    #password: string;
    #player: Player
    #listeners: Array<Listener>;

    constructor(username: string, password:string){
        this.#username = username;
        this.#password = password;
        this.#listeners = new Array<Listener>();
        this.#player = new Player("");
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
    registerListener(listener: Listener): void {
        this.#listeners.push(listener);
    }
}