# SeedSIM Studio / SeedEngine Spec (v1)

## Purpose
SeedSIM Studio is a cockpit web app for exploring Seedbase economics safely.
- It is NOT a yield promise.
- It is NOT a price predictor.
- Price/market cap are environmental inputs only.

SeedEngine is the deterministic simulation library that powers SeedSIM.
SeedSIM Chat (GPT Copilot) only proposes scenario changes as JSON Patch; it does not invent economics.

## Locked Truths
- One central Vault.
- Principal protection is sacred.
- GiverKey principal never exits.
- Only surplus is distributable.
- Treasury = 10% of surplus ALWAYS (fixed).
- Missions are capped at initial need and can reapply when filled.
- Affiliates split into:
  A) Amplifier: score-only, no cash payout
  B) Activator Referral: cash + score, cash capped, paid from surplus only

## GTM Baseline Scenario (Kickstart / Proof Phase)
- Start market cap: $5,000,000
- 1 active SeedBase: CIKseedbase
- 4 missions: 1 internal, 3 external
- 1 GiverKey injection paced smoothly for early stability
- SeedKey commitments activated via digital events/network
- 3 standby SeedBases (v2 scenario)

Default term mix if unspecified: 30% 1y / 40% 3y / 30% 5y
Target outcome bands (planning targets, not promises): 1y ~10%, 3y ~15%, 5y ~20%

## Core Definitions
### Seed Units
A SeedKey commitment of amount_usdc at entry_price_usd mints:
seed_units = amount_usdc / entry_price_usd

### Mark Price
mark_price(t) is given by scenario price path for month t.

### Surplus (v1)
surplus_value(t) = max(0, seed_units * (mark_price(t) - entry_price_usd))

Distributions are paid only from surplus. Principal is never distributed away.

### Treasury
treasury_amount(t) = treasury_pct * surplus_distributable(t)
treasury_pct = 0.10 (fixed)

### Distributable Cap
system_distribution_cap_pct = default 0.65
surplus_distributable(t) = min( surplus_total(t), system_distribution_cap_pct * surplus_total(t) )

## Pools (after treasury)
After treasury, remaining distributable surplus is split:
- missions_pct (default 0.45)
- participants_pct (default 0.30)
- affiliates_pct (default 0.15)
- reserve_pct (default 0.10)

These must sum to 1.00.

## Missions
- Each mission has cap_usdc (initial need).
- Missions receive funds until cap reached.
- Once filled, mission can reapply (v1 flag allowReapplyWhenFilled=true). When reapply, cap can be extended via scenario.

## Affiliates
### Track A: Amplifier
- Score-only rewards.
- NO cash payout.
- Score affects attribution/weighting only, never creates money.

### Track B: Activator Referral
- Cash + score.
- Cash is paid from affiliates pool only.
- cashCapPct default 0.10 (cap within affiliate pool).

## Scenario JSON Schema (v1)
scenario.json contains:
- meta: name, horizonMonths
- market: initialMarketCapUSD, price_path[{month, price_usd}], marketCondition label
- structure: seedbases, missions (with cap_usdc)
- participants: seedkeys (amount_usdc, term, seedbase_id, entry_price_usd), giverkeys (amount_usdc, injection schedule)
- policy: treasury_pct (fixed 0.
