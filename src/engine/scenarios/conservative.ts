import { kickstartProof } from "./kickstartProof";
import type { Scenario } from "../types";

export const conservative: Scenario = {
  ...kickstartProof,
  meta: { ...kickstartProof.meta, name: "Conservative" },
  market: {
    ...kickstartProof.market,
    marketCondition: "bearish",
    price_path: kickstartProof.market.price_path.map((p) => ({
      ...p,
      price_usd: Number((p.price_usd * 0.85).toFixed(6)),
    })),
  },
  policy: {
    ...kickstartProof.policy,
    affiliates_pct: Math.max(0, kickstartProof.policy.affiliates_pct - 0.03),
    reserve_pct: kickstartProof.policy.reserve_pct + 0.03,
  },
};
