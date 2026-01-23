import type { ReactNode } from "react";

export type ScaleInputs = {
  seedbases_count: number;
  activators_total: number;
  envoys_total: number;
  giverkeys_total: number;
  avg_commitment_usdc: number;
  giverkey_usdc_total: number;
};

export type KpiCard = {
  label: string;
  value: number;
  previousValue?: number;
  delta: number;
  format: (value: number) => string;
};

export type VaultSnapshotItem = {
  label: string;
  value?: number;
  helper?: ReactNode;
};

type CockpitOverviewProps = {
  scenarioName: string;
  scenarioOptions: string[];
  onScenarioChange: (value: string) => void;
  draftScale: ScaleInputs;
  onDraftScaleChange: (key: keyof ScaleInputs, value: number) => void;
  onResetScale: () => void;
  onApplyScale: () => void;
  hasScaleChanges: boolean;
  lastAppliedAt: number | null;
  kpis: KpiCard[];
  showDelta: boolean;
  onToggleDelta: (checked: boolean) => void;
  vaultSnapshot: VaultSnapshotItem[];
  formatDelta: (value: number, formatter: (value: number) => string) => string;
  money: (value: number) => string;
};

export default function CockpitOverview({
  scenarioName,
  scenarioOptions,
  onScenarioChange,
  draftScale,
  onDraftScaleChange,
  onResetScale,
  onApplyScale,
  hasScaleChanges,
  lastAppliedAt,
  kpis,
  showDelta,
  onToggleDelta,
  vaultSnapshot,
  formatDelta,
  money,
}: CockpitOverviewProps) {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6 lg:self-start">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Scenario + Scale
          </div>
          <p className="text-sm text-slate-600">
            Pick a preset then scale the participant counts and commitments.
          </p>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-semibold text-slate-700">Scenario Preset</div>
          <select
            value={scenarioName}
            onChange={(event) => onScenarioChange(event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            {scenarioOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-semibold text-slate-700">Scale Panel</div>
          <p className="text-xs text-slate-500">
            This scales the preset scenario before simulation.
          </p>
          <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <label className="flex flex-col gap-1">
              Seedbases Count
              <input
                type="number"
                min={0}
                value={draftScale.seedbases_count}
                onChange={(event) =>
                  onDraftScaleChange("seedbases_count", Number(event.target.value))
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>
            <label className="flex flex-col gap-1">
              Activators Total
              <input
                type="number"
                min={0}
                value={draftScale.activators_total}
                onChange={(event) =>
                  onDraftScaleChange("activators_total", Number(event.target.value))
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>
            <label className="flex flex-col gap-1">
              Envoys Total
              <input
                type="number"
                min={0}
                value={draftScale.envoys_total}
                onChange={(event) =>
                  onDraftScaleChange("envoys_total", Number(event.target.value))
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>
            <label className="flex flex-col gap-1">
              GiverKeys Total
              <input
                type="number"
                min={0}
                value={draftScale.giverkeys_total}
                onChange={(event) =>
                  onDraftScaleChange("giverkeys_total", Number(event.target.value))
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>
            <label className="flex flex-col gap-1">
              Avg Commitment (USDC)
              <input
                type="number"
                min={0}
                value={draftScale.avg_commitment_usdc}
                onChange={(event) =>
                  onDraftScaleChange("avg_commitment_usdc", Number(event.target.value))
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>
            <label className="flex flex-col gap-1">
              GiverKey USDC Total
              <input
                type="number"
                min={0}
                value={draftScale.giverkey_usdc_total}
                onChange={(event) =>
                  onDraftScaleChange("giverkey_usdc_total", Number(event.target.value))
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={onResetScale}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
            >
              Reset to preset
            </button>
            <button
              type="button"
              onClick={onApplyScale}
              disabled={!hasScaleChanges}
              className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Simulate
            </button>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <span
                className={`h-2 w-2 rounded-full ${
                  hasScaleChanges ? "bg-amber-400" : "bg-emerald-500"
                }`}
              />
              {hasScaleChanges
                ? "Changes pending"
                : lastAppliedAt
                ? "Applied"
                : "Applied"}
            </div>
          </div>
        </div>
      </aside>

      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-700">KPIs</div>
            <div className="text-xs text-slate-500">
              Final month outputs for {scenarioName}
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={showDelta}
              onChange={(event) => onToggleDelta(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-800"
            />
            Δ vs baseline
          </label>
        </div>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  {kpi.label}
                </div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">
                  {kpi.format(kpi.value)}
                </div>
              </div>
              <div className="mt-4 space-y-1 text-xs text-slate-500">
                <div>Last month: {kpi.format(kpi.previousValue ?? 0)}</div>
                {showDelta && (
                  <div>Δ vs baseline: {formatDelta(kpi.delta, kpi.format)}</div>
                )}
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-700">
                Vault Snapshot
              </div>
              <div className="text-xs text-slate-500">
                End-of-period positions across the vault.
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {vaultSnapshot
              .filter((item) => item.value !== undefined)
              .map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="text-xs font-semibold text-slate-500">
                    {item.label}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">
                    {money(item.value ?? 0)}
                  </div>
                  {item.helper ? (
                    <div className="mt-2 text-xs text-slate-500">
                      {item.helper}
                    </div>
                  ) : null}
                </div>
              ))}
          </div>
        </section>
      </div>
    </section>
  );
}
