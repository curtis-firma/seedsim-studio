"use client";

import { useEffect, useMemo, useState } from "react";
import { runSimulation } from "../engine/simulate";
import { scenarios, type ScenarioName } from "../engine/scenarios";
import type { Scenario } from "../engine/types";
import {
  ChartsView,
  CockpitOverview,
  type ScaleInputs,
  VaultView,
} from "../views";

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
  const [activeView, setActiveView] = useState<"overview" | "charts" | "vault">(
    "overview"
  );
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

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            View Mode
          </div>
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 text-xs font-semibold text-slate-600">
            {[
              { id: "overview", label: "Overview" },
              { id: "charts", label: "Charts" },
              { id: "vault", label: "Vault" },
            ].map((view) => (
              <button
                key={view.id}
                type="button"
                onClick={() =>
                  setActiveView(view.id as "overview" | "charts" | "vault")
                }
                className={`rounded-full px-4 py-1.5 transition ${
                  activeView === view.id
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>

        {activeView === "overview" ? (
          <CockpitOverview
            scenarioName={scenarioName}
            scenarioOptions={Object.keys(scenarios)}
            onScenarioChange={(value) => setScenarioName(value as ScenarioName)}
            draftScale={draftScale}
            onDraftScaleChange={(key, value) =>
              setDraftScale((prev) => ({
                ...prev,
                [key]: toNumber(String(value)),
              }))
            }
            onResetScale={() => setDraftScale(scenarioToScale(rawScenario))}
            onApplyScale={() => {
              setAppliedScale(draftScale);
              setLastAppliedAt(Date.now());
            }}
            hasScaleChanges={hasScaleChanges}
            lastAppliedAt={lastAppliedAt}
            kpis={kpis}
            showDelta={showDelta}
            onToggleDelta={setShowDelta}
            vaultSnapshot={vaultSnapshot}
            formatDelta={formatDelta}
            money={money}
          />
        ) : null}

        {activeView === "charts" ? (
          <ChartsView
            chartData={chartData}
            months={months}
            explain={result.explain ?? []}
            money={money}
          />
        ) : null}

        {activeView === "vault" ? (
          <VaultView
            priceUsd={last?.price_usd ?? 0}
            metrics={[
              { key: "principal", label: "Principal Total", usdc: totalPrincipal },
              {
                key: "surplus",
                label: "Surplus Total",
                usdc: last?.surplus_total_usdc ?? 0,
              },
              {
                key: "treasury",
                label: "Treasury",
                usdc: last?.treasury_usdc ?? 0,
              },
              {
                key: "missions",
                label: "Missions Funded To Date",
                usdc: last?.missions_funded_to_date_usdc ?? 0,
              },
            ]}
            money={money}
          />
        ) : null}
      </div>
    </main>
  );
}
