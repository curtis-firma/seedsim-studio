"use client";

import React, { useMemo, useState } from "react";
import LineChartCard from "../components/LineChartCard";

import { runSimulation } from "../engine/index";
import { scenarios, type ScenarioName } from "../engine/scenarios/index";


function money(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function Page() {


const [scenarioName, setScenarioName] = 
  React.useState<ScenarioName>("Kickstart / Proof");

const [showDelta, setShowDelta] = React.useState(true);

const rawScenario = scenarios[scenarioName];

const result = React.useMemo(() => runSimulation(rawScenario), [rawScenario]);


const baselineResult = React.useMemo(() => runSimulation(scenarios["Kickstart / Proof"]), []);

const months = result.months ?? [];
const last = months[months.length - 1];

const baseMonths = baselineResult.months ?? [];
const baseLast = baseMonths[baseMonths.length - 1];

const isBaseline = scenarioName === "Kickstart / Proof";

const chartData = months.map((m) => ({ month: m.month, ...m }));

const deltaSurplus = (last?.surplus_total_usdc ?? 0) - (baseLast?.surplus_total_usdc ?? 0);
const deltaMissions = (last?.missions_funded_to_date_usdc ?? 0) - (baseLast?.missions_funded_to_date_usdc ?? 0);
const deltaTreasury = (last?.treasury_usdc ?? 0) - (baseLast?.treasury_usdc ?? 0);

const seedPrincipal = rawScenario.participants.seedkeys.reduce((a, k) => a + k.amount_usdc, 0);
const giverPrincipal = rawScenario.participants.giverkeys.reduce((a, g) => a + g.amount_usdc, 0);


  return (
    <main className="min-h-screen p-6 space-y-6">
{/* Scenario selector */}
<div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
  <label style={{ fontSize: 13, fontWeight: 700 }}>Scenario</label>
  <select
    value={scenarioName}
    onChange={(e) => setScenarioName(e.target.value as ScenarioName)}
    style={{ border: "1px solid rgba(0,0,0,0.15)", borderRadius: 10, padding: "8px 10px", background: "white" }}
  >
    {Object.keys(scenarios).map((name) => (
      <option key={name} value={name}>
        {name}
      </option>
    ))}
  </select>

  {!isBaseline && (
    <label style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8, fontSize: 13 }}>
      <input type="checkbox" checked={showDelta} onChange={(e) => setShowDelta(e.target.checked)} />
      Show Δ vs baseline (final month)
    </label>
  )}
</div>

{/* Scenario summary */}
<div style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, padding: 16, background: "white", marginBottom: 16 }}>
  <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>Scenario Summary</div>
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10, fontSize: 13 }}>
    <div><strong>Horizon (months):</strong> {rawScenario.meta.horizonMonths}</div>
    <div><strong>Initial Market Cap:</strong> {rawScenario.market.initialMarketCapUSD.toLocaleString()}</div>
    <div><strong>SeedKey Principal:</strong> {seedPrincipal.toLocaleString()}</div>
    <div><strong>GiverKey Principal:</strong> {giverPrincipal.toLocaleString()}</div>
    <div><strong>Treasury %:</strong> {(rawScenario.policy.treasury_pct * 100).toFixed(0)}%</div>
    <div><strong>Distribution Cap %:</strong> {(rawScenario.policy.system_distribution_cap_pct * 100).toFixed(0)}%</div>
    <div><strong>Split:</strong> M {rawScenario.policy.missions_pct} / P {rawScenario.policy.participants_pct} / A {rawScenario.policy.affiliates_pct} / R {rawScenario.policy.reserve_pct}</div>
  </div>
</div>

{/* Delta card */}
{!isBaseline && showDelta && (
  <div style={{ border: "1px dashed rgba(0,0,0,0.25)", borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 13 }}>
    <div style={{ fontWeight: 800, marginBottom: 6 }}>Δ vs Kickstart / Proof</div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8 }}>
      <div><strong>Δ Surplus Total:</strong> {deltaSurplus.toLocaleString()}</div>
      <div><strong>Δ Missions Funded:</strong> {deltaMissions.toLocaleString()}</div>
      <div><strong>Δ Treasury:</strong> {deltaTreasury.toLocaleString()}</div>
    </div>
  </div>
)}

{/* Charts */}
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 16 }}>
  <LineChartCard title="Price" data={chartData} xKey="month" yKey="price_usd" valuePrefix="$" />
  <LineChartCard title="Surplus Total" data={chartData} xKey="month" yKey="surplus_total_usdc" valuePrefix="$" />
  <LineChartCard title="Missions Funded To Date" data={chartData} xKey="month" yKey="missions_funded_to_date_usdc" valuePrefix="$" />
</div>



      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">SeedSIM Studio</h1>
        <p className="text-sm text-gray-600">
          Cockpit demo (v1): deterministic engine + explainable math. No yield promises.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border p-4">
          <div className="text-xs text-gray-500">Vault Principal (SeedKeys)</div>
          <div className="text-xl font-semibold">{money(last.vault_principal_usdc)}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-xs text-gray-500">Vault GiverKey</div>
          <div className="text-xl font-semibold">{money(last.vault_giverkey_usdc)}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-xs text-gray-500">Surplus Total</div>
          <div className="text-xl font-semibold">{money(last.surplus_total_usdc)}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-xs text-gray-500">Missions Funded (to date)</div>
          <div className="text-xl font-semibold">{money(last.missions_funded_to_date_usdc)}</div>
        </div>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="text-lg font-semibold mb-3">Monthly Outputs (preview)</h2>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
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
              {result.months.map((m) => (
                <tr key={m.month} className="border-b">
                  <td className="py-2 pr-4">{m.month}</td>
                  <td className="py-2 pr-4">${m.price_usd.toFixed(4)}</td>
                  <td className="py-2 pr-4">{money(m.surplus_total_usdc)}</td>
                  <td className="py-2 pr-4">{money(m.treasury_usdc)}</td>
                  <td className="py-2 pr-4">{money(m.pool_missions_usdc)}</td>
                  <td className="py-2 pr-4">{money(m.pool_participants_usdc)}</td>
                  <td className="py-2 pr-4">{money(m.pool_affiliates_usdc)}</td>
                  <td className="py-2 pr-4">{money(m.pool_reserve_usdc)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="text-lg font-semibold mb-3">Explain the Math</h2>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          {result.explain.map((e, idx) => (
            <li key={idx}>
              <span className="font-semibold">{e.step}:</span> {e.detail}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
