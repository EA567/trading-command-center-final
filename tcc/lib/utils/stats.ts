import { Account, DerivedStats, Trade } from "@/types";
import { isSameISOWeek, monthKey, todayISO } from "./format";

export function computeStats(accounts: Account[], trades: Trade[]): DerivedStats {
  const totalBalance = accounts.reduce((s, a) => s + a.currentBalance, 0);
  const equity = accounts.reduce((s, a) => s + a.equity, 0);
  const closed = trades.filter((t) => t.status === "closed");
  const open = trades.filter((t) => t.status === "open");

  const today = todayISO();
  const dailyPL = closed.filter((t) => t.date === today).reduce((s, t) => s + t.profitLoss, 0);
  const weeklyPL = closed.filter((t) => isSameISOWeek(t.date, today)).reduce((s, t) => s + t.profitLoss, 0);
  const monthlyPL = closed.filter((t) => monthKey(t.date) === monthKey(today)).reduce((s, t) => s + t.profitLoss, 0);
  const overallProfit = closed.reduce((s, t) => s + t.profitLoss, 0);

  const wins = closed.filter((t) => t.profitLoss > 0);
  const losses = closed.filter((t) => t.profitLoss <= 0);
  const winRate = closed.length ? (wins.length / closed.length) * 100 : 0;

  const avgRiskPercent = closed.length ? closed.reduce((s, t) => s + t.riskPercent, 0) / closed.length : 0;
  const avgRR = closed.length ? closed.reduce((s, t) => s + t.rr, 0) / closed.length : 0;

  const grossWin = wins.reduce((s, t) => s + t.profitLoss, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.profitLoss, 0));
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? Infinity : 0;

  const avgWin = wins.length ? grossWin / wins.length : 0;
  const avgLoss = losses.length ? grossLoss / losses.length : 0;
  const biggestWin = wins.length ? Math.max(...wins.map((t) => t.profitLoss)) : 0;
  const biggestLoss = losses.length ? Math.min(...losses.map((t) => t.profitLoss)) : 0;

  // Drawdown: peak-to-trough on cumulative equity curve
  const sorted = [...closed].sort((a, b) => (a.date > b.date ? 1 : -1));
  let cum = accounts.reduce((s, a) => s + a.startingBalance, 0);
  let peak = cum;
  let maxDD = 0;
  sorted.forEach((t) => {
    cum += t.profitLoss;
    peak = Math.max(peak, cum);
    maxDD = Math.max(maxDD, peak > 0 ? ((peak - cum) / peak) * 100 : 0);
  });

  // Consecutive streaks
  let curWin = 0, curLoss = 0, maxWin = 0, maxLoss = 0;
  sorted.forEach((t) => {
    if (t.profitLoss > 0) {
      curWin += 1; curLoss = 0;
    } else {
      curLoss += 1; curWin = 0;
    }
    maxWin = Math.max(maxWin, curWin);
    maxLoss = Math.max(maxLoss, curLoss);
  });

  return {
    totalBalance, equity, dailyPL, weeklyPL, monthlyPL, overallProfit, winRate,
    avgRiskPercent, avgRR, totalTrades: trades.length, openPositions: open.length,
    closedPositions: closed.length, drawdown: maxDD, profitFactor, avgWin, avgLoss,
    biggestWin, biggestLoss, maxConsecutiveWins: maxWin, maxConsecutiveLosses: maxLoss,
  };
}

export function equityCurve(accounts: Account[], trades: Trade[]) {
  const closed = trades.filter((t) => t.status === "closed").sort((a, b) => (a.date > b.date ? 1 : -1));
  let cum = accounts.reduce((s, a) => s + a.startingBalance, 0);
  const byDate: Record<string, number> = {};
  closed.forEach((t) => {
    cum += t.profitLoss;
    byDate[t.date] = cum;
  });
  return Object.entries(byDate).map(([date, equity]) => ({ date, equity: +equity.toFixed(2) }));
}

export function groupProfitBy(
  trades: Trade[],
  key: "month" | "week" | "day" | "session" | "pair"
) {
  const closed = trades.filter((t) => t.status === "closed");
  const map: Record<string, number> = {};
  closed.forEach((t) => {
    let k: string;
    switch (key) {
      case "month": k = monthKey(t.date); break;
      case "week": {
        const d = new Date(t.date);
        const oneJan = new Date(d.getFullYear(), 0, 1);
        const week = Math.ceil(((+d - +oneJan) / 86400000 + oneJan.getDay() + 1) / 7);
        k = `${d.getFullYear()}-W${week}`;
        break;
      }
      case "day": k = new Date(t.date).toLocaleDateString("en-US", { weekday: "short" }); break;
      case "session": k = t.session; break;
      case "pair": k = t.pair; break;
      default: k = "Unknown";
    }
    map[k] = (map[k] || 0) + t.profitLoss;
  });
  return Object.entries(map).map(([label, profit]) => ({ label, profit: +profit.toFixed(2) }));
}

export function monthlyProfitSeries(trades: Trade[]) {
  const grouped = groupProfitBy(trades, "month").sort((a, b) => (a.label > b.label ? 1 : -1));
  return grouped.map((g) => ({
    month: new Date(g.label + "-02").toLocaleDateString("en-US", { month: "short" }),
    profit: g.profit,
  }));
}

export function dailyPerformanceSeries(trades: Trade[], days = 30) {
  const closed = trades.filter((t) => t.status === "closed");
  const map: Record<string, number> = {};
  closed.forEach((t) => { map[t.date] = (map[t.date] || 0) + t.profitLoss; });
  return Object.entries(map)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .slice(-days)
    .map(([date, profit]) => ({ date, profit: +profit.toFixed(2) }));
}

export function tradesByDayMap(trades: Trade[]): Record<string, Trade[]> {
  const map: Record<string, Trade[]> = {};
  trades.filter((t) => t.status === "closed").forEach((t) => {
    if (!map[t.date]) map[t.date] = [];
    map[t.date].push(t);
  });
  return map;
}
