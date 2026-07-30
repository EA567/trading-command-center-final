// ---------------------------------------------------------------------------
// Core domain types. These mirror the Supabase table shapes 1:1
// (see /supabase/schema.sql) so the local store and the Supabase-backed
// store can be swapped without touching any component code.
// ---------------------------------------------------------------------------

export type AccountType = "Challenge" | "Verification" | "Funded" | "Personal";
export type AccountStatus = "active" | "funded" | "passed" | "failed" | "breached";

export interface Account {
  id: string;
  name: string;
  broker: string;
  type: AccountType;
  startingBalance: number;
  currentBalance: number;
  equity: number;
  status: AccountStatus;
  createdAt: string; // ISO date
}

export type TradeDirection = "BUY" | "SELL";
export type TradeSession = "Asian" | "London" | "New York" | "London/NY Overlap";
export type TradeStatus = "open" | "closed";

export interface Trade {
  id: string;
  accountId: string;
  date: string; // ISO date YYYY-MM-DD
  time: string; // HH:mm
  pair: string;
  direction: TradeDirection;
  session: TradeSession;
  lotSize: number;
  riskAmount: number;
  riskPercent: number;
  rr: number;
  profitLoss: number;
  profitLossPercent: number;
  status: TradeStatus;
  screenshotBefore?: string; // data URL or hosted URL
  screenshotAfter?: string;
  notes?: string;
  psychologyNotes?: string;
  mistakes?: string[];
  lessons?: string;
  journal?: string; // rich HTML content from the calendar's document-style journal editor
  createdAt: string;
}

export type GoalType = "daily" | "weekly" | "monthly" | "yearly" | "challenge" | "payout" | "growth";

export interface GoalChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Goal {
  id: string;
  type: GoalType;
  title: string;
  target: number;
  current: number;
  unit: "$" | "%";
  deadline?: string;
  accountId?: string;
  checklist: GoalChecklistItem[];
}

export type TaskCategory = "Trading" | "Personal" | "Study" | "Health" | "Business";

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  recurring: boolean;
  frequency?: "daily" | "weekly" | "monthly";
  dueDate?: string;
  done: boolean;
  createdAt: string;
}

export interface PsychologyLog {
  id: string;
  date: string;
  emotionBefore: string;
  emotionAfter: string;
  confidence: number; // 1-10
  discipline: number; // 1-10
  mistakes: string[];
  rulesBroken: string[];
  lessons: string;
  journal: string;
}

export interface AppSettings {
  currency: string;
  timezone: string;
  riskDefaultPercent: number;
  profileName: string;
  profileEmail: string;
}

export interface NotificationItem {
  id: string;
  type: "trade" | "goal" | "challenge" | "task";
  title: string;
  message: string;
  time: string;
  severity: "info" | "warning" | "critical";
}

export interface DerivedStats {
  totalBalance: number;
  equity: number;
  dailyPL: number;
  weeklyPL: number;
  monthlyPL: number;
  overallProfit: number;
  winRate: number;
  avgRiskPercent: number;
  avgRR: number;
  totalTrades: number;
  openPositions: number;
  closedPositions: number;
  drawdown: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  biggestWin: number;
  biggestLoss: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
}
