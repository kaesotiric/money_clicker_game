import {expect, test } from 'vitest'
import Player from "../model/player.ts";
// import {FinancialAdvisor} from "../model/financial-advisor.ts";
// import Player from '../src/model/player';


test('Can purchase the financial advisor', () => {
    let player = new Player();
    player.purchaseByName("Financial Advisor");
    expect(player.getAdvisorLevel("Financial Advisor") == 1);
    player.purchaseByName("Financial Advisor");
    expect(player.getAdvisorLevel("Financial Advisor") == 2);
});

test('Buy power is decreased when purchasing an upgrade', () => {
    let player = new Player();
    let bp = 1000;
    player.setBuyPower(bp); // Sets the player's money
    let price = player.getPrice("Financial Advisor");
    console.log("Before purchase, price==" + price + "and bp == " + bp);
    player.purchaseByName("Financial Advisor");
    price = player.getPrice("Financial Advisor");
    console.log("After purchase, price==" + price + " and bp == " + player.buyPower);

    expect(player.buyPower === (bp - price)); //Expects buypower to now decrease by the price

});