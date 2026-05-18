import { ReactNode } from "react";
import { WhyIsThisOff } from "./WhyIsThisOff";

type Props = {
  label: string;
  title: string;
  metric: string;
  context?: string;
  headlineValue?: string;
  headlineDelta?: { label: string; positive: boolean };
  children: ReactNode;
};

export function ChartCard({ label, title, metric, context, headlineValue, headlineDelta, children }: Props) {
  return (
    <section className="card">
      <div className="flex items-start justify-between border-b border-ink px-6 py-5 gap-6">
        <div className="min-w-0">
          <div className="label flex items-center gap-2.5">
            <span className="bullet-only" />
            {label}
          </div>
          <div className="serif text-[22px] leading-tight text-ink mt-2">{title}</div>
        </div>
        <div className="flex items-start gap-6 shrink-0">
          {headlineValue && (
            <div className="text-right">
              <div className="mono tabular text-[30px] leading-none text-ink font-medium tracking-[-0.02em]">{headlineValue}</div>
              {headlineDelta && (
                <div className={`mt-1.5 label tabular flex items-center justify-end gap-1.5 ${headlineDelta.positive ? "text-ink" : "text-warn"}`}>
                  <span className={`inline-block h-[6px] w-[6px] ${headlineDelta.positive ? "bg-pulse" : "bg-warn"}`} />
                  {headlineDelta.label}
                </div>
              )}
            </div>
          )}
          <div className="pt-1.5">
            <WhyIsThisOff metric={metric} context={context} />
          </div>
        </div>
      </div>
      <div className="px-5 py-6 bg-paper">{children}</div>
    </section>
  );
}
