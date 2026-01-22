import { describe, it, expect } from "vitest";
import { seedUnits, surplusValue } from "../src/engine/surplus";


describe("surplus", () => {
  it("mints seed units and calculates surplus", () => {
    const units = seedUnits(1000, 1); // 1000 units
    expect(units).toBe(1000);
    expect(surplusValue(units, 1, 1.5)).toBe(500);
    expect(surplusValue(units, 1, 0.9)).toBe(0);
  });
});
