import Player from "./model/player.ts";
import MoneyView from "./view/money-view.ts";
import MoneyController from "./controller/money-controller.ts";

let player = new Player("Kate", 1, 1);
let view = new MoneyView(player);

new MoneyController(player, view);