import { MorningBriefing } from "@/components/MorningBriefing";
import { HeroMetric } from "@/components/HeroMetric";
import { TopAccounts } from "@/components/TopAccounts";
import { AnomalyList } from "@/components/AnomalyList";
import { customers, sevenDayAvg, today, yesterday, arrRunRate, thirtyDayMinutes, TODAY_ISO } from "@/data/metrics";
import { formatCompact, formatCurrencyCompact } from "@/lib/format";

export default function DailyPulsePage() {
  const t = today();
  const y = yesterday();
  const sevenDay = sevenDayAvg("minutes");
  const sevenDayDau = sevenDayAvg("dau");

  const minutesPerSecond = t.minutes / 86400;
  const minutesDelta = (t.minutes - sevenDay) / sevenDay;
  const dauDelta = (t.dau - sevenDayDau) / sevenDayDau;

  const arr = arrRunRate();
  const mtdMinutes = thirtyDayMinutes();

  const datasetDate = new Date(TODAY_ISO + "T12:00:00Z");
  const dayLabel = datasetDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-[1fr_auto] gap-10 items-end">
        <div className="rise rise-1">
          <div className="label flex items-center gap-2.5 text-ink-soft">
            <span className="bullet-only" />
            {dayLabel}
          </div>
          <h1 className="serif text-[64px] leading-[0.95] tracking-[-0.022em] text-ink mt-4">
            Daily Pulse
          </h1>
        </div>

        <div className="flex items-stretch gap-4 rise rise-2">
          <div className="card-flat px-5 py-3.5 min-w-[140px]">
            <div className="label text-ink-soft">ARR run rate</div>
            <div className="mono tabular text-[22px] text-ink mt-1.5 font-medium leading-none">{formatCurrencyCompact(arr, 1)}</div>
          </div>
          <div className="card-flat px-5 py-3.5 min-w-[140px]">
            <div className="label text-ink-soft">CVI mins, 30d</div>
            <div className="mono tabular text-[22px] text-ink mt-1.5 font-medium leading-none">{formatCompact(mtdMinutes, 1)}</div>
          </div>
        </div>
      </div>

      <MorningBriefing />

      <section className="card rise rise-2 grid grid-cols-4">
        <HeroMetric
          label="Conversation Minutes Today"
          value={t.minutes}
          format="compact"
          delta={{ value: minutesDelta, positive: minutesDelta >= 0 }}
          ticker
          perSecondRate={minutesPerSecond * 4}
        />
        <HeroMetric
          label="CVI Latency P95"
          value={t.latencyP95}
          format="ms"
          target={{ value: 500, label: "<500ms" }}
          sublabel={"P50 " + t.latencyP50 + " · P99 " + t.latencyP99}
        />
        <HeroMetric
          label="Phoenix-4 FPS, 1080p"
          value={t.fps}
          format="fps"
          target={{ value: 40, label: "40 FPS" }}
          sublabel={"ERR " + (t.errorRate * 100).toFixed(2) + "%"}
        />
        <HeroMetric
          label="Active Developers"
          value={t.dau}
          format="number"
          delta={{ value: dauDelta, positive: dauDelta >= 0 }}
          sublabel={t.signups + " signups today"}
        />
      </section>

      <div className="grid grid-cols-3 gap-8 rise rise-3">
        <div className="col-span-2">
          <TopAccounts accounts={customers} />
        </div>
        <AnomalyList />
      </div>
    </div>
  );
}
