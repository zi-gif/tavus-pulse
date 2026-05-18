"use client";

import { CustomerAccount } from "@/data/metrics";
import { formatCompact, formatCurrencyCompact, formatPercent } from "@/lib/format";
import Link from "next/link";

type Props = { accounts: CustomerAccount[] };

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const w = 96;
  const h = 22;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#140206" : "#ff6183"}
        strokeWidth={1.4}
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

export function TopAccounts({ accounts }: Props) {
  const top5 = accounts.slice(0, 5);

  return (
    <section className="card">
      <div className="flex items-center justify-between border-b border-ink px-6 py-3.5">
        <div className="label flex items-center gap-2.5">
          <span className="bullet-only" />
          Top accounts
        </div>
        <Link href="/customer-health" className="label text-ink-soft hover:text-ink">
          All customers →
        </Link>
      </div>
      <table className="w-full table-fixed">
        <thead className="border-b-[1.5px] border-ink">
          <tr className="text-left label">
            <th className="w-[26%] px-6 py-3 font-medium">Account</th>
            <th className="w-[10%] px-3 py-3 font-medium">Tier</th>
            <th className="w-[16%] px-3 py-3 font-medium text-right">Minutes MTD</th>
            <th className="w-[12%] px-3 py-3 font-medium text-right">Spend MTD</th>
            <th className="w-[12%] px-3 py-3 font-medium text-right">WoW</th>
            <th className="w-[14%] px-3 py-3 font-medium">30-day</th>
            <th className="w-[10%] px-3 py-3 font-medium">Renewal</th>
          </tr>
        </thead>
        <tbody>
          {top5.map((c) => (
            <tr key={c.id} className="border-t border-line-soft hover:bg-paper-2">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="mono text-[14px] font-medium text-ink">{c.name}</span>
                  {c.isPublic && (
                    <span className="label text-[8px] px-1.5 py-[2px] border border-ink bg-paper-3">
                      Public
                    </span>
                  )}
                </div>
                <div className="mono text-[11px] text-ink-mute mt-1">{c.vertical}</div>
              </td>
              <td className="px-3 py-4 mono text-[12px] text-ink-soft uppercase tracking-wider">{c.tier}</td>
              <td className="px-3 py-4 text-right mono tabular text-[14px] text-ink">{formatCompact(c.minutesMTD, 1)}</td>
              <td className="px-3 py-4 text-right mono tabular text-[14px] text-ink">{formatCurrencyCompact(c.spendMTD, 1)}</td>
              <td className={`px-3 py-4 text-right mono tabular text-[14px] ${c.wowChange >= 0 ? "text-ink" : "text-warn"}`}>
                <span className="inline-flex items-center gap-1.5">
                  <span className={`inline-block h-[6px] w-[6px] ${c.wowChange >= 0 ? "bg-pulse" : "bg-warn"}`} />
                  {formatPercent(c.wowChange, 1)}
                </span>
              </td>
              <td className="px-3 py-4">
                <Sparkline data={c.history.slice(-30)} positive={c.wowChange >= 0} />
              </td>
              <td className={`px-3 py-4 mono tabular text-[12px] ${
                c.renewalInDays <= 30
                  ? c.churnRisk === "At Risk" ? "text-warn" : "text-ink"
                  : "text-ink-mute"
              }`}>
                {c.renewalInDays}d
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
