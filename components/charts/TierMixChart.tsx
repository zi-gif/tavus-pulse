"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TierMixSnapshot } from "@/data/metrics";

const TOOLTIP_STYLE = {
  background: "#f7f4ef",
  border: "1.5px solid #140206",
  borderRadius: 0,
  boxShadow: "3px 3px 0 #140206",
  color: "#140206",
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  padding: "8px 10px",
};

export function TierMixChart({ data }: { data: TierMixSnapshot[] }) {
  const chartData = [...data].sort((a, b) => a.daysAgo - b.daysAgo).reverse().map((d) => {
    const total = d.starterRevenue + d.growthRevenue + d.enterpriseRevenue;
    return {
      date: d.date.slice(5),
      Starter: +((d.starterRevenue / total) * 100).toFixed(1),
      Growth: +((d.growthRevenue / total) * 100).toFixed(1),
      Enterprise: +((d.enterpriseRevenue / total) * 100).toFixed(1),
    };
  });

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={chartData} margin={{ top: 12, right: 20, bottom: 8, left: 0 }} stackOffset="expand">
        <CartesianGrid strokeDasharray="0" vertical={false} />
        <XAxis dataKey="date" interval={14} tickLine={false} axisLine={{ stroke: "#140206" }} />
        <YAxis
          tickFormatter={(v) => `${Math.round(v * 100)}%`}
          tickLine={false}
          axisLine={{ stroke: "#140206" }}
          width={42}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
        />
        <Area type="monotone" dataKey="Starter" stackId="1" stroke="#140206" strokeWidth={1.2} fill="#c9bdaa" />
        <Area type="monotone" dataKey="Growth" stackId="1" stroke="#140206" strokeWidth={1.2} fill="#5a4347" />
        <Area type="monotone" dataKey="Enterprise" stackId="1" stroke="#140206" strokeWidth={1.2} fill="#140206" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
