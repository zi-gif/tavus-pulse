"use client";

import { useState } from "react";

type Hypothesis = { rank: number; hypothesis: string; check: string };

export function WhyIsThisOff({ metric, context }: { metric: string; context?: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setOpen(true);
    if (hypotheses.length > 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/why", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metric, context }),
      });
      if (!res.ok) {
        if (res.status === 429) setError("Rate limit reached for today.");
        else setError("Hypotheses unavailable.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setHypotheses(data.hypotheses ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={run}
        className="btn-ghost px-3 py-1.5 text-[10px]"
      >
        Why is this off?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-ink/30 p-8"
          onClick={() => setOpen(false)}
        >
          <div
            className="card w-full max-w-[640px] bg-paper"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b-[1.5px] border-ink px-7 py-5">
              <div>
                <div className="label flex items-center gap-2.5">
                  <span className="bullet-only" />
                  Hypotheses
                </div>
                <div className="serif text-[20px] text-ink mt-2 leading-tight">{metric}</div>
              </div>
              <button onClick={() => setOpen(false)} className="mono text-[14px] text-ink hover:text-warn">
                ✕
              </button>
            </div>

            <div className="px-7 py-6">
              {loading && <div className="mono text-[13px] text-ink-soft caret">Reading the dashboard</div>}
              {error && <div className="mono text-[13px] text-warn">{error}</div>}
              {!loading && !error && hypotheses.length > 0 && (
                <ol className="flex flex-col gap-5">
                  {hypotheses.map((h) => (
                    <li key={h.rank} className="flex gap-5">
                      <div className="serif tabular text-[36px] leading-none text-ink shrink-0 w-10">{h.rank}</div>
                      <div className="flex-1">
                        <div className="mono text-[13.5px] text-ink leading-relaxed">{h.hypothesis}</div>
                        <div className="mt-2.5 flex gap-2 items-start">
                          <span className="label text-ink-soft mt-[3px] shrink-0">Check</span>
                          <span className="mono text-[12.5px] text-ink-soft leading-relaxed">{h.check}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
