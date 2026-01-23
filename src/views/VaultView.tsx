import { useMemo, useState } from "react";

type VaultMetric = {
  key: string;
  label: string;
  usdc: number;
};

type VaultViewProps = {
  priceUsd: number;
  metrics: VaultMetric[];
  money: (value: number) => string;
};

function formatCik(value: number) {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

export default function VaultView({ priceUsd, metrics, money }: VaultViewProps) {
  const [displayUnit, setDisplayUnit] = useState<"USDC" | "CIK">("USDC");

  const safePrice = Number.isFinite(priceUsd) && priceUsd > 0 ? priceUsd : 0;
  const metricsWithCik = useMemo(() => {
    return metrics.map((metric) => {
      const cik = safePrice > 0 ? metric.usdc / safePrice : 0;
      return {
        ...metric,
        cik,
      };
    });
  }, [metrics, safePrice]);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-700">Vault View</div>
          <div className="text-xs text-slate-500">
            Final-month balances with toggleable display units.
          </div>
        </div>
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 text-xs font-semibold text-slate-600 shadow-sm">
          {(["USDC", "CIK"] as const).map((unit) => (
            <button
              key={unit}
              type="button"
              onClick={() => setDisplayUnit(unit)}
              className={`rounded-full px-3 py-1 transition ${
                displayUnit === unit
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {unit}
            </button>
          ))}
        </div>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>Display Units: {displayUnit}</span>
          <span>Price per CIK: {safePrice > 0 ? `$${safePrice.toFixed(4)}` : "N/A"}</span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metricsWithCik.map((metric) => {
            const primaryValue =
              displayUnit === "USDC"
                ? money(metric.usdc)
                : `${formatCik(metric.cik)} CIK`;
            const secondaryValue =
              displayUnit === "USDC"
                ? `${formatCik(metric.cik)} CIK`
                : `${money(metric.usdc)} USDC`;

            return (
              <div
                key={metric.key}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="text-xs font-semibold text-slate-500">
                  {metric.label}
                </div>
                <div className="mt-2 text-lg font-semibold text-slate-900">
                  {primaryValue}
                </div>
                <div className="mt-1 text-xs text-slate-500">{secondaryValue}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
