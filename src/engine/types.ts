export type Term = "1y" | "3y" | "5y";

export type PricePoint = { month: number; price_usd: number };

export type Mission = {
  id: string;
  name: string;
  cap_usdc: number;
  allowReapplyWhenFilled?: boolean;
};

export type SeedBase = { id: string; name: string; mission_ids: string[] };

export type SeedKey = {
  id: string;
  amount_usdc: number;
  term: Term;
  seedbase_id: string;
  entry_price_usd: number;
  // optional referral fields for v1 (kept simple)
  activatorReferral?: { enabled: boolean; score: number };
};

export type GiverKey = {
  id: string;
  amount_usdc: number;
  // v1: one-time injection at month 0 (we can add schedules later)
  month?: number;
};

export type Policy = {
  treasury_pct: number;                // typically 0.1 (10%)
  system_distribution_cap_pct: number; // default 0.65
  missions_pct: number;              // default 0.45
  participants_pct: number;          // default 0.30
  affiliates_pct: number;            // default 0.15
  reserve_pct: number;               // default 0.10
  activator_target_caps: { "1y": number; "3y": number; "5y": number }; // planning targets
  affiliate_cash_cap_pct: number;    // inside affiliate pool, default 0.10
};

export type Scenario = {
  meta: { name: string; horizonMonths: number; notes?: string };
  market: {
    initialMarketCapUSD: number;
    price_path: PricePoint[];
    marketCondition?: "bearish" | "neutral" | "bullish";
  };
  structure: { seedbases: SeedBase[]; missions: Mission[] };
  participants: { seedkeys: SeedKey[]; giverkeys: GiverKey[] };
  policy: Policy;
};

export type ExplainLine = { step: string; detail: string };

export type MonthResult = {
  month: number;
  price_usd: number;

  vault_principal_usdc: number;
  vault_giverkey_usdc: number;

  surplus_total_usdc: number;
  surplus_distributable_usdc: number;

  treasury_usdc: number;

  pool_missions_usdc: number;
  pool_participants_usdc: number;
  pool_affiliates_usdc: number;
  pool_reserve_usdc: number;

  missions_funded_to_date_usdc: number;
};

export type SimulationResult = {
  scenarioName: string;
  horizonMonths: number;
  months: MonthResult[];
  explain: ExplainLine[];
};
