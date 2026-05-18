"use client";

import { useEffect, useState } from "react";
import { formatCompact, formatNumber, formatPercent } from "@/lib/format";

type Props = {
  label: string;
  value: number;
  format?: "compact" | "number" | "ms" | "fps";
  delta?: { value: number; positive: boolean };
  target?: { value: number; label: string };
  sublabel?: string;
  ticker?: boolean;
  perSecondRate?: number;
};

function formatValue(v: number, fmt: Props["format"]): string {
  if (fmt === "ms") return Math.round(v) + "ms";
  if (fmt === "fps") return v.toFixed(1);
  if (fmt === "compact") return formatCompact(v, 1);
  return formatNumber(Math.round(v));
}

export function HeroMetric({ label, value, format = "number", delta, target, sublabel, ticker, perSecondRate }: Props) {
  const [display, setDisplay] = useState(value);
  const [glow, setGlow] = useState(false);

  useEffect(() => {
    if (!ticker || !perSecondRate) return;
    const id = setInterval(() => {
      setDisplay((d) => d + perSecondRate);
      setGlow(true);
      setTimeout(() => setGlow(false), 650);
    }, 4000);
    return () => clearInterval(id);
  }, [ticker, perSecondRate]);

  const overTarget = target ? display > target.value : false;
  const isLatency = label.toLowerCase().includes("latency");
  const targetGood = target ? (isLatency ? !overTarget : overTarget) : true;

  return (
    <div className="flex flex-col gap-3 border-r border-ink px-7 py-6 last:border-r-0">
      <div className="label text-ink">{label}</div>
      <div className="flex items-baseline">
        <span className={`mono tabular text-[46px] font-medium leading-none tracking-[-0.02em] text-ink ${glow ? "ticker-glow" : ""}`}>
          {formatValue(display, format)}
        </span>
      </div>
      <div className="flex items-center gap-3 mono text-[11px] tabular tracking-wide text-ink-soft">
        {delta && (
          <span className={`inline-flex items-center gap-1.5 ${delta.positive ? "text-ink" : "text-warn"}`}>
            <span className={`inline-block h-[6px] w-[6px] ${delta.positive ? "bg-pulse" : "bg-warn"}`} />
            {formatPercent(delta.value, 1)} VS 7D
          </span>
        )}
        {target && (
          <span className={`uppercase ${targetGood ? "text-ink-soft" : "text-warn"}`}>
            TGT {target.label}
          </span>
        )}
        {sublabel && <span className="uppercase text-ink-mute">{sublabel}</span>}
      </div>
    </div>
  );
}
