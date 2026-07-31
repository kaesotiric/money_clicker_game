import {
    afterEach,
    beforeEach,
    expect,
    test,
    vi
} from "vitest";

import Player from "../model/player.ts";
import { UpgradeType } from "../model/UpgradeType.ts";
import Building from "../model/building.ts";

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
});

test("Can purchase the building upgrade", () => {
    const player = new Player("test-player");

    // First purchase
    const firstPrice =
        player.findPrice(UpgradeType.Banker);

    expect(firstPrice).toBeGreaterThan(0);

    player.updatedBuyPower = firstPrice;

    const firstPurchase =
        player.purchaseBuilding(UpgradeType.Banker);

    expect(firstPurchase).not.toBeNull();

    expect(
        player.findUpgradeLevel(UpgradeType.Banker)
    ).toBe(1);

    // Second purchase
    const secondPrice =
        player.findPrice(UpgradeType.Banker);

    expect(secondPrice).toBeGreaterThan(0);

    player.updatedBuyPower = secondPrice;

    const secondPurchase =
        player.purchaseBuilding(UpgradeType.Banker);

    expect(secondPurchase).not.toBeNull();

    expect(
        player.findUpgradeLevel(UpgradeType.Banker)
    ).toBe(2);
});
test("Purchased building automatically produces buy power", () => {
    const building = new Building(UpgradeType.Banker, 1, 20, 100, 1000);

    const addBuyPower = vi.fn();

    building.startAutoClicker(addBuyPower);

    // The interval is 1000 milliseconds
    vi.advanceTimersByTime(1000);

    expect(addBuyPower).toHaveBeenCalledTimes(1);

    expect(addBuyPower).toHaveBeenCalledWith(
        building.calculateProduction(
            building.upgradeLevel
        )
    );
});
test("Building produces repeatedly after each interval", () => {
    const building = new Building(UpgradeType.Banker, 1, 20, 100, 1000);

    const addBuyPower = vi.fn();

    building.startAutoClicker(addBuyPower);

    // Three intervals should cause three productions
    vi.advanceTimersByTime(3000);

    expect(addBuyPower).toHaveBeenCalledTimes(3);
});