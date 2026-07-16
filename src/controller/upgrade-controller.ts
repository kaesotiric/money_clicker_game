import type Player from "../model/player.ts";
import type UpgradeView from "../view/upgrade-view.ts";
// import type {UpgradeType} from "../model/UpgradeType.ts";
// import { UpgradeType } from "../mode/UpgradeType.ts";
import { UpgradeType } from "../model/UpgradeType.ts";

export default class UpgradeController{
     #player: Player;
     #upgradeView: UpgradeView;
     // #upgradeType: UpgradeType;

    constructor(player: Player, upgradeView: UpgradeView){
         this.#player = player;
         this.#upgradeView = upgradeView;

         this.#upgradeView.advisorButton.addEventListener("click", this.handleAdvisorClick.bind(this));
         this.#upgradeView.employerButton.addEventListener("click", this.handleEmployerClick.bind(this));


    }

    private handleAdvisorClick(){
         this.#player.purchaseByName(UpgradeType.financialAdvisor);
         // this.#player.purchaseUpgrade();
    }

    private handleEmployerClick(){
        this.#player.purchaseByName(UpgradeType.employer);
    }
}