"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Daily Pulse" },
  { href: "/unit-economics", label: "Unit Economics" },
  { href: "/customer-health", label: "Customer Health" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-ink">
      <div className="mx-auto flex max-w-[1400px] items-stretch justify-between px-10">
        <Link href="/" className="group flex items-center gap-3 py-5 pr-8 border-r border-ink -ml-10 pl-10">
          <span className="bullet-only" aria-hidden />
          <span className="mono font-bold tracking-[0.08em] text-[15px]">TAVUS PULSE</span>
        </Link>

        <nav className="flex items-stretch">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2.5 border-r border-ink px-5 transition-colors label ${
                  active ? "bg-ink text-paper" : "text-ink hover:bg-paper-3"
                }`}
              >
                <span
                  className={`inline-block h-[7px] w-[7px] ${active ? "bg-paper" : "bg-ink"}`}
                />
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center label gap-2.5 pl-5 -mr-10 pr-10 text-ink-soft tabular">
          <span className="pulse-dot inline-block h-1.5 w-1.5 bg-warn" />
          <span>
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  );
}
