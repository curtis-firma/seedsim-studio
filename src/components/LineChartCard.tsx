"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type Props = {
  title: string;
  data: any[];
  xKey: string;
  yKey: string;
  valuePrefix?: string;
  stroke?: string;
};

function formatCompact(n: unknown) {
  const num = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(num)) return "";
  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(num);
}

export default function LineChartCard({
  title,
  data,
  xKey,
  yKey,
  valuePrefix,
  stroke = "#111827",
}: Props) {
  return (
    <div style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, padding: 16, background: "white", minHeight: 260 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>{title}</div>

      <div style={{ width: "100%", height: 210 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatCompact(v)} />
            <Tooltip formatter={(v: any) => (valuePrefix ? `${valuePrefix}${formatCompact(v)}` : formatCompact(v))} />
            <Line type="monotone" dataKey={yKey} dot={false} strokeWidth={2} stroke={stroke} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
