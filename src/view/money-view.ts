import Player from "../model/player.ts";
import type Listener from "../model/listener.ts";

export default class MoneyView implements Listener {
    private player: Player;

    public moneyButton =
        document.getElementById("money-button") as HTMLButtonElement;

    private buyPowerDisplay =
        document.getElementById("buyPower") as HTMLElement;

    constructor(player: Player) {
        this.player = player;

        this.player.registerListener(this);
        this.updateBuyPower();
    }
    notify(): void {
        console.log("view notified");
        this.updateBuyPower();
    }

    private updateBuyPower(): void {
        this.buyPowerDisplay.textContent =
            this.player.buyPower.toString();
    }
}