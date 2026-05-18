"use client";

import { useMemo, useState } from "react";
import { CustomerAccount } from "@/data/metrics";
import { formatCompact, formatCurrencyCompact, formatPercent } from "@/lib/format";
import { CustomerCard } from "./CustomerCard";

type SortKey = "minutesMTD" | "spendMTD" | "wowChange" | "renewalInDays" | "ndr";

export function CustomerTable({ accounts }: { accounts: CustomerAccount[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("minutesMTD");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [filter, setFilter] = useState<"all" | "watch" | "public">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const filtered = accounts.filter((a) => {
      if (filter === "watch") return a.churnRisk !== "Low";
      if (filter === "public") return a.isPublic;
      return true;
    });
    const dir = sortDir === "desc" ? -1 : 1;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] as number;
      const bv = b[sortKey] as number;
      return (av - bv) * dir;
    });
  }, [accounts, sortKey, sortDir, filter]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const arrow = (key: SortKey) => (sortKey === key ? (sortDir === "desc" ? "↓" : "↑") : "");

  const filters: { id: typeof filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "watch", label: "Watch + At Risk" },
    { id: "public", label: "Public" },
  ];

  return (
    <section className="card">
      <div className="flex items-center justify-between border-b border-ink px-6 py-4">
        <div className="flex items-center gap-3 label">
          <span className="bullet-only" />
          {sorted.length} of {accounts.length} accounts
        </div>
        <div className="flex items-stretch border border-ink">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-1.5 label border-r border-ink last:border-r-0 transition-colors ${
                filter === f.id ? "bg-ink text-paper" : "bg-paper hover:bg-paper-3 text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <table className="w-full">
        <thead className="border-b-[1.5px] border-ink">
          <tr className="text-left label">
            <th className="w-[22%] px-6 py-3 font-medium">Account</th>
            <th className="w-[10%] px-3 py-3 font-medium">Tier</th>
            <SortHeader label="Minutes MTD" active={sortKey === "minutesMTD"} arrow={arrow("minutesMTD")} onClick={() => toggleSort("minutesMTD")} />
            <SortHeader label="Spend MTD" active={sortKey === "spendMTD"} arrow={arrow("spendMTD")} onClick={() => toggleSort("spendMTD")} />
            <SortHeader label="WoW" active={sortKey === "wowChange"} arrow={arrow("wowChange")} onClick={() => toggleSort("wowChange")} />
            <SortHeader label="NDR" active={sortKey === "ndr"} arrow={arrow("ndr")} onClick={() => toggleSort("ndr")} />
            <SortHeader label="Renewal" active={sortKey === "renewalInDays"} arrow={arrow("renewalInDays")} onClick={() => toggleSort("renewalInDays")} />
            <th className="w-[10%] px-3 py-3 font-medium">Risk</th>
            <th className="w-[3%]" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((c) => (
            <CustomerRow
              key={c.id}
              account={c}
              expanded={expanded === c.id}
              onToggle={() => setExpanded(expanded === c.id ? null : c.id)}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
}

function SortHeader({ label, active, arrow, onClick }: { label: string; active: boolean; arrow: string; onClick: () => void }) {
  return (
    <th className="px-3 py-3 font-medium text-right">
      <button
        onClick={onClick}
        className={`label tabular ${active ? "text-ink" : "text-ink-soft hover:text-ink"}`}
      >
        {label} {arrow}
      </button>
    </th>
  );
}

function CustomerRow({ account, expanded, onToggle }: { account: CustomerAccount; expanded: boolean; onToggle: () => void }) {
  const c = account;
  const riskColor =
    c.churnRisk === "At Risk"
      ? "text-warn"
      : c.churnRisk === "Watch"
        ? "text-ink"
        : "text-ink-mute";
  const riskBullet =
    c.churnRisk === "At Risk"
      ? "bg-warn"
      : c.churnRisk === "Watch"
        ? "bg-ink"
        : "bg-paper-4";

  return (
    <>
      <tr
        className={`border-t border-line-soft transition-colors cursor-pointer ${expanded ? "bg-paper-2" : "hover:bg-paper-2"}`}
        onClick={onToggle}
      >
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="mono text-[14px] font-medium text-ink">{c.name}</span>
            {c.isPublic && (
              <span className="label text-[8px] px-1.5 py-[2px] border border-ink bg-paper">
                Public
              </span>
            )}
          </div>
          <div className="mono text-[11px] text-ink-mute mt-1">{c.vertical}</div>
        </td>
        <td className="px-3 py-4 mono text-[12px] uppercase tracking-wider text-ink-soft">{c.tier}</td>
        <td className="px-3 py-4 text-right mono tabular text-[14px] text-ink">{formatCompact(c.minutesMTD, 1)}</td>
        <td className="px-3 py-4 text-right mono tabular text-[14px] text-ink">{formatCurrencyCompact(c.spendMTD, 1)}</td>
        <td className={`px-3 py-4 text-right mono tabular text-[14px] ${c.wowChange >= 0 ? "text-ink" : "text-warn"}`}>
          <span className="inline-flex items-center gap-1.5">
            <span className={`inline-block h-[6px] w-[6px] ${c.wowChange >= 0 ? "bg-pulse" : "bg-warn"}`} />
            {formatPercent(c.wowChange, 1)}
          </span>
        </td>
        <td className="px-3 py-4 text-right mono tabular text-[14px] text-ink-soft">{c.ndr.toFixed(2)}</td>
        <td className="px-3 py-4 text-right mono tabular text-[14px] text-ink-soft">{c.renewalInDays}d</td>
        <td className={`px-3 py-4 ${riskColor}`}>
          <span className="inline-flex items-center gap-2 label">
            <span className={`inline-block h-[7px] w-[7px] ${riskBullet}`} />
            {c.churnRisk}
          </span>
        </td>
        <td className="px-3 py-4 mono text-ink-mute text-[14px]">{expanded ? "▴" : "▾"}</td>
      </tr>
      {expanded && (
        <tr className="bg-paper-2">
          <td colSpan={9} className="px-8 py-7 border-t border-ink">
            <CustomerCard account={c} />
          </td>
        </tr>
      )}
    </>
  );
}
