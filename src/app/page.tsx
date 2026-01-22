"use client";

import { useMemo } from "react";
import { runSimulation } from "../engine";
import { defaultScenario } from "../engine/defaultScenario";

function money(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function Page() {
  const result = useMemo(() => runSimulation(defaultScenario), []);

  const last = result.months[result.months.length - 1];

  return (
    <main className="min-h-screen p-6 space-y-6">
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
