import Money from "./controller/trainer-controller.ts";

let trainerController = new TrainerController();

document.querySelector("#add-pokemon")!.addEventListener("click", () => trainerController.addToTeam());

console.log(trainerController);
