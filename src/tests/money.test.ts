import {expect, test} from 'vitest'
import Player from "../model/player.ts";
import {UpgradeType} from "../model/UpgradeType.ts";


test('Can purchase the advisor upgrade', () => {
    let player = new Player("");
    player.updatedBuyPower = player.findPrice(UpgradeType.FinancialAdvisor); //Sets buy power to the upgrade's price

    player.purchaseByName(UpgradeType.FinancialAdvisor);
    expect(player.findUpgradeLevel(UpgradeType.FinancialAdvisor)).toBe(1);

    //Second purchase
    player.updatedBuyPower = player.findPrice(UpgradeType.FinancialAdvisor); //Sets buy power to the upgrade's price
    player.purchaseByName(UpgradeType.FinancialAdvisor);
    expect(player.findUpgradeLevel(UpgradeType.FinancialAdvisor)).toBe(2); // To check if it can also handle multiple upgrades
});
test('Can purchase the employer upgrade', () => {
    let player = new Player("");
    player.updatedBuyPower = player.findPrice(UpgradeType.Employer); //Sets buy power to the upgrade's price

    player.purchaseByName(UpgradeType.Employer);
    expect(player.findUpgradeLevel(UpgradeType.Employer)).toBe(1); //Upgrade starts at 0, and after purchase should be 1

    //Second purchase
    player.updatedBuyPower = player.findPrice(UpgradeType.Employer); //Sets new power to the upgrade's price
    player.purchaseByName(UpgradeType.Employer);
    expect(player.findUpgradeLevel(UpgradeType.Employer)).toBe(2); // To check if it can also handle multiple upgrades
});

test('Buy power is decreased when purchasing an upgrade', () => {
    let player = new Player("");
    expect(player.buyPower).toBe(0) //Expects buyPower to start at 0
    let price = player.findPrice(UpgradeType.Employer);
    player.updatedBuyPower = price + 1; // Sets the player's money to equal the price of upgrade + 1
    player.purchaseByName(UpgradeType.Employer); // Purchases upgrade
    expect(player.buyPower).toBe(1); // Should be 1 after the price of upgrade is reduced

});