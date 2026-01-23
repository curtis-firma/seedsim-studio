import LineChartCard from "../components/LineChartCard";

type ExplainLine = {
  step: string;
  detail: string;
};

type MonthRow = {
  month: number;
  price_usd: number;
  surplus_total_usdc: number;
  treasury_usdc: number;
  pool_missions_usdc: number;
  pool_participants_usdc: number;
  pool_affiliates_usdc: number;
  pool_reserve_usdc: number;
};

type ChartsViewProps = {
  chartData: Array<Record<string, number>>;
  months: MonthRow[];
  explain: ExplainLine[];
  money: (value: number) => string;
};

export default function ChartsView({ chartData, months, explain, money }: ChartsViewProps) {
  return (
    <div className="space-y-6">
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
              {months.map((month) => (
                <tr key={month.month} className="border-t border-slate-100">
                  <td className="py-2 pr-4 font-semibold text-slate-700">
                    {month.month}
                  </td>
                  <td className="py-2 pr-4">${month.price_usd.toFixed(4)}</td>
                  <td className="py-2 pr-4">{money(month.surplus_total_usdc)}</td>
                  <td className="py-2 pr-4">{money(month.treasury_usdc)}</td>
                  <td className="py-2 pr-4">{money(month.pool_missions_usdc)}</td>
                  <td className="py-2 pr-4">
                    {money(month.pool_participants_usdc)}
                  </td>
                  <td className="py-2 pr-4">{money(month.pool_affiliates_usdc)}</td>
                  <td className="py-2 pr-4">{money(month.pool_reserve_usdc)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Explain the Math</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-600">
          {explain.map((line, idx) => (
            <li key={`${line.step}-${idx}`}>
              <span className="font-semibold text-slate-800">{line.step}:</span>{" "}
              {line.detail}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
