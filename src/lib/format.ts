export function formatPrice(value: number, currency = "֏") {
  if (typeof value !== "number" || Number.isNaN(value)) return `0 ${currency}`;
  return `${value.toLocaleString("hy-AM")} ${currency}`;
}

export function formatDate(input?: string | Date | null) {
  if (!input) return "—";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("hy-AM", { day: "numeric", month: "long", year: "numeric" });
}

export function formatDateTime(input?: string | Date | null) {
  if (!input) return "—";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("hy-AM", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}