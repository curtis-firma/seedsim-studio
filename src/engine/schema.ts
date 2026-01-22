import { z } from "zod";

const PricePoint = z.object({
  month: z.number().int().min(0),
  price_usd: z.number().positive()
});

const Mission = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  cap_usdc: z.number().min(0),
  allowReapplyWhenFilled: z.boolean().optional()
});

const SeedBase = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  mission_ids: z.array(z.string().min(1))
});

const SeedKey = z.object({
  id: z.string().min(1),
  amount_usdc: z.number().positive(),
  term: z.union([z.literal("1y"), z.literal("3y"), z.literal("5y")]),
  seedbase_id: z.string().min(1),
  entry_price_usd: z.number().positive(),
  activatorReferral: z
    .object({ enabled: z.boolean(), score: z.number().min(0).max(1) })
    .optional()
});

const GiverKey = z.object({
  id: z.string().min(1),
  amount_usdc: z.number().positive(),
  month: z.number().int().min(0).optional()
});

const Policy = z.object({
  treasury_pct: z.literal(0.1),
  system_distribution_cap_pct: z.number().min(0).max(1),
  missions_pct: z.number().min(0).max(1),
  participants_pct: z.number().min(0).max(1),
  affiliates_pct: z.number().min(0).max(1),
  reserve_pct: z.number().min(0).max(1),
  activator_target_caps: z.object({
    "1y": z.number().min(0).max(1),
    "3y": z.number().min(0).max(1),
    "5y": z.number().min(0).max(1)
  }),
  affiliate_cash_cap_pct: z.number().min(0).max(1)
});

export const ScenarioSchema = z.object({
  meta: z.object({
    name: z.string().min(1),
    horizonMonths: z.number().int().min(1).max(240),
    notes: z.string().optional()
  }),
  market: z.object({
    initialMarketCapUSD: z.number().positive(),
    price_path: z.array(PricePoint).min(1),
    marketCondition: z.union([z.literal("bearish"), z.literal("neutral"), z.literal("bullish")]).optional()
  }),
  structure: z.object({
    seedbases: z.array(SeedBase).min(1),
    missions: z.array(Mission).min(1)
  }),
  participants: z.object({
    seedkeys: z.array(SeedKey),
    giverkeys: z.array(GiverKey)
  }),
  policy: Policy
});

export type ScenarioInput = z.infer<typeof ScenarioSchema>;

export function validateScenario(input: unknown): ScenarioInput {
  const parsed = ScenarioSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid scenario: ${msg}`);
  }

  // Sum check
  const p = parsed.data.policy;
  const sum = p.missions_pct + p.participants_pct + p.affiliates_pct + p.reserve_pct;
  if (Math.abs(sum - 1) > 1e-9) throw new Error(`Invalid policy: pool pcts must sum to 1.0 (got ${sum})`);

  return parsed.data;
}
