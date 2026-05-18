"use client";

import { useEffect, useState } from "react";

export function MorningBriefing() {
  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cacheKey = "tavus-pulse:briefing:" + new Date().toISOString().slice(0, 10);
    const cached = typeof window !== "undefined" ? sessionStorage.getItem(cacheKey) : null;
    if (cached) {
      setText(cached);
      setStreaming(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/briefing", { method: "POST" });
        if (!res.ok) {
          if (res.status === 429) {
            setError("Rate limit reached for today (10 generations per IP).");
          } else {
            setError("Briefing unavailable. " + (await res.text()).slice(0, 120));
          }
          setStreaming(false);
          return;
        }
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (cancelled) return;
          acc += decoder.decode(value);
          setText(acc);
        }
        setStreaming(false);
        sessionStorage.setItem(cacheKey, acc);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Network error");
          setStreaming(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="card-warm px-9 py-8 rise rise-1">
      <div className="flex items-center justify-between border-b border-ink pb-3 mb-6">
        <div className="flex items-center gap-3 label">
          <span className={`inline-block h-[7px] w-[7px] ${streaming ? "bg-warn pulse-dot" : "bg-ink"}`} />
          Briefing
        </div>
        <span className="label tabular text-ink-soft">
          {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toUpperCase()}
        </span>
      </div>

      {error ? (
        <p className="mono text-[13px] text-warn">{error}</p>
      ) : (
        <p className={`serif text-[30px] leading-[1.32] text-ink ${streaming ? "caret" : ""}`}>
          {text || <span className="text-ink-mute">Reading the dashboard.</span>}
        </p>
      )}
    </section>
  );
}
