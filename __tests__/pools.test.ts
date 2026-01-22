import { describe, it, expect } from "vitest";
import { distributableSurplus, treasuryTake, splitPools } from "../src/engine/pools";
;

describe("pools", () => {
  it("caps surplus, takes treasury, splits pools", () => {
    const total = 1000;
    const dist = distributableSurplus(total, 0.65);
    expect(dist).toBe(650);
    const treasury = treasuryTake(dist, 0.1);
    expect(treasury).toBe(65);
    const after = dist - treasury; // 585
    const pools = splitPools(after, { missions_pct: 0.45, participants_pct: 0.30, affiliates_pct: 0.15, reserve_pct: 0.10 });
    expect(Math.round(pools.missions)).toBe(263); // 263.25
  });
});

