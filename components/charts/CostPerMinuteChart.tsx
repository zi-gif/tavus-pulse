"use client";

import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CostSnapshot } from "@/data/metrics";

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

export function CostPerMinuteChart({ data, phoenixDaysAgo }: { data: CostSnapshot[]; phoenixDaysAgo: number }) {
  const chartData = [...data].sort((a, b) => a.daysAgo - b.daysAgo).reverse().map((d) => ({
    date: d.date.slice(5),
    daysAgo: d.daysAgo,
    cost: +(d.costPerMinute * 100).toFixed(2),
  }));
  const phoenixDate = chartData.find((d) => d.daysAgo === phoenixDaysAgo)?.date;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={chartData} margin={{ top: 12, right: 20, bottom: 8, left: 0 }}>
        <defs>
          <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#140206" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#140206" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="0" vertical={false} />
        <XAxis dataKey="date" interval={14} tickLine={false} axisLine={{ stroke: "#140206" }} />
        <YAxis
          tickFormatter={(v) => `${v.toFixed(1)}¢`}
          domain={["dataMin - 0.2", "dataMax + 0.2"]}
          tickLine={false}
          axisLine={{ stroke: "#140206" }}
          width={48}
        />
        {phoenixDate && (
          <ReferenceLine
            x={phoenixDate}
            stroke="#ff6183"
            strokeWidth={1.4}
            strokeDasharray="4 3"
            label={{ value: "▪ PHOENIX-4", position: "top", fill: "#140206", fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600 }}
          />
        )}
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          cursor={{ stroke: "#140206", strokeWidth: 1, strokeDasharray: "2 3" }}
          formatter={(value: number) => [`${value.toFixed(2)}¢ / min`, "Cost"]}
        />
        <Area type="monotone" dataKey="cost" stroke="#140206" strokeWidth={1.8} fill="url(#costGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
