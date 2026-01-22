import { kickstartProof } from "./kickstartProof";

export const aggressive = {
  ...kickstartProof,
  meta: { ...kickstartProof.meta, name: "Aggressive" },
  market: {
    ...kickstartProof.market,
    marketCondition: "bullish",
    price_path: kickstartProof.market.price_path.map((p) => ({
      ...p,
      price_usd: Number((p.price_usd * 1.25).toFixed(6)),
    })),
  },
  policy: {
    ...kickstartProof.policy,
    missions_pct: kickstartProof.policy.missions_pct + 0.05,
    reserve_pct: Math.max(0, kickstartProof.policy.reserve_pct - 0.05),
  },
};
