"use client";

import { useState } from "react";

export function MorningBriefing() {
  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);

  async function generate() {
    setHasRun(true);
    setError(null);
    setText("");
    setStreaming(true);
    try {
      const res = await fetch("/api/briefing", { method: "POST" });
      if (!res.ok) {
        if (res.status === 429) setError("Rate limit reached for today (10 generations per IP).");
        else setError("Briefing unavailable. " + (await res.text()).slice(0, 120));
        setStreaming(false);
        return;
      }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value);
        setText(acc);
      }
      setStreaming(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      setStreaming(false);
    }
  }

  return (
    <section className="card-warm px-9 py-8 rise rise-1">
      <div className="flex items-center justify-between border-b border-ink pb-3 mb-6">
        <div className="flex items-center gap-3 label">
          <span
            className={`inline-block h-[7px] w-[7px] ${streaming ? "bg-warn pulse-dot" : hasRun && !error ? "bg-pulse" : "bg-ink"}`}
          />
          Briefing
        </div>
        <div className="flex items-center gap-4">
          <span className="label tabular text-ink-soft">
            {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toUpperCase()}
          </span>
          {hasRun && !streaming && (
            <button onClick={generate} className="btn-ghost px-3 py-1.5 text-[10px]">
              Regenerate
            </button>
          )}
        </div>
      </div>

      {error ? (
        <div className="flex items-center justify-between gap-6">
          <p className="mono text-[13px] text-warn">{error}</p>
          <button onClick={generate} className="btn-ghost px-4 py-2 text-[11px] shrink-0">Retry</button>
        </div>
      ) : !hasRun ? (
        <div className="flex items-center justify-between gap-8">
          <p className="serif text-[24px] leading-[1.3] text-ink-soft max-w-2xl">
            Three sentences on what changed overnight, what's anomalous, and the first thing to do today.
          </p>
          <button onClick={generate} className="cta-pink px-5 py-2.5 text-[11px] font-bold shrink-0">
            Generate Briefing →
          </button>
        </div>
      ) : (
        <p className={`serif text-[30px] leading-[1.32] text-ink ${streaming ? "caret" : ""}`}>
          {text || <span className="text-ink-mute">Reading the dashboard.</span>}
        </p>
      )}
    </section>
  );
}
