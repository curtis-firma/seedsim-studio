import type { Scenario } from "./types";

export const defaultScenario: Scenario = {
  meta: { name: "Kickstart / Proof Phase", horizonMonths: 36 },
  market: {
    initialMarketCapUSD: 5_000_000,
    marketCondition: "neutral",
    price_path: [
      { month: 0, price_usd: 0.01 },
      { month: 6, price_usd: 0.012 },
      { month: 12, price_usd: 0.015 },
      { month: 24, price_usd: 0.02 },
      { month: 36, price_usd: 0.025 }
    ]
  },
  structure: {
    seedbases: [
      { id: "SB1", name: "CIKseedbase", mission_ids: ["M1", "M2", "M3", "M4"] }
    ],
    missions: [
      { id: "M1", name: "Internal Mission", cap_usdc: 50_000, allowReapplyWhenFilled: true },
      { id: "M2", name: "External Mission A", cap_usdc: 30_000, allowReapplyWhenFilled: true },
      { id: "M3", name: "External Mission B", cap_usdc: 30_000, allowReapplyWhenFilled: true },
      { id: "M4", name: "External Mission C", cap_usdc: 30_000, allowReapplyWhenFilled: true }
    ]
  },
  participants: {
    giverkeys: [{ id: "G1", amount_usdc: 300_000, month: 0 }],
    seedkeys: [
      { id: "S1", amount_usdc: 10_000, term: "5y", seedbase_id: "SB1", entry_price_usd: 0.01 },
      { id: "S2", amount_usdc: 5_000, term: "3y", seedbase_id: "SB1", entry_price_usd: 0.01 }
    ]
  },
  policy: {
    treasury_pct: 0.1,
    system_distribution_cap_pct: 0.65,
    missions_pct: 0.45,
    participants_pct: 0.30,
    affiliates_pct: 0.15,
    reserve_pct: 0.10,
    activator_target_caps: { "1y": 0.10, "3y": 0.15, "5y": 0.20 },
    affiliate_cash_cap_pct: 0.10
  }
};
