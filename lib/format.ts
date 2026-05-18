export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatCompact(n: number, digits = 1): string {
  if (Math.abs(n) >= 1_000_000_000) return (n / 1_000_000_000).toFixed(digits) + "B";
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(digits) + "M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(digits) + "K";
  return n.toString();
}

export function formatCurrency(n: number): string {
  return "$" + formatNumber(Math.round(n));
}

export function formatCurrencyCompact(n: number, digits = 1): string {
  return "$" + formatCompact(n, digits);
}

export function formatPercent(n: number, digits = 1): string {
  const sign = n > 0 ? "+" : "";
  return sign + (n * 100).toFixed(digits) + "%";
}

export function formatMs(n: number): string {
  return Math.round(n) + "ms";
}

export function formatFps(n: number): string {
  return n.toFixed(1);
}

export function formatPriceMinute(n: number): string {
  return "$" + n.toFixed(3);
}

export function formatDelta(now: number, prev: number): { value: number; label: string; positive: boolean } {
  const value = (now - prev) / prev;
  return {
    value,
    label: formatPercent(value, 1),
    positive: value >= 0,
  };
}
