/** US-English formatting helpers used across the public site. */

export function formatPrice(cents: number, currency = "USD", opts: { withCode?: boolean } = {}) {
  if (cents === 0) return "Free";
  const whole = cents % 100 === 0;
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(cents / 100);
  return opts.withCode ? `${amount} ${currency.toUpperCase()}` : amount;
}

export function formatDate(value: string | Date | null | undefined, style: "long" | "short" = "long") {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: style === "long" ? "long" : "short", day: "numeric", year: "numeric" });
}
