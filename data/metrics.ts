/**
 * Tavus Pulse seeded metrics.
 *
 * 90 daily snapshots ending "today" (2026-05-17). The dataset is designed to
 * tell a coherent story that a Tavus founder would recognize:
 *
 *   - Phoenix-4 launches mid-window (Feb 18, 2026), driving a step change in
 *     latency (P95 580ms -> sub-500ms) and fps (37 -> 40+).
 *   - Cost per conversation minute declines from $0.16 to $0.11 as inference
 *     gets cheaper, consistent with Hassaan's stated GM focus.
 *   - Minutes grow ~60% over 90 days (~16% MoM), on-thesis for Series B AI infra.
 *   - Tier mix shifts from Starter toward Enterprise.
 *   - Final Round AI dominates consumption (~28% of CVI minutes), Delphi grows
 *     fastest, one fabricated enterprise account flags churn risk.
 *
 * All numbers are fabricated. Real Tavus public customers are seeded with their
 * publicly disclosed footprint; everything else is synthetic.
 */

export const TODAY_ISO = "2026-05-17";
export const WINDOW_DAYS = 90;
export const PHOENIX_4_LAUNCH_DAYS_AGO = 88; // 2026-02-18

// ---------- Seeded RNG (deterministic) ----------

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}
function noise(rng: () => number, amplitude: number) {
  return (rng() - 0.5) * 2 * amplitude;
}

// ---------- Date helpers ----------

function isoDaysAgo(daysAgo: number): string {
  const d = new Date(TODAY_ISO + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}
function weekday(daysAgo: number): number {
  const d = new Date(TODAY_ISO + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.getUTCDay(); // 0 Sun .. 6 Sat
}
function isWeekend(daysAgo: number): boolean {
  const w = weekday(daysAgo);
  return w === 0 || w === 6;
}

// ---------- Types ----------

export type DailySnapshot = {
  date: string;
  daysAgo: number;
  minutes: number;
  videoGenMinutes: number;
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
  fps: number;
  dau: number;
  signups: number;
  errorRate: number;
  replicasCreated: number;
  concurrentPeak: number;
};

export type TierMixSnapshot = {
  date: string;
  daysAgo: number;
  basicCount: number;
  starterRevenue: number;
  growthRevenue: number;
  enterpriseRevenue: number;
};

export type CostSnapshot = {
  date: string;
  daysAgo: number;
  costPerMinute: number;
  pricePerMinute: number;
  grossMargin: number;
};

export type CustomerAccount = {
  id: string;
  name: string;
  isPublic: boolean;
  tier: "Enterprise" | "Growth" | "Starter";
  vertical: string;
  minutesMTD: number;
  minutesPrevMonth: number;
  spendMTD: number;
  spendPrevMonth: number;
  wowChange: number;
  renewalInDays: number;
  ndr: number;
  churnRisk: "Low" | "Watch" | "At Risk";
  ownerInitials: string;
  notes: string;
  history: number[]; // 90 daily minutes, history[0] = oldest, history[89] = today
};

// ---------- Daily metrics ----------

function buildDailyMetrics(): DailySnapshot[] {
  const rng = makeRng(42);
  const out: DailySnapshot[] = [];

  // anchors
  const minutesStart = 178_000;
  const minutesEnd = 292_000;
  const dailyGrowth = Math.exp(Math.log(minutesEnd / minutesStart) / (WINDOW_DAYS - 1)) - 1;

  for (let daysAgo = WINDOW_DAYS - 1; daysAgo >= 0; daysAgo--) {
    const t = WINDOW_DAYS - 1 - daysAgo; // 0..89, 0 = oldest
    const phoenixLive = daysAgo <= PHOENIX_4_LAUNCH_DAYS_AGO;
    const dayOfPhoenix = PHOENIX_4_LAUNCH_DAYS_AGO - daysAgo; // negative pre-launch
    const phoenixMaturity = Math.max(0, Math.min(1, dayOfPhoenix / 70));

    const trendMinutes = minutesStart * Math.pow(1 + dailyGrowth, t);
    const weekendMult = isWeekend(daysAgo) ? 0.78 : 1.0;
    const burstMult =
      daysAgo === 21 ? 1.32 : // Final Round AI April hiring-season spike
      daysAgo === 47 ? 1.18 : // Delphi product launch
      daysAgo === 9 ? 1.11 : // recent customer expansion
      1.0;
    const minutes = Math.round(trendMinutes * weekendMult * burstMult * (1 + noise(rng, 0.04)));

    const videoGenMinutes = Math.round(minutes * 0.18 * (1 + noise(rng, 0.08)));

    // Latency: pre-Phoenix ~580/950/1300, post-Phoenix glides to 420/485/620
    const latencyP50Pre = 380;
    const latencyP50Post = 280 + (1 - phoenixMaturity) * 60;
    const latencyP95Pre = 580 + noise(rng, 25);
    const latencyP95Post = 425 + (1 - phoenixMaturity) * 70 + noise(rng, 12);
    const latencyP99Pre = 1280 + noise(rng, 60);
    const latencyP99Post = 620 + (1 - phoenixMaturity) * 130 + noise(rng, 30);

    const latencyP50 = Math.round(phoenixLive ? latencyP50Post + noise(rng, 8) : latencyP50Pre + noise(rng, 14));
    const latencyP95 = Math.round(phoenixLive ? latencyP95Post : latencyP95Pre);
    const latencyP99 = Math.round(phoenixLive ? latencyP99Post : latencyP99Pre);

    // FPS: pre 37, post climbs to 40.5
    const fps = +(
      phoenixLive
        ? 39.2 + phoenixMaturity * 1.4 + noise(rng, 0.25)
        : 37.0 + noise(rng, 0.4)
    ).toFixed(1);

    // DAU grows roughly with minutes but smoother
    const dauStart = 2_080;
    const dauEnd = 3_420;
    const dauTrend = dauStart + (dauEnd - dauStart) * (t / (WINDOW_DAYS - 1));
    const dau = Math.round(dauTrend * weekendMult * (1 + noise(rng, 0.025)));

    const signupsBase = 78 + t * 0.6;
    const signups = Math.round(signupsBase * (isWeekend(daysAgo) ? 0.55 : 1) * (1 + noise(rng, 0.12)));

    const errorRate = +Math.max(0.0009, 0.0042 - phoenixMaturity * 0.0021 + noise(rng, 0.0005)).toFixed(4);

    const replicasCreated = Math.round(220 + t * 1.4 + noise(rng, 18));

    const concurrentPeak = Math.round(minutes / 1440 * 1.55 * (1 + noise(rng, 0.05)));

    out.push({
      date: isoDaysAgo(daysAgo),
      daysAgo,
      minutes,
      videoGenMinutes,
      latencyP50,
      latencyP95,
      latencyP99,
      fps,
      dau,
      signups,
      errorRate,
      replicasCreated,
      concurrentPeak,
    });
  }

  return out.sort((a, b) => b.daysAgo - a.daysAgo); // oldest first
}

// ---------- Tier mix ----------

function buildTierMix(): TierMixSnapshot[] {
  const rng = makeRng(7);
  const out: TierMixSnapshot[] = [];

  for (let daysAgo = WINDOW_DAYS - 1; daysAgo >= 0; daysAgo--) {
    const t = WINDOW_DAYS - 1 - daysAgo;
    const progress = t / (WINDOW_DAYS - 1);

    const basicCount = Math.round(8_400 + t * 38 + noise(rng, 30));

    // Daily revenue contribution (not MRR; this is daily $)
    const starterDaily = 1_950 + t * 6 + noise(rng, 70);
    const growthDaily = 6_400 + t * 32 + noise(rng, 180);
    const enterpriseDaily = 22_500 + t * 145 + noise(rng, 720); // grows fastest

    out.push({
      date: isoDaysAgo(daysAgo),
      daysAgo,
      basicCount,
      starterRevenue: Math.round(starterDaily),
      growthRevenue: Math.round(growthDaily),
      enterpriseRevenue: Math.round(enterpriseDaily),
    });
  }

  return out.sort((a, b) => b.daysAgo - a.daysAgo);
}

// ---------- Cost structure ----------

function buildCostStructure(): CostSnapshot[] {
  const rng = makeRng(101);
  const out: CostSnapshot[] = [];

  const costStart = 0.162;
  const costEnd = 0.108;
  const priceStart = 0.298;
  const priceEnd = 0.272; // slight price compression as we move enterprise

  for (let daysAgo = WINDOW_DAYS - 1; daysAgo >= 0; daysAgo--) {
    const t = WINDOW_DAYS - 1 - daysAgo;
    const progress = t / (WINDOW_DAYS - 1);
    const phoenixLive = daysAgo <= PHOENIX_4_LAUNCH_DAYS_AGO;
    const phoenixBonus = phoenixLive ? 0.012 * Math.min(1, (PHOENIX_4_LAUNCH_DAYS_AGO - daysAgo) / 50) : 0;

    const costPerMinute = +(costStart + (costEnd - costStart) * progress - phoenixBonus + noise(rng, 0.003)).toFixed(4);
    const pricePerMinute = +(priceStart + (priceEnd - priceStart) * progress + noise(rng, 0.004)).toFixed(4);
    const grossMargin = +((pricePerMinute - costPerMinute) / pricePerMinute).toFixed(4);

    out.push({
      date: isoDaysAgo(daysAgo),
      daysAgo,
      costPerMinute,
      pricePerMinute,
      grossMargin,
    });
  }

  return out.sort((a, b) => b.daysAgo - a.daysAgo);
}

// ---------- Customers ----------

type CustomerSeed = Omit<CustomerAccount, "minutesMTD" | "minutesPrevMonth" | "spendMTD" | "spendPrevMonth" | "wowChange" | "history"> & {
  shareOfPlatform: number; // approximate % of platform CVI minutes
  trendMultEnd: number; // multiplier vs day 89 (1.0 = flat, >1 growing, <1 declining)
  burstDay?: number;
  burstStrength?: number;
};

const customerSeeds: CustomerSeed[] = [
  {
    id: "final-round-ai",
    name: "Final Round AI",
    isPublic: true,
    tier: "Enterprise",
    vertical: "Interview prep",
    renewalInDays: 47,
    ndr: 1.41,
    churnRisk: "Low",
    ownerInitials: "HR",
    notes: "100K+ users, 1.2M+ practice minutes lifetime. Heaviest CVI consumer on the platform.",
    shareOfPlatform: 0.28,
    trendMultEnd: 1.62,
    burstDay: 21,
    burstStrength: 1.6,
  },
  {
    id: "delphi",
    name: "Delphi",
    isPublic: true,
    tier: "Enterprise",
    vertical: "AI Humans (consumer)",
    renewalInDays: 112,
    ndr: 1.78,
    churnRisk: "Low",
    ownerInitials: "QF",
    notes: "Sub-1s latency deployment. Times Square billboard. Fastest-growing account this quarter.",
    shareOfPlatform: 0.14,
    trendMultEnd: 2.1,
    burstDay: 47,
    burstStrength: 1.45,
  },
  {
    id: "deloitte",
    name: "Deloitte",
    isPublic: true,
    tier: "Enterprise",
    vertical: "Professional services",
    renewalInDays: 23,
    ndr: 0.92,
    churnRisk: "Watch",
    ownerInitials: "QF",
    notes: "Logo-wall enterprise. Usage trending flat for 6 weeks. Renewal in 23 days.",
    shareOfPlatform: 0.08,
    trendMultEnd: 0.97,
  },
  {
    id: "careflick",
    name: "CareFlick",
    isPublic: true,
    tier: "Growth",
    vertical: "AgeTech / wellness",
    renewalInDays: 184,
    ndr: 1.22,
    churnRisk: "Low",
    ownerInitials: "HR",
    notes: "Senior loneliness companions. Smaller account, steady WoW growth.",
    shareOfPlatform: 0.025,
    trendMultEnd: 1.31,
  },
  {
    id: "lumen-ed",
    name: "Lumen Ed",
    isPublic: false,
    tier: "Enterprise",
    vertical: "K-12 tutoring",
    renewalInDays: 76,
    ndr: 1.35,
    churnRisk: "Low",
    ownerInitials: "QF",
    notes: "AI tutor product. Strong school-day weekday pattern; light on weekends.",
    shareOfPlatform: 0.06,
    trendMultEnd: 1.48,
  },
  {
    id: "helio-health",
    name: "Helio Health",
    isPublic: false,
    tier: "Enterprise",
    vertical: "Telehealth intake",
    renewalInDays: 58,
    ndr: 1.12,
    churnRisk: "Low",
    ownerInitials: "HR",
    notes: "HIPAA-scope deployment. Stable consumer, mild upward trajectory.",
    shareOfPlatform: 0.055,
    trendMultEnd: 1.18,
  },
  {
    id: "aegis-talent",
    name: "Aegis Talent",
    isPublic: false,
    tier: "Growth",
    vertical: "Sales coaching",
    renewalInDays: 15,
    ndr: 0.71,
    churnRisk: "At Risk",
    ownerInitials: "QF",
    notes: "Consumption down 34% over 30 days. Renewal in 15 days. Owner has not been in touch.",
    shareOfPlatform: 0.022,
    trendMultEnd: 0.62,
  },
  {
    id: "northwind-insurance",
    name: "Northwind Insurance",
    isPublic: false,
    tier: "Enterprise",
    vertical: "Claims intake",
    renewalInDays: 201,
    ndr: 1.04,
    churnRisk: "Low",
    ownerInitials: "HR",
    notes: "Slow start, beginning to scale concurrent streams.",
    shareOfPlatform: 0.035,
    trendMultEnd: 1.22,
  },
  {
    id: "polaris-sales",
    name: "Polaris Sales",
    isPublic: false,
    tier: "Growth",
    vertical: "Sales enablement",
    renewalInDays: 91,
    ndr: 1.08,
    churnRisk: "Low",
    ownerInitials: "QF",
    notes: "Consistent weekday usage from SDR org. Recently asked about Enterprise upgrade.",
    shareOfPlatform: 0.028,
    trendMultEnd: 1.16,
  },
  {
    id: "crestline-ld",
    name: "Crestline L&D",
    isPublic: false,
    tier: "Enterprise",
    vertical: "Corporate learning",
    renewalInDays: 134,
    ndr: 1.27,
    churnRisk: "Low",
    ownerInitials: "HR",
    notes: "Onboarding flows for distributed workforces. Spiked on training-cycle weeks.",
    shareOfPlatform: 0.045,
    trendMultEnd: 1.34,
  },
  {
    id: "meridian-banking",
    name: "Meridian Banking",
    isPublic: false,
    tier: "Enterprise",
    vertical: "Banking support",
    renewalInDays: 38,
    ndr: 0.99,
    churnRisk: "Watch",
    ownerInitials: "QF",
    notes: "Flat usage. Procurement renewal in 38 days; legal still on SOC2 review.",
    shareOfPlatform: 0.04,
    trendMultEnd: 1.02,
  },
  {
    id: "volta-robotics",
    name: "Volta Robotics",
    isPublic: false,
    tier: "Growth",
    vertical: "B2B robotics",
    renewalInDays: 167,
    ndr: 1.41,
    churnRisk: "Low",
    ownerInitials: "HR",
    notes: "Built an internal customer-support replica. Quietly heavy on Sparrow turn-taking calls.",
    shareOfPlatform: 0.018,
    trendMultEnd: 1.42,
  },
];

function buildCustomers(daily: DailySnapshot[]): CustomerAccount[] {
  const rng = makeRng(73);
  const accounts: CustomerAccount[] = [];

  for (const seed of customerSeeds) {
    const customerRng = makeRng(seed.id.charCodeAt(0) * 9173 + seed.id.length * 41);
    const history: number[] = [];

    for (let i = 0; i < WINDOW_DAYS; i++) {
      const day = daily[WINDOW_DAYS - 1 - i]; // sorted desc-by-daysAgo; index 0 is today, so reverse for oldest-first
      const daysAgo = day.daysAgo;
      const t = WINDOW_DAYS - 1 - daysAgo;
      const progress = t / (WINDOW_DAYS - 1);

      const trendMult = 1 + (seed.trendMultEnd - 1) * progress;
      const weekendMult = isWeekend(daysAgo)
        ? seed.vertical === "K-12 tutoring"
          ? 0.32
          : seed.vertical.includes("AgeTech") || seed.vertical.includes("consumer")
            ? 0.95
            : 0.7
        : 1.0;

      let burstMult = 1.0;
      if (seed.burstDay !== undefined && Math.abs(seed.burstDay - daysAgo) < 6) {
        const intensity = Math.max(0, 1 - Math.abs(seed.burstDay - daysAgo) / 6);
        burstMult = 1 + (seed.burstStrength! - 1) * intensity;
      }

      const baseMinutes = day.minutes * seed.shareOfPlatform * trendMult * weekendMult * burstMult;
      const minutes = Math.round(baseMinutes * (1 + noise(customerRng, 0.08)));
      history.push(minutes);
    }

    // history is now oldest -> newest (index 0 = day89, index 89 = today)
    // Wait, we iterated i 0..89 which corresponds to daily[89-i] = day with daysAgo = 89-i.
    // So history[0] corresponds to daily[89] which is daysAgo=89 (oldest). Good.

    const today = history[WINDOW_DAYS - 1];
    const yesterday = history[WINDOW_DAYS - 2];

    const last30 = history.slice(WINDOW_DAYS - 30);
    const prev30 = history.slice(WINDOW_DAYS - 60, WINDOW_DAYS - 30);
    const minutesMTD = last30.reduce((a, b) => a + b, 0);
    const minutesPrevMonth = prev30.reduce((a, b) => a + b, 0);

    const lastWeek = history.slice(WINDOW_DAYS - 7);
    const prevWeek = history.slice(WINDOW_DAYS - 14, WINDOW_DAYS - 7);
    const wowChange = (lastWeek.reduce((a, b) => a + b, 0) - prevWeek.reduce((a, b) => a + b, 0)) / prevWeek.reduce((a, b) => a + b, 0);

    // Blended $ per minute by tier
    const pricePerMin = seed.tier === "Enterprise" ? 0.24 : seed.tier === "Growth" ? 0.30 : 0.36;
    const spendMTD = Math.round(minutesMTD * pricePerMin);
    const spendPrevMonth = Math.round(minutesPrevMonth * pricePerMin);

    accounts.push({
      id: seed.id,
      name: seed.name,
      isPublic: seed.isPublic,
      tier: seed.tier,
      vertical: seed.vertical,
      minutesMTD,
      minutesPrevMonth,
      spendMTD,
      spendPrevMonth,
      wowChange,
      renewalInDays: seed.renewalInDays,
      ndr: seed.ndr,
      churnRisk: seed.churnRisk,
      ownerInitials: seed.ownerInitials,
      notes: seed.notes,
      history,
    });
  }

  return accounts.sort((a, b) => b.minutesMTD - a.minutesMTD);
}

// ---------- Build everything (module-level, cached) ----------

export const dailyMetrics: DailySnapshot[] = buildDailyMetrics();
export const tierMix: TierMixSnapshot[] = buildTierMix();
export const costStructure: CostSnapshot[] = buildCostStructure();
export const customers: CustomerAccount[] = buildCustomers(dailyMetrics);

// ---------- Convenience aggregates ----------

export function today(): DailySnapshot {
  return dailyMetrics.find((d) => d.daysAgo === 0)!;
}
export function yesterday(): DailySnapshot {
  return dailyMetrics.find((d) => d.daysAgo === 1)!;
}
export function sevenDayAvg(metric: keyof DailySnapshot): number {
  const last7 = dailyMetrics.filter((d) => d.daysAgo > 0 && d.daysAgo <= 7);
  const sum = last7.reduce((acc, d) => acc + (d[metric] as number), 0);
  return sum / last7.length;
}
export function thirtyDayMinutes(): number {
  return dailyMetrics.filter((d) => d.daysAgo < 30).reduce((a, d) => a + d.minutes, 0);
}
export function todayCost(): CostSnapshot {
  return costStructure.find((c) => c.daysAgo === 0)!;
}
export function todayTierMix(): TierMixSnapshot {
  return tierMix.find((t) => t.daysAgo === 0)!;
}

// Approximate ARR run rate from yesterday's revenue mix (daily revenue x 365)
export function arrRunRate(): number {
  const t = todayTierMix();
  const dailyRevenue = t.starterRevenue + t.growthRevenue + t.enterpriseRevenue;
  return dailyRevenue * 365;
}

// Today's snapshot summarized in a compact, Claude-friendly shape.
export function dashboardSnapshotForClaude() {
  const t = today();
  const y = yesterday();
  const c = todayCost();
  const m = todayTierMix();
  const arr = arrRunRate();

  const topAccounts = customers
    .slice(0, 8)
    .map((c) => ({
      name: c.name,
      tier: c.tier,
      minutesMTD: c.minutesMTD,
      spendMTD: c.spendMTD,
      wowChange: +(c.wowChange * 100).toFixed(1),
      churnRisk: c.churnRisk,
      renewalInDays: c.renewalInDays,
      isPublic: c.isPublic,
    }));

  return {
    asOf: t.date,
    cvi: {
      minutesToday: t.minutes,
      minutesYesterday: y.minutes,
      sevenDayAvgMinutes: Math.round(sevenDayAvg("minutes")),
      latencyP50: t.latencyP50,
      latencyP95: t.latencyP95,
      latencyP99: t.latencyP99,
      fps1080p: t.fps,
      activeDevelopers: t.dau,
      errorRate: t.errorRate,
      concurrentPeak: t.concurrentPeak,
      phoenix4LiveForDays: PHOENIX_4_LAUNCH_DAYS_AGO + 1,
    },
    economics: {
      costPerMinute: c.costPerMinute,
      pricePerMinute: c.pricePerMinute,
      grossMargin: c.grossMargin,
      costPerMinute90dAgo: costStructure.find((x) => x.daysAgo === 89)!.costPerMinute,
    },
    revenue: {
      arrRunRate: Math.round(arr),
      starterRevenueDaily: m.starterRevenue,
      growthRevenueDaily: m.growthRevenue,
      enterpriseRevenueDaily: m.enterpriseRevenue,
      basicAccounts: m.basicCount,
    },
    topAccounts,
    anomalies: detectAnomalies(),
  };
}

// Lightweight anomaly detector for Morning Briefing context
function detectAnomalies(): string[] {
  const out: string[] = [];

  // Renewal-soon, low NDR
  for (const c of customers) {
    if (c.renewalInDays <= 30 && c.ndr < 1.0) {
      out.push(`${c.name} renewal in ${c.renewalInDays} days with NDR ${c.ndr.toFixed(2)} (${c.churnRisk}).`);
    }
  }

  // Big WoW swings
  for (const c of customers.slice(0, 8)) {
    if (Math.abs(c.wowChange) > 0.18) {
      const dir = c.wowChange > 0 ? "up" : "down";
      out.push(`${c.name} ${dir} ${(c.wowChange * 100).toFixed(0)}% week-over-week.`);
    }
  }

  // Latency excursion
  const t = today();
  if (t.latencyP95 > 500) {
    out.push(`P95 CVI latency at ${t.latencyP95}ms today, above the 500ms target.`);
  }

  return out.slice(0, 6);
}
