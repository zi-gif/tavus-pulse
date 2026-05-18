import { ChartCard } from "@/components/ChartCard";
import { CostPerMinuteChart } from "@/components/charts/CostPerMinuteChart";
import { GMByTierChart } from "@/components/charts/GMByTierChart";
import { SqueezeChart } from "@/components/charts/SqueezeChart";
import { TierMixChart } from "@/components/charts/TierMixChart";
import { costStructure, tierMix, todayCost, PHOENIX_4_LAUNCH_DAYS_AGO } from "@/data/metrics";
import { formatPercent } from "@/lib/format";

export default function UnitEconomicsPage() {
  const today = todayCost();
  const ninetyDaysAgo = costStructure.find((c) => c.daysAgo === 89)!;
  const costDelta = (today.costPerMinute - ninetyDaysAgo.costPerMinute) / ninetyDaysAgo.costPerMinute;
  const gmDelta = today.grossMargin - ninetyDaysAgo.grossMargin;
  const marginPerMinuteCents = (today.pricePerMinute - today.costPerMinute) * 100;

  const todayMix = tierMix.find((t) => t.daysAgo === 0)!;
  const ninetyMix = tierMix.find((t) => t.daysAgo === 89)!;
  const enterpriseTodayShare = todayMix.enterpriseRevenue / (todayMix.starterRevenue + todayMix.growthRevenue + todayMix.enterpriseRevenue);
  const enterprise90Share = ninetyMix.enterpriseRevenue / (ninetyMix.starterRevenue + ninetyMix.growthRevenue + ninetyMix.enterpriseRevenue);
  const enterpriseShift = enterpriseTodayShare - enterprise90Share;

  return (
    <div className="flex flex-col gap-10">
      <div className="rise rise-1">
        <div className="label flex items-center gap-2.5 text-ink-soft">
          <span className="bullet-only" />
          Unit economics
        </div>
        <h1 className="serif text-[64px] leading-[0.95] tracking-[-0.022em] text-ink mt-4">
          The <em className="serif-italic">margin</em> story
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-7 rise rise-2">
        <ChartCard
          label="Inference cost"
          title="Cost per conversation minute, 90 days"
          headlineValue={`${(today.costPerMinute * 100).toFixed(2)}¢`}
          headlineDelta={{ label: `${formatPercent(costDelta, 1)} vs 90d`, positive: costDelta < 0 }}
        >
          <CostPerMinuteChart data={costStructure} phoenixDaysAgo={PHOENIX_4_LAUNCH_DAYS_AGO} />
        </ChartCard>

        <ChartCard
          label="Tier margin"
          title="Gross margin by tier"
          headlineValue={`${(today.grossMargin * 100).toFixed(1)}%`}
          headlineDelta={{ label: `Blended, +${(gmDelta * 100).toFixed(1)} pts vs 90d`, positive: gmDelta > 0 }}
        >
          <GMByTierChart costPerMinute={today.costPerMinute} />
        </ChartCard>
      </div>

      <div className="rise rise-3">
        <ChartCard
          label="The Squeeze"
          title="Inference cost vs blended price per minute"
          headlineValue={`${marginPerMinuteCents.toFixed(1)}¢`}
          headlineDelta={{ label: "Margin per minute", positive: true }}
        >
          <SqueezeChart data={costStructure} phoenixDaysAgo={PHOENIX_4_LAUNCH_DAYS_AGO} />
        </ChartCard>
      </div>

      <div className="rise rise-4">
        <ChartCard
          label="Tier mix"
          title="Revenue mix shift, 90 days"
          headlineValue={`${(enterpriseTodayShare * 100).toFixed(1)}%`}
          headlineDelta={{ label: `Enterprise, ${enterpriseShift >= 0 ? "+" : ""}${(enterpriseShift * 100).toFixed(1)} pts`, positive: enterpriseShift > 0 }}
        >
          <TierMixChart data={tierMix} />
        </ChartCard>
      </div>
    </div>
  );
}
