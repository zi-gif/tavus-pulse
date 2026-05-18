"use client";

import { Area, CartesianGrid, ComposedChart, Legend, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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

export function SqueezeChart({ data, phoenixDaysAgo }: { data: CostSnapshot[]; phoenixDaysAgo: number }) {
  const chartData = [...data].sort((a, b) => a.daysAgo - b.daysAgo).reverse().map((d) => ({
    date: d.date.slice(5),
    daysAgo: d.daysAgo,
    cost: +(d.costPerMinute * 100).toFixed(2),
    price: +(d.pricePerMinute * 100).toFixed(2),
    margin: +((d.pricePerMinute - d.costPerMinute) * 100).toFixed(2),
  }));
  const phoenixDate = chartData.find((d) => d.daysAgo === phoenixDaysAgo)?.date;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={chartData} margin={{ top: 18, right: 20, bottom: 8, left: 0 }}>
        <defs>
          <linearGradient id="marginGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff6183" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#ff6183" stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="0" vertical={false} />
        <XAxis dataKey="date" interval={14} tickLine={false} axisLine={{ stroke: "#140206" }} />
        <YAxis
          tickFormatter={(v) => `${v.toFixed(0)}¢`}
          domain={[0, 35]}
          tickLine={false}
          axisLine={{ stroke: "#140206" }}
          width={42}
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
          formatter={(value: number, name: string) => {
            const label = name === "price" ? "Price / min" : name === "cost" ? "Cost / min" : "Margin / min";
            return [`${value.toFixed(2)}¢`, label];
          }}
        />
        <Legend
          verticalAlign="top"
          height={32}
          iconType="rect"
          wrapperStyle={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#140206", textTransform: "uppercase", letterSpacing: "0.16em" }}
          formatter={(name: string) => name === "price" ? "Price / min" : name === "cost" ? "Cost / min" : "Margin"}
        />
        <Area type="monotone" dataKey="margin" stroke="transparent" fill="url(#marginGrad)" />
        <Line type="monotone" dataKey="price" stroke="#140206" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="cost" stroke="#ff6183" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
