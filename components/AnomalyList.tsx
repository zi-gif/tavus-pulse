import { customers } from "@/data/metrics";

export function AnomalyList() {
  const items: { label: string; severity: "warn" | "watch" | "info"; detail: string }[] = [];

  for (const c of customers) {
    if (c.renewalInDays <= 30 && (c.churnRisk === "At Risk" || c.churnRisk === "Watch")) {
      items.push({
        severity: c.churnRisk === "At Risk" ? "warn" : "watch",
        label: c.name + " renewal in " + c.renewalInDays + " days",
        detail: c.churnRisk + " churn risk, NDR " + c.ndr.toFixed(2) + ". " + c.notes,
      });
    }
  }
  for (const c of customers.slice(0, 8)) {
    if (Math.abs(c.wowChange) > 0.18 && c.renewalInDays > 30) {
      items.push({
        severity: c.wowChange > 0 ? "info" : "watch",
        label: c.name + (c.wowChange > 0 ? " spiking" : " softening"),
        detail: (c.wowChange * 100).toFixed(0) + "% week-over-week. " + c.notes,
      });
    }
  }

  const top = items.slice(0, 5);

  return (
    <section className="card h-full">
      <div className="border-b border-ink px-5 py-3.5 label flex items-center gap-2.5">
        <span className="bullet-only" />
        Anomalies
      </div>
      <ul className="flex flex-col">
        {top.map((item, i) => (
          <li key={i} className="flex gap-3 border-b border-line-soft px-5 py-3.5 last:border-b-0">
            <span
              className={`mt-[6px] inline-block h-[8px] w-[8px] shrink-0 ${
                item.severity === "warn"
                  ? "bg-warn"
                  : item.severity === "watch"
                    ? "bg-ink"
                    : "bg-pulse"
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="mono text-[12.5px] font-medium text-ink leading-snug">{item.label}</div>
              <div className="mono text-[11.5px] text-ink-soft leading-snug mt-1">{item.detail}</div>
            </div>
          </li>
        ))}
        {top.length === 0 && (
          <li className="mono text-[12px] text-ink-mute px-5 py-4">No anomalies above threshold.</li>
        )}
      </ul>
    </section>
  );
}
