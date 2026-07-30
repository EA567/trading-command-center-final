export function formatMoney(n: number, currency = "USD", showPlus = false): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : showPlus && n > 0 ? "+" : "";
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : `${currency} `;
  return `${sign}${symbol}${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPercent(n: number, showPlus = false): string {
  const sign = n > 0 && showPlus ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTimeInZone(iso: string, timeZone: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function isSameISOWeek(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  const oneJan = new Date(da.getFullYear(), 0, 1);
  const weekOf = (d: Date) => Math.ceil(((+d - +oneJan) / 86400000 + oneJan.getDay() + 1) / 7);
  return da.getFullYear() === db.getFullYear() && weekOf(da) === weekOf(db);
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7); // YYYY-MM
}
