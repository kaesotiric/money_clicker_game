import {expect, test} from 'vitest'
import Upgrade from "../model/upgrade.ts";
import {UpgradeType} from "../model/UpgradeType.ts";
// import {FinancialAdvisor} from "../model/financial-advisor.ts";
// import {Employer} from "../model/employer.ts";

test('Upgrade increase clicks based on upgrade', () => {
    // this.#upgrades.push(new Upgrade(UpgradeType.FinancialAdvisor, 0, 20, 50));
    // this.#upgrades.push(new Upgrade(UpgradeType.Employer, 0, 20, 100));
    const upgrade = new Upgrade(UpgradeType.FinancialAdvisor, 0, 20, 50);
    expect(upgrade.upgradeLevel === 0);
    upgrade.increaseLevel();
    expect(upgrade.upgradeLevel === 1)
});

test("Employer calculates number of clicks/level clicks correctly", () => {
    let employer = new Upgrade(UpgradeType.Employer, 0, 20, 100);
    expect(employer.calculateProduction(0)).toBe(20);
    expect(employer.calculateProduction(1)).toBe(40);
    expect(employer.calculateProduction(2)).toBe(60);
});

test("Advisor calculates number of clicks/level correctly", () => {
    let advisor = new Upgrade(UpgradeType.FinancialAdvisor, 0, 20, 50);
    expect(advisor.calculateProduction(0)).toBe(20);
    expect(advisor.calculateProduction(1)).toBe(40);
    expect(advisor.calculateProduction(2)).toBe(60);
});

test("Advisor calculates cost per level correctly", () => {
    let advisor =  new Upgrade(UpgradeType.FinancialAdvisor, 0, 20, 50);
    expect(advisor.calculateCost(0)).toBe(50);
    expect(advisor.calculateCost(1)).toBe(100);
    expect(advisor.calculateCost(2)).toBe(150);
});

test("Employer calculates cost per level correctly", () => {
    let employer = new Upgrade(UpgradeType.Employer, 0, 20, 100);
    expect(employer.calculateCost(0)).toBe(100);
    expect(employer.calculateCost(1)).toBe(200);
    expect(employer.calculateCost(2)).toBe(300);
});