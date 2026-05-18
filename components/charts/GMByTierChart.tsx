"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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

export function GMByTierChart({ costPerMinute }: { costPerMinute: number }) {
  const tiers = [
    { tier: "Starter", price: 0.36, color: "#c9bdaa" },
    { tier: "Growth", price: 0.30, color: "#5a4347" },
    { tier: "Enterprise", price: 0.24, color: "#140206" },
  ];
  const data = tiers.map((t) => ({
    tier: t.tier,
    margin: +(((t.price - costPerMinute) / t.price) * 100).toFixed(1),
    cost: costPerMinute,
    price: t.price,
    color: t.color,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 16, right: 20, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="0" vertical={false} />
        <XAxis dataKey="tier" tickLine={false} axisLine={{ stroke: "#140206" }} />
        <YAxis
          tickFormatter={(v) => `${v}%`}
          domain={[0, 100]}
          tickLine={false}
          axisLine={{ stroke: "#140206" }}
          width={42}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          cursor={{ fill: "rgba(20,2,6,0.05)" }}
          formatter={(value: number, _name, item) => {
            const payload = (item as { payload?: { price: number; cost: number } })?.payload;
            const label = payload
              ? `Price $${payload.price.toFixed(2)} / min, cost $${payload.cost.toFixed(3)} / min`
              : "";
            return [`${value.toFixed(1)}% GM`, label];
          }}
        />
        <Bar dataKey="margin" radius={0} stroke="#140206" strokeWidth={1.5}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
