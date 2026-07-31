import { expect, test } from "vitest";
import Player from "../model/player.ts";
import { UpgradeType } from "../model/UpgradeType.ts";

test("Can purchase the advisor upgrade", () => {
    const player = new Player("test-player");

    player.updatedBuyPower =
        player.findPrice(UpgradeType.FinancialAdvisor);

    player.purchaseByName(UpgradeType.FinancialAdvisor);

    expect(
        player.findUpgradeLevel(UpgradeType.FinancialAdvisor)
    ).toBe(1);

    // Second purchase
    player.updatedBuyPower =
        player.findPrice(UpgradeType.FinancialAdvisor);

    player.purchaseByName(UpgradeType.FinancialAdvisor);

    expect(
        player.findUpgradeLevel(UpgradeType.FinancialAdvisor)
    ).toBe(2);
});

test("Can purchase the employer upgrade", () => {
    const player = new Player("test-player");

    player.updatedBuyPower =
        player.findPrice(UpgradeType.Employer);

    player.purchaseByName(UpgradeType.Employer);

    expect(
        player.findUpgradeLevel(UpgradeType.Employer)
    ).toBe(1);

    // Second purchase
    player.updatedBuyPower =
        player.findPrice(UpgradeType.Employer);

    player.purchaseByName(UpgradeType.Employer);

    expect(
        player.findUpgradeLevel(UpgradeType.Employer)
    ).toBe(2);
});

test("Buy power is decreased when purchasing an upgrade", () => {
    const player = new Player("test-player");

    expect(player.buyPower).toBe(0);

    const price = player.findPrice(UpgradeType.Employer);

    player.updatedBuyPower = price + 1;
    player.purchaseByName(UpgradeType.Employer);

    expect(player.buyPower).toBe(1);
});