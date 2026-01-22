export function seedUnits(amount_usdc: number, entry_price_usd: number): number {
  return amount_usdc / entry_price_usd;
}

export function surplusValue(seed_units: number, entry_price_usd: number, mark_price_usd: number): number {
  const raw = seed_units * (mark_price_usd - entry_price_usd);
  return raw > 0 ? raw : 0;
}
