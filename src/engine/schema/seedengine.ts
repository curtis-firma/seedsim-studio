// src/engine/schema/seedengine.ts
// SeedEngine Schema v0
// Purpose: a stable contract between (1) scenario authoring (humans/GPT), (2) deterministic simulation (SeedEngine),
// and (3) cockpit UI rendering (SeedSIM). Types only — no math or runtime logic.

// ------------------------
// Versioning + labels
// ------------------------

export type SeedEngineVersion = "seedengine.v0";

/**
 * label_mode lets the UI (and later GPT) display audience-friendly labels
 * without changing the underlying economic model.
 */
export type AudienceLabel = "church" | "nonprofit" | "neutral";

/**
 * Price path profiles for quick scenario authoring.
 * - "custom" supports explicit monthly return arrays.
 */
export type PricePathProfile = "bear" | "flat" | "bull" | "custom";

// ------------------------
// Policy (surplus allocation + caps)
// ------------------------

export type SeedEnginePolicy = {
  /**
   * Treasury % of surplus (stability + ops).
   * Example: 0.10 for 10%.
   */
  treasury_pct_of_surplus: number;

  /**
   * Participant distribution cap (target ceiling) as % of surplus.
   * This models “we don’t want 1000% returns”; keep it impact-focused.
   * Example: 0.20 for 20%.
   */
  distribution_cap_pct_of_surplus: number;

  /**
   * How the distributable surplus is split.
   * These should sum to 1.0 (or the engine/adapter should normalize later).
   */
  splits: {
    missions_pct: number; // Envoys / programs
    participants_pct: number; // Activators
    affiliates_pct: number; // Referral + amplification
    reserve_pct: number; // Safety buffer / future surplus
  };
};

// ------------------------
// Scale knobs (the “Machinations levers”)
// ------------------------

export type ScaleKnobs = {
  /**
   * Seedbases represent the top-level org containers.
   * Audience mapping: Church / Nonprofit / Charity.
   */
  seedbases_count: number;

  /**
   * Activators are donors/participants committing principal via SeedKeys.
   * Total activators = seedbases_count * activators_per_seedbase
   */
  activators_per_seedbase: number;

  /**
   * Average principal per activator (USDC).
   */
  avg_seedkey_commitment_usdc: number;

  /**
   * Optional term mix used for cohort modeling.
   * Percentages should sum to 1.0.
   */
  seedkey_term_mix?: {
    term_1y_pct: number;
    term_3y_pct: number;
    term_5y_pct: number;
  };

  /**
   * Envoys are missions/programs attached to each Seedbase.
   * Total envoys = seedbases_count * envoys_per_seedbase
   */
  envoys_per_seedbase: number;

  /**
   * Average initial mission cap (USDC) per envoy.
   * Missions can apply for more later (v2), but v0 models initial caps.
   */
  avg_envoy_cap_usdc: number;

  /**
   * Whether missions can apply for more funding beyond cap (future logic).
   * Keep for schema stability; adapter/engine can ignore in v0.
   */
  envoy_apply_more_enabled?: boolean;

  /**
   * GiverKeys are non-returning injections (system donations / stabilization).
   * Total giverkey principal = giverkeys_count * avg_giverkey_usdc
   */
  giverkeys_count: number;

  /**
   * Average giverkey injection size (USDC).
   */
  avg_giverkey_usdc: number;
};

// ------------------------
// Market assumptions
// ------------------------

export type MarketAssumptions = {
  /**
   * Starting market cap of the token/system (USD).
   */
  initial_marketcap_usd: number;

  /**
   * Price evolution controls.
   * - profile: bear/flat/bull for quick presets
   * - custom: optionally provide monthly_return_pct array
   */
  price_path: {
    profile: PricePathProfile;

    /**
     * Optional explicit monthly returns (e.g., [0.02, -0.01, ...]).
     * Only used when profile === "custom".
     * Length should equal horizon_months.
     */
    monthly_return_pct?: number[];
  };

  /**
   * Baseline yield assumption on USDC in vault/treasury (APR).
   * Example: 0.04 for 4%.
   */
  usdc_yield_apr: number;
};

// ------------------------
// SeedEngine input (what we author + store + patch)
// ------------------------

export type SeedEngineInput = {
  version: SeedEngineVersion;

  /**
   * Affects labels/tooltips only (church vs nonprofit language), not math.
   */
  label_mode: AudienceLabel;

  /**
   * Simulation horizon in months.
   */
  horizon_months: number;

  /**
   * Core scale levers for “talkable” scenarios.
   */
  scale: ScaleKnobs;

  /**
   * Market + yield assumptions for scenario stress tests.
   */
  market: MarketAssumptions;

  /**
   * Surplus allocation and caps.
   */
  policy: SeedEnginePolicy;

  /**
   * Optional human notes (exec context).
   */
  notes?: string;
};

// =======================
// OUTPUT (what the UI reads)
// =======================

export type SeedEngineMonth = {
  month: number;

  // market
  price_usd: number;
  marketcap_usd: number;

  // vault + surplus
  principal_total_usdc: number; // seedkeys + giverkeys in vault
  surplus_total_usdc: number;

  // allocations (cumulative)
  missions_funded_to_date_usdc: number;
  participants_distributed_to_date_usdc: number;
  affiliates_paid_to_date_usdc: number;

  // stability (optional if tracked by engine)
  treasury_usdc?: number;
};

export type SeedEngineOutput = {
  months: SeedEngineMonth[];

  // headline summary for cockpit tiles
  summary: {
    seedbases_count: number;
    activators_total: number;
    envoys_total: number;
    giverkeys_total: number;

    total_seedkey_principal_usdc: number;
    total_giverkey_principal_usdc: number;

    funded_missions_pct?: number; // optional if caps tracked
  };
};