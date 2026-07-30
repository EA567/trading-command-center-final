import { Account, DerivedStats, Goal, Trade } from "@/types";
import { computeStats } from "./stats";

/**
 * Returns the live, auto-computed progress for a goal, or null if the goal
 * type is manually tracked (challenge / payout), in which case the caller
 * should fall back to the goal's stored `current` value.
 */
export function computeEffectiveCurrent(goal: Goal, accounts: Account[], trades: Trade[]): number | null {
  const scopedAccounts = goal.accountId ? accounts.filter((a) => a.id === goal.accountId) : accounts;
  const scopedTrades = goal.accountId ? trades.filter((t) => t.accountId === goal.accountId) : trades;
  const stats: DerivedStats = computeStats(scopedAccounts, scopedTrades);

  switch (goal.type) {
    case "daily":
      return +stats.dailyPL.toFixed(2);
    case "weekly":
      return +stats.weeklyPL.toFixed(2);
    case "monthly":
      return +stats.monthlyPL.toFixed(2);
    case "yearly":
      if (goal.unit === "%") {
        const startingTotal = scopedAccounts.reduce((s, a) => s + a.startingBalance, 0);
        return startingTotal > 0 ? +((stats.overallProfit / startingTotal) * 100).toFixed(2) : 0;
      }
      return +stats.overallProfit.toFixed(2);
    case "growth": {
      if (!goal.accountId) return null;
      const acc = accounts.find((a) => a.id === goal.accountId);
      if (!acc) return null;
      return +(((acc.currentBalance - acc.startingBalance) / acc.startingBalance) * 100).toFixed(2);
    }
    case "challenge":
    case "payout":
    default:
      return null; // manually tracked — see GoalsPage inline "Update Progress"
  }
}
