import type Listener from "../model/listener.ts";
import type Player from "../model/player.ts";


export default class UpgradeView implements Listener{
    #player: Player;

    public advisorButton = document.getElementById("purchase-advisor") as HTMLButtonElement;
    public employerButton = document.getElementById("purchase-employer") as HTMLButtonElement;

    private advisorLevelDisplay =
        document.getElementById("advisor-level") as HTMLElement;

    private advisorPriceDisplay =
        document.getElementById("advisor-price") as HTMLElement;

    private employerLevelDsiplay =
    document.getElementById("employer-level") as HTMLElement;

    constructor(player: Player){
        this.#player = player;
        this.#player.registerListener(this);
        this.updateLevel();

    }

    notify(): void {
        this.updateLevel();

    }

    private updateLevel(): any {
        const level = this.#player.getAdvisorLevel();
        this.advisorLevelDisplay.textContent = level.toString();
        this.updatePrice();

    }
    private updatePrice(): any {
        const price = this.#player.getPrice();
        this.advisorPriceDisplay.textContent = price.toString();
    }

}