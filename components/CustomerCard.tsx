"use client";

import { useState } from "react";
import { CustomerAccount } from "@/data/metrics";
import { formatCompact, formatCurrencyCompact, formatPercent } from "@/lib/format";

function BigSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const w = 560;
  const h = 90;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 10) - 5;
    return [x, y] as const;
  });
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const fill = `0,${h} ${line} ${w},${h}`;
  const color = positive ? "#140206" : "#ff6183";
  const fillColor = positive ? "#140206" : "#ff6183";

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="overflow-visible">
      <defs>
        <linearGradient id={`sparkFill-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} stopOpacity={0.14} />
          <stop offset="100%" stopColor={fillColor} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={fill} fill={`url(#sparkFill-${positive})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}

export function CustomerCard({ account }: { account: CustomerAccount }) {
  const [oneLiner, setOneLiner] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const momChange = (account.minutesMTD - account.minutesPrevMonth) / account.minutesPrevMonth;

  async function fetchOneLiner() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: account.id }),
      });
      if (!res.ok) {
        if (res.status === 429) setError("Rate limit reached for today.");
        else setError("Summary unavailable.");
        return;
      }
      const data = await res.json();
      setOneLiner(data.oneLiner);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-3 gap-7">
      <div className="col-span-2 flex flex-col gap-5">
        <div className="card-flat px-5 py-4">
          <div className="flex items-center justify-between mb-3 label">
            <div className="flex items-center gap-2.5">
              <span className="bullet-only" />
              90-day minutes
            </div>
            <span className="mono tabular text-ink-soft text-[10px]">
              PEAK {formatCompact(Math.max(...account.history))}
            </span>
          </div>
          <BigSparkline data={account.history} positive={account.wowChange >= 0} />
        </div>

        <div className="card-flat px-5 py-4 bg-paper-2">
          <div className="flex items-center justify-between mb-2.5">
            <div className="label flex items-center gap-2.5">
              <span className="bullet-only" />
              Summary
            </div>
            {!oneLiner && !loading && (
              <button
                onClick={fetchOneLiner}
                className="btn-ghost px-3 py-1 text-[10px]"
              >
                Generate
              </button>
            )}
          </div>
          {loading && <div className="mono text-[13px] text-ink-soft caret">Reading account history</div>}
          {error && <div className="mono text-[13px] text-warn">{error}</div>}
          {oneLiner && (
            <p className="serif text-[16px] leading-relaxed text-ink">{oneLiner}</p>
          )}
          {!loading && !error && !oneLiner && (
            <p className="mono text-[12px] text-ink-mute">Click Generate.</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="card-flat px-4 py-3.5">
          <div className="label text-ink-soft">MoM Change</div>
          <div className="mono tabular text-[26px] font-medium text-ink mt-1.5 leading-none flex items-baseline gap-2">
            <span className={`inline-block h-[8px] w-[8px] ${momChange >= 0 ? "bg-pulse" : "bg-warn"}`} />
            <span className={momChange >= 0 ? "text-ink" : "text-warn"}>{formatPercent(momChange, 1)}</span>
          </div>
          <div className="mono tabular text-ink-mute text-[10.5px] mt-1.5 uppercase tracking-wider">
            {formatCompact(account.minutesMTD)} vs {formatCompact(account.minutesPrevMonth)}
          </div>
        </div>
        <Stat label="Spend MTD" value={formatCurrencyCompact(account.spendMTD, 1)} />
        <Stat label="Net Dollar Retention" value={account.ndr.toFixed(2)} />
        <Stat label="Renewal" value={`${account.renewalInDays} days`} accent={account.renewalInDays <= 30} />
        <Stat label="Owner" value={account.ownerInitials} />
        <div className="card-flat px-4 py-3.5">
          <div className="label text-ink-soft">Notes</div>
          <p className="mt-2 mono text-[11.5px] leading-relaxed text-ink">{account.notes}</p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card-flat px-4 py-3 flex items-baseline justify-between">
      <span className="label text-ink-soft">{label}</span>
      <span className={`mono tabular text-[15px] font-medium ${accent ? "text-warn" : "text-ink"}`}>{value}</span>
    </div>
  );
}
