import type { Scenario, SimulationResult, MonthResult } from "./types";
import { validateScenario } from "./schema";
import { seedUnits, surplusValue } from "./surplus";
import { distributableSurplus, treasuryTake, splitPools } from "./pools";
import { explain } from "./explain";

function priceForMonth(price_path: {month:number; price_usd:number}[], month: number): number {
  // piecewise: use last known point <= month
  const sorted = [...price_path].sort((a,b)=>a.month-b.month);
  let price = sorted[0].price_usd;
  for (const pt of sorted) if (pt.month <= month) price = pt.price_usd;
  return price;
}

export function runSimulation(rawScenario: unknown): SimulationResult {
  const s0 = validateScenario(rawScenario) as unknown as Scenario;

  const explainLines = [];
  explain(explainLines, "validate", "Scenario validated and pool % sum checked. Treasury fixed at 10%.");

  const horizon = s0.meta.horizonMonths;

  // vault principal is SeedKey principal + GiverKey principal (both principal, but giverkey never exits)
  const seedkey_principal = s0.participants.seedkeys.reduce((a,k)=>a+k.amount_usdc,0);
  const giverkey_principal = s0.participants.giverkeys.reduce((a,g)=>a+g.amount_usdc,0);

  explain(explainLines, "vault.principal",
    `SeedKey principal=${seedkey_principal.toFixed(2)}; GiverKey principal=${giverkey_principal.toFixed(2)} (never exits).`);

  // Precompute seed units + entry prices per SeedKey
  const positions = s0.participants.seedkeys.map(k => ({
    id: k.id,
    seed_units: seedUnits(k.amount_usdc, k.entry_price_usd),
    entry: k.entry_price_usd
  }));

  explain(explainLines, "seed.units",
    `Computed seed units for ${positions.length} SeedKeys using seed_units=amount/entry_price.`);

  let missionsFundedToDate = 0;

  const months: MonthResult[] = [];

  for (let m=0; m<=horizon; m++) {
    const price = priceForMonth(s0.market.price_path, m);

    // Surplus total (v1) = sum over SeedKeys only, from appreciation above entry
    let surplusTotal = 0;
    for (const pos of positions) {
      surplusTotal += surplusValue(pos.seed_units, pos.entry, price);
    }

    const surplusDistributable = distributableSurplus(surplusTotal, s0.policy.system_distribution_cap_pct);
    const treasury = treasuryTake(surplusDistributable, s0.policy.treasury_pct);

    const afterTreasury = surplusDistributable - treasury;
    const pools = splitPools(afterTreasury, {
      missions_pct: s0.policy.missions_pct,
      participants_pct: s0.policy.participants_pct,
      affiliates_pct: s0.policy.affiliates_pct,
      reserve_pct: s0.policy.reserve_pct
    });

    // Mission funding (v1): distribute up to caps, overflow ignored for now (tracked in reserve effectively)
    const totalMissionCap = s0.structure.missions.reduce((a,mi)=>a+mi.cap_usdc,0);
    const remainingCap = Math.max(0, totalMissionCap - missionsFundedToDate);
    const missionsThisMonth = Math.min(pools.missions, remainingCap);
    missionsFundedToDate += missionsThisMonth;

    months.push({
      month: m,
      price_usd: price,

      vault_principal_usdc: seedkey_principal,
      vault_giverkey_usdc: giverkey_principal,

      surplus_total_usdc: surplusTotal,
      surplus_distributable_usdc: surplusDistributable,

      treasury_usdc: treasury,

      pool_missions_usdc: pools.missions,
      pool_participants_usdc: pools.participants,
      pool_affiliates_usdc: pools.affiliates,
      pool_reserve_usdc: pools.reserve,

      missions_funded_to_date_usdc: missionsFundedToDate
    });
  }

  explain(explainLines, "surplus.v1",
    "Surplus computed as max(0, seed_units*(mark_price-entry_price)). Distributions only from surplus; principal untouched.");

  explain(explainLines, "pools",
    `Distributable cap=${s0.policy.system_distribution_cap_pct}. Treasury=10%. Pools split missions/participants/affiliates/reserve.`);

  explain(explainLines, "missions",
    "Mission pool pays until sum(mission caps) reached; overflow remains in system (reserve/unused).");

  return {
    scenarioName: s0.meta.name,
    horizonMonths: horizon,
    months,
    explain: explainLines
  };
}
