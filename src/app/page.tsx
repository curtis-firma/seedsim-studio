"use client";

import { useEffect, useMemo, useState } from "react";
import LineChartCard from "../components/LineChartCard";
import { runSimulation } from "../engine/simulate";
import { scenarios, type ScenarioName } from "../engine/scenarios/index";
import type { Scenario } from "../engine/types";

type ScaleInputs = {
  seedbases_count: number;
  activators_total: number;
  envoys_total: number;
  giverkeys_total: number;
  avg_commitment_usdc: number;
  giverkey_usdc_total: number;
};

const BASELINE_SCENARIO: ScenarioName = "Kickstart / Proof";

function money(n: number) {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatDelta(value: number, formatter: (value: number) => string) {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "±";
  return `${sign}${formatter(Math.abs(value))}`;
}

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function scenarioToScale(scenario: Scenario): ScaleInputs {
  const seedbases_count = scenario.structure.seedbases.length;
  const activators_total = scenario.participants.seedkeys.length;
  const envoys_total = scenario.structure.missions.length;
  const giverkeys_total = scenario.participants.giverkeys.length;
  const totalCommitment = scenario.participants.seedkeys.reduce(
    (sum, key) => sum + key.amount_usdc,
    0
  );
  const avg_commitment_usdc =
    activators_total > 0 ? totalCommitment / activators_total : 0;
  const giverkey_usdc_total = scenario.participants.giverkeys.reduce(
    (sum, key) => sum + key.amount_usdc,
    0
  );

  return {
    seedbases_count,
    activators_total,
    envoys_total,
    giverkeys_total,
    avg_commitment_usdc,
    giverkey_usdc_total,
  };
}

function applyScaleToScenario(baseScenario: Scenario, scale: ScaleInputs): Scenario {
  const scenario: Scenario = JSON.parse(JSON.stringify(baseScenario));

  const seedbasesCount = Math.max(0, Math.floor(scale.seedbases_count));
  const envoysTotal = Math.max(0, Math.floor(scale.envoys_total));
  const activatorsTotal = Math.max(0, Math.floor(scale.activators_total));
  const giverkeysTotal = Math.max(0, Math.floor(scale.giverkeys_total));
  const avgCommitment = Math.max(0, scale.avg_commitment_usdc);
  const giverkeyTotal = Math.max(0, scale.giverkey_usdc_total);

  const baseMission = scenario.structure.missions[0];
  const missions = Array.from({ length: envoysTotal }, (_, index) => {
    const missionTemplate =
      scenario.structure.missions[index % scenario.structure.missions.length] ??
      baseMission;
    return {
      id: `M${index + 1}`,
      name: missionTemplate?.name ?? `Mission ${index + 1}`,
      cap_usdc: missionTemplate?.cap_usdc ?? 0,
      allowReapplyWhenFilled: missionTemplate?.allowReapplyWhenFilled ?? true,
    };
  });

  const missionIds = missions.map((mission) => mission.id);
  scenario.structure.missions = missions;
  scenario.structure.seedbases = Array.from({ length: seedbasesCount }, (_, index) => ({
    id: `SB${index + 1}`,
    name: `Seedbase ${index + 1}`,
    mission_ids: missionIds,
  }));

  const seedbaseId = scenario.structure.seedbases[0]?.id ?? "SB1";
  const seedkeyTemplate = scenario.participants.seedkeys[0];
  scenario.participants.seedkeys = Array.from({ length: activatorsTotal }, (_, index) => ({
    id: `S${index + 1}`,
    amount_usdc: avgCommitment,
    term: seedkeyTemplate?.term ?? "5y",
    seedbase_id: seedbaseId,
    entry_price_usd: seedkeyTemplate?.entry_price_usd ?? 0,
  }));

  const giverkeyAmount = giverkeysTotal > 0 ? giverkeyTotal / giverkeysTotal : 0;
  scenario.participants.giverkeys = Array.from({ length: giverkeysTotal }, (_, index) => ({
    id: `G${index + 1}`,
    amount_usdc: giverkeyAmount,
    month: 0,
  }));

  return scenario;
}

export default function Page() {
  const [scenarioName, setScenarioName] =
    useState<ScenarioName>(BASELINE_SCENARIO);
  const [showDelta, setShowDelta] = useState(true);
  const rawScenario = scenarios[scenarioName];
  const baselineScenario = scenarios[BASELINE_SCENARIO];

  const [draftScale, setDraftScale] = useState<ScaleInputs>(() =>
    scenarioToScale(rawScenario)
  );
  const [appliedScale, setAppliedScale] = useState<ScaleInputs>(() =>
    scenarioToScale(rawScenario)
  );
  const [lastAppliedAt, setLastAppliedAt] = useState<number | null>(null);

  useEffect(() => {
    const nextScale = scenarioToScale(rawScenario);
    setDraftScale(nextScale);
    setAppliedScale(nextScale);
    setLastAppliedAt(Date.now());
  }, [rawScenario]);

  const hasScaleChanges = useMemo(
    () =>
      Object.entries(draftScale).some(
        ([key, value]) => appliedScale[key as keyof ScaleInputs] !== value
      ),
    [appliedScale, draftScale]
  );

  const scaledScenario = useMemo(
    () => applyScaleToScenario(rawScenario, appliedScale),
    [rawScenario, appliedScale]
  );

  const result = useMemo(() => runSimulation(scaledScenario), [scaledScenario]);
  const baselineResult = useMemo(
    () => runSimulation(baselineScenario),
    [baselineScenario]
  );

  const months = result.months ?? [];
  const last = months[months.length - 1];
  const previous = months[months.length - 2];

  const baselineMonths = baselineResult.months ?? [];
  const baselineLast = baselineMonths[baselineMonths.length - 1];

  const chartData = months.map((month) => ({ month: month.month, ...month }));

  const totalPrincipal =
    (last?.vault_principal_usdc ?? 0) + (last?.vault_giverkey_usdc ?? 0);
  const baselinePrincipal =
    (baselineLast?.vault_principal_usdc ?? 0) +
    (baselineLast?.vault_giverkey_usdc ?? 0);

  const kpis = [
    {
      label: "Token Price (final month)",
      value: last?.price_usd ?? 0,
      previousValue: previous?.price_usd ?? 0,
      delta: (last?.price_usd ?? 0) - (baselineLast?.price_usd ?? 0),
      format: (value: number) => `$${value.toFixed(4)}`,
    },
    {
      label: "Total Principal",
      value: totalPrincipal,
      previousValue:
        (previous?.vault_principal_usdc ?? 0) + (previous?.vault_giverkey_usdc ?? 0),
      delta: totalPrincipal - baselinePrincipal,
      format: money,
    },
    {
      label: "Surplus Total",
      value: last?.surplus_total_usdc ?? 0,
      previousValue: previous?.surplus_total_usdc ?? 0,
      delta:
        (last?.surplus_total_usdc ?? 0) - (baselineLast?.surplus_total_usdc ?? 0),
      format: money,
    },
    {
      label: "Treasury",
      value: last?.treasury_usdc ?? 0,
      previousValue: previous?.treasury_usdc ?? 0,
      delta: (last?.treasury_usdc ?? 0) - (baselineLast?.treasury_usdc ?? 0),
      format: money,
    },
    {
      label: "Missions Funded (to date)",
      value: last?.missions_funded_to_date_usdc ?? 0,
      previousValue: previous?.missions_funded_to_date_usdc ?? 0,
      delta:
        (last?.missions_funded_to_date_usdc ?? 0) -
        (baselineLast?.missions_funded_to_date_usdc ?? 0),
      format: money,
    },
  ];

  const vaultSnapshot = [
    {
      label: "Principal Total",
      value: totalPrincipal,
    },
    {
      label: "Surplus Total",
      value: last?.surplus_total_usdc ?? 0,
    },
    {
      label: "Treasury",
      value: last?.treasury_usdc,
    },
    {
      label: "Missions Funded To Date",
      value: last?.missions_funded_to_date_usdc ?? 0,
    },
    {
      label: "Participants Distributed To Date",
      value: (last as { participants_distributed_to_date_usdc?: number })
        ?.participants_distributed_to_date_usdc ?? 0,
    },
    {
      label: "Affiliates Paid To Date",
      value: (last as { affiliates_paid_to_date_usdc?: number })
        ?.affiliates_paid_to_date_usdc ?? 0,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              SeedSIM Studio
            </div>
            <h1 className="text-3xl font-semibold text-slate-900">Simulation Cockpit</h1>
            <p className="max-w-2xl text-sm text-slate-600">
              Deterministic engine with explainable math. Compare scenarios, scale inputs,
              and review KPI output before sharing results.
            </p>
          </div>
          <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            No yield promises
          </div>
        </header>

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
                onChange={(event) => setScenarioName(event.target.value as ScenarioName)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                {Object.keys(scenarios).map((name) => (
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
                      setDraftScale((prev) => ({
                        ...prev,
                        seedbases_count: toNumber(event.target.value),
                      }))
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
                      setDraftScale((prev) => ({
                        ...prev,
                        activators_total: toNumber(event.target.value),
                      }))
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
                      setDraftScale((prev) => ({
                        ...prev,
                        envoys_total: toNumber(event.target.value),
                      }))
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
                      setDraftScale((prev) => ({
                        ...prev,
                        giverkeys_total: toNumber(event.target.value),
                      }))
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
                      setDraftScale((prev) => ({
                        ...prev,
                        avg_commitment_usdc: toNumber(event.target.value),
                      }))
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
                      setDraftScale((prev) => ({
                        ...prev,
                        giverkey_usdc_total: toNumber(event.target.value),
                      }))
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </label>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setDraftScale(scenarioToScale(rawScenario))}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
                >
                  Reset to preset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedScale(draftScale);
                    setLastAppliedAt(Date.now());
                  }}
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
                  onChange={(event) => setShowDelta(event.target.checked)}
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
                      <div>
                        Δ vs baseline: {formatDelta(kpi.delta, kpi.format)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-700">Vault Snapshot</div>
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
                    </div>
                  ))}
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <LineChartCard
                title="Price"
                data={chartData}
                xKey="month"
                yKey="price_usd"
                valuePrefix="$"
              />
              <LineChartCard
                title="Surplus Total"
                data={chartData}
                xKey="month"
                yKey="surplus_total_usdc"
                valuePrefix="$"
              />
              <LineChartCard
                title="Missions Funded To Date"
                data={chartData}
                xKey="month"
                yKey="missions_funded_to_date_usdc"
                valuePrefix="$"
              />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700">
                Monthly Outputs (preview)
              </h2>
              <div className="mt-4 overflow-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                      <th className="py-2 pr-4">Month</th>
                      <th className="py-2 pr-4">Price</th>
                      <th className="py-2 pr-4">Surplus</th>
                      <th className="py-2 pr-4">Treasury</th>
                      <th className="py-2 pr-4">Missions Pool</th>
                      <th className="py-2 pr-4">Participants Pool</th>
                      <th className="py-2 pr-4">Affiliates Pool</th>
                      <th className="py-2 pr-4">Reserve Pool</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.months.map((month) => (
                      <tr key={month.month} className="border-t border-slate-100">
                        <td className="py-2 pr-4 font-semibold text-slate-700">
                          {month.month}
                        </td>
                        <td className="py-2 pr-4">
                          ${month.price_usd.toFixed(4)}
                        </td>
                        <td className="py-2 pr-4">{money(month.surplus_total_usdc)}</td>
                        <td className="py-2 pr-4">{money(month.treasury_usdc)}</td>
                        <td className="py-2 pr-4">
                          {money(month.pool_missions_usdc)}
                        </td>
                        <td className="py-2 pr-4">
                          {money(month.pool_participants_usdc)}
                        </td>
                        <td className="py-2 pr-4">
                          {money(month.pool_affiliates_usdc)}
                        </td>
                        <td className="py-2 pr-4">
                          {money(month.pool_reserve_usdc)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700">Explain the Math</h2>
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-600">
                {result.explain.map((line, idx) => (
                  <li key={idx}>
                    <span className="font-semibold text-slate-800">
                      {line.step}:
                    </span>{" "}
                    {line.detail}
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
