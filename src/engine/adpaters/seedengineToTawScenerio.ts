// Adapter: converts SeedEngineInput into a raw Scenario that the
// existing simulation engine can consume.  This function never
// modifies the underlying math; it only maps high-level inputs into
// the structure expected by validateScenario and runSimulation.

import { defaultScenario } from "../defaultScenario";
import type { Scenario } from "../types";
import type { SeedEngineInput } from "../schema/seedengine";

export function seedengineToRawScenario(input: SeedEngineInput): Scenario {
  const raw: Scenario = JSON.parse(JSON.stringify(defaultScenario));

  // Horizon
  raw.meta.horizonMonths = input.horizon_months;

  // Market
  raw.market.initialMarketCapUSD = input.market.initial_marketcap_usd;
  if (input.market.marketCondition) {
    raw.market.marketCondition = input.market.marketCondition;
  } else {
    raw.market.marketCondition = raw.market.marketCondition ?? "neutral";
  }

  // Compute totals
  const seedbases = input.scale.seedbases_count;
  const activators_total = seedbases * input.scale.activators_per_seedbase;
  const seedkey_principal_usdc =
    activators_total * input.scale.avg_seedkey_commitment_usdc;
  const giverkey_principal_usdc =
    input.scale.giverkeys_count * input.scale.avg_giverkey_usdc;

  // Replicate seedbases using first mission set from defaultScenario
  const baseMissionIds =
    defaultScenario.structure.seedbases[0]?.mission_ids?.slice() ?? [];
  raw.structure.seedbases = [];
  for (let i = 1; i <= seedbases; i++) {
    raw.structure.seedbases.push({
      id: `SB${i}`,
      name: `Seedbase ${i}`,
      mission_ids: baseMissionIds,
    });
  }
  // Missions remain unchanged
  raw.structure.missions = JSON.parse(
    JSON.stringify(defaultScenario.structure.missions)
  );

  // Aggregate SeedKeys and GiverKeys
  raw.participants.seedkeys = [];
  if (seedkey_principal_usdc > 0) {
    raw.participants.seedkeys.push({
      id: "SK1",
      amount_usdc: seedkey_principal_usdc,
      term: "5y",
      seedbase_id: raw.structure.seedbases[0]?.id ?? "SB1",
      entry_price_usd:
        defaultScenario.participants.seedkeys[0]?.entry_price_usd ?? 0.01,
    });
  }
  raw.participants.giverkeys = [];
  if (giverkey_principal_usdc > 0) {
    raw.participants.giverkeys.push({
      id: "GK1",
      amount_usdc: giverkey_principal_usdc,
      month: 0,
    });
  }

  // Policy mapping
  raw.policy.treasury_pct = input.policy.treasury_pct_of_surplus;
  raw.policy.system_distribution_cap_pct =
    input.policy.distribution_cap_pct_of_surplus;
  raw.policy.missions_pct = input.policy.splits.missions_pct;
  raw.policy.participants_pct = input.policy.splits.participants_pct;
  raw.policy.affiliates_pct = input.policy.splits.affiliates_pct;
  raw.policy.reserve_pct = input.policy.splits.reserve_pct;

  return raw;
}