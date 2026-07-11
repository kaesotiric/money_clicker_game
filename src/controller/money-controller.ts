import Player from "../model/player.ts";
import MoneyView from "../view/money-view.ts";

export default class MoneyController {

    #player: Player;
    #view: MoneyView;

    constructor(player: Player, view: MoneyView) {
        this.#player = player;
        this.#view = view;

        this.#view.moneyButton.addEventListener(
            "click",
            this.handleClick.bind(this)
        );
    }

    private handleClick(): void {
        this.#player.click();
    }

}