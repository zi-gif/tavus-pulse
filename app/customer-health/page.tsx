import { CustomerTable } from "@/components/CustomerTable";
import { customers } from "@/data/metrics";
import { formatCompact, formatCurrencyCompact } from "@/lib/format";

export default function CustomerHealthPage() {
  const total = customers.length;
  const atRisk = customers.filter((c) => c.churnRisk === "At Risk").length;
  const watch = customers.filter((c) => c.churnRisk === "Watch").length;
  const totalMinutes = customers.reduce((a, c) => a + c.minutesMTD, 0);
  const totalSpend = customers.reduce((a, c) => a + c.spendMTD, 0);
  const renewalsSoon = customers.filter((c) => c.renewalInDays <= 30).length;

  return (
    <div className="flex flex-col gap-10">
      <div className="rise rise-1">
        <div className="label flex items-center gap-2.5 text-ink-soft">
          <span className="bullet-only" />
          Customer health
        </div>
        <h1 className="serif text-[64px] leading-[0.95] tracking-[-0.022em] text-ink mt-4">
          {total} <em className="serif-italic">accounts</em>
        </h1>
      </div>

      <div className="grid grid-cols-4 gap-5 rise rise-2">
        <Stat label="Minutes MTD" value={formatCompact(totalMinutes)} />
        <Stat label="Spend MTD" value={formatCurrencyCompact(totalSpend, 1)} />
        <Stat label="Renewals, 30d" value={String(renewalsSoon)} accent={renewalsSoon > 2} />
        <Stat label="Watch + At Risk" value={String(watch + atRisk)} accent={atRisk > 0} />
      </div>

      <div className="rise rise-3">
        <CustomerTable accounts={customers} />
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card-flat px-5 py-4 flex flex-col gap-2.5">
      <div className="label flex items-center gap-2 text-ink-soft">
        <span className={`inline-block h-[7px] w-[7px] ${accent ? "bg-warn" : "bg-ink"}`} />
        {label}
      </div>
      <div className={`mono tabular text-[30px] font-medium leading-none ${accent ? "text-warn" : "text-ink"}`}>{value}</div>
    </div>
  );
}
