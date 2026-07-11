import type Player from "../model/player.ts";
import type UpgradeView from "../view/upgrade-view.ts";

export default class UpgradeController{
     #player: Player;
     #upgradeView: UpgradeView;

    constructor(player: Player, upgradeView: UpgradeView){
         this.#player = player;
         this.#upgradeView = upgradeView;

         this.#upgradeView.advisorButton.addEventListener("click", this.handleAdvisorClick.bind(this));
         this.#upgradeView.employerButton.addEventListener("click", this.handleEmployerClick.bind(this));

    }

    private handleAdvisorClick(){
         this.#player.purchaseAdvisor()
         // this.#player.purchaseUpgrade();
    }

    private handleEmployerClick(){
        // this.#player.purchaseUpgrade();
    }
}