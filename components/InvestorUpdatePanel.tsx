"use client";

import { useState } from "react";

type Flag = { severity: "info" | "watch" | "issue"; label: string; detail: string };

export function InvestorUpdatePanel() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setDraft("");
    setFlags([]);
    setSummary("");
    setError(null);
    setStreaming(true);
    try {
      const res = await fetch("/api/investor-update", { method: "POST" });
      if (!res.ok) {
        if (res.status === 429) setError("Rate limit reached for today (10 generations per IP).");
        else setError("Generator unavailable. " + (await res.text()).slice(0, 160));
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
        setDraft(acc);
      }
      setStreaming(false);
      evaluate(acc);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      setStreaming(false);
    }
  }

  async function evaluate(text: string) {
    setEvaluating(true);
    try {
      const res = await fetch("/api/investor-update/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: text }),
      });
      if (!res.ok) {
        setEvaluating(false);
        return;
      }
      const data = await res.json();
      setFlags(data.flags ?? []);
      setSummary(data.summary ?? "");
    } finally {
      setEvaluating(false);
    }
  }

  function copyDraft() {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
          if (!draft) generate();
        }}
        className="cta-pink inline-flex items-center gap-3 px-6 py-3 text-[12px] font-bold"
      >
        Generate Investor Update
        <span className="text-[14px]">→</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-ink/30"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex h-full w-full max-w-[720px] flex-col border-l-[1.5px] border-ink bg-paper"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-[1.5px] border-ink bg-paper-2 px-7 py-4">
              <div className="flex items-center gap-2.5 label">
                <span className="bullet-only" />
                Investor update
              </div>
              <button
                onClick={() => setOpen(false)}
                className="mono text-[14px] text-ink hover:text-warn"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {(flags.length > 0 || evaluating) && (
              <div className="border-b border-ink bg-paper-3 px-7 py-4">
                <div className="flex items-center justify-between mb-3 label">
                  <div className="flex items-center gap-2.5">
                    <span className={`inline-block h-[7px] w-[7px] ${evaluating ? "bg-warn pulse-dot" : "bg-pulse"}`} />
                    Drift check
                  </div>
                  {summary && <span className="label text-ink-soft normal-case tracking-normal">{summary}</span>}
                </div>
                {evaluating && <div className="mono text-[12px] text-ink-soft caret">Evaluator reading the draft</div>}
                {!evaluating && flags.length > 0 && (
                  <ul className="flex flex-col gap-2">
                    {flags.map((f, i) => (
                      <li key={i} className="flex gap-3 mono text-[12px]">
                        <span
                          className={`mt-[5px] inline-block h-[7px] w-[7px] shrink-0 ${
                            f.severity === "issue"
                              ? "bg-warn"
                              : f.severity === "watch"
                                ? "bg-ink"
                                : "bg-pulse"
                          }`}
                        />
                        <span>
                          <span className="text-ink font-medium">{f.label}.</span>{" "}
                          <span className="text-ink-soft">{f.detail}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="thin-scroll flex-1 overflow-y-auto px-9 py-7">
              {error && <p className="mono text-[13px] text-warn">{error}</p>}
              {!error && (
                <div
                  className={`whitespace-pre-wrap serif text-[16.5px] leading-[1.65] text-ink ${streaming ? "caret" : ""}`}
                >
                  {draft || (streaming ? <span className="text-ink-mute">Drafting</span> : null)}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t-[1.5px] border-ink bg-paper-2 px-7 py-4">
              <button
                onClick={generate}
                disabled={streaming}
                className="label text-ink hover:text-warn disabled:opacity-40 flex items-center gap-2"
              >
                <span className="bullet-only" />
                {streaming ? "Drafting" : "Regenerate"}
              </button>
              <button
                onClick={copyDraft}
                disabled={!draft}
                className="btn-ghost px-4 py-2 text-[11px] disabled:opacity-40"
              >
                {copied ? "Copied" : "Copy Draft"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
