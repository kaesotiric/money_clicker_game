import Player from "./model/player.ts";
import MoneyView from "./view/money-view.ts";
import MoneyController from "./controller/money-controller.ts";
import UpgradeView from "./view/upgrade-view.ts";
import UpgradeController from "./controller/upgrade-controller.ts";

let player = new Player("Kate", 1, 0);
player.fillArray();

let moneyView = new MoneyView(player);
let upgradeView = new UpgradeView(player);
new MoneyController(player, moneyView);
new UpgradeController(player, upgradeView);