import {expect, test} from 'vitest'
import {FinancialAdvisor} from "../model/financial-advisor.ts";
import {Employer} from "../model/employer.ts";

test('Upgrade increase clicks based on upgrade', () => {
    const upgrade = new FinancialAdvisor();
    expect(upgrade.getLevel() === 0);
    upgrade.increaseLevel();
    expect(upgrade.getLevel() === 1)
});

test("Employer calculates number of clicks/level clicks correctly", () => {
    let employer = new Employer();
    expect(employer.calculateProduction(0)).toBe(20);
    expect(employer.calculateProduction(1)).toBe(40);
    expect(employer.calculateProduction(2)).toBe(60);
});

test("Advisor calculates number of clicks/level correctly", () => {
    let advisor = new FinancialAdvisor();
    expect(advisor.calculateProduction(0)).toBe(15);
    expect(advisor.calculateProduction(1)).toBe(45);
    expect(advisor.calculateProduction(2)).toBe(75);
});

test("Advisor calculates cost per level correctly", () => {
    let advisor = new FinancialAdvisor();
    expect(advisor.calculateCost(0)).toBe(20);
    expect(advisor.calculateCost(1)).toBe(40);
    expect(advisor.calculateCost(2)).toBe(60);
});

test("Employer calculates cost per level correctly", () => {
    let employer = new Employer();
    expect(employer.calculateCost(0)).toBe(100);
    expect(employer.calculateCost(1)).toBe(200);
    expect(employer.calculateCost(2)).toBe(300);
});