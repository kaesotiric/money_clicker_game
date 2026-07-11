import type Listener from "../model/listener.ts";
import type Player from "../model/player.ts";


export default class UpgradeView implements Listener{
    #player: Player;

    public advisorButton = document.getElementById("purchase-advisor") as HTMLButtonElement;
    public employerButton = document.getElementById("purchase-employer") as HTMLButtonElement;

    private advisorLevelDisplay =
        document.getElementById("advisor-level") as HTMLElement;

    private employerLevelDsiplay =
    document.getElementById("employer-level") as HTMLElement;

    constructor(player: Player){
        this.#player = player;
        this.#player.registerListener(this);

    }

    notify(): void {
        this.updateLevel();
    }

    private updateLevel(): any {
        // advisorLvl: Number = this.#player.getAdvisorLevel();
        this.advisorLevelDisplay.textContent = this.#player.getAdvisorLevel().toString();
    }
}