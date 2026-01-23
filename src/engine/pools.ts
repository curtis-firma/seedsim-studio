export function distributableSurplus(total_surplus: number, cap_pct: number): number {
  return Math.min(total_surplus, cap_pct * total_surplus);
}

export function treasuryTake(distributable_surplus: number, treasury_pct: number): number {
  return distributable_surplus * treasury_pct;
}

export function splitPools(after_treasury: number, pcts: {
  missions_pct: number; participants_pct: number; affiliates_pct: number; reserve_pct: number;
}) {
  return {
    missions: after_treasury * pcts.missions_pct,
    participants: after_treasury * pcts.participants_pct,
    affiliates: after_treasury * pcts.affiliates_pct,
    reserve: after_treasury * pcts.reserve_pct
  };
}
