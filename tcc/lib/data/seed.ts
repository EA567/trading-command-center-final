import { id } from "@/lib/utils/id";
import { daysAgoISO, todayISO } from "@/lib/utils/format";
import {
  Account, Trade, Goal, Task, PsychologyLog,
} from "@/types";

const PAIRS = ["EURUSD", "GBPUSD", "XAUUSD", "US30", "NAS100", "USDJPY", "AUDUSD", "GBPJPY"];
const SESSIONS: Trade["session"][] = ["Asian", "London", "New York", "London/NY Overlap"];

export function seedAccounts(): Account[] {
  return [
    { id: id(), name: "Maven 5K", broker: "Maven Trading", type: "Challenge", startingBalance: 5000, currentBalance: 5480, equity: 5510, status: "active", createdAt: daysAgoISO(42) },
    { id: id(), name: "FTMO 25K", broker: "FTMO", type: "Funded", startingBalance: 25000, currentBalance: 27140, equity: 27210, status: "funded", createdAt: daysAgoISO(90) },
    { id: id(), name: "IC Markets Live", broker: "Personal (IC Markets)", type: "Personal", startingBalance: 10000, currentBalance: 9420, equity: 9390, status: "active", createdAt: daysAgoISO(120) },
    { id: id(), name: "The5ers 10K", broker: "The5ers", type: "Verification", startingBalance: 10000, currentBalance: 9180, equity: 9180, status: "failed", createdAt: daysAgoISO(65) },
  ];
}

const SAMPLE_JOURNAL_WIN = `
  <h2>Why I Entered</h2>
  <p>Price swept the Asian session low and reacted sharply off a daily order block. I'd marked this zone the night before, so this was a <strong>pre-planned setup</strong>, not a reaction trade.</p>
  <h2>Market Analysis</h2>
  <ul>
    <li>Daily trend still bullish, price pulled back into a clean discount zone</li>
    <li>4H structure shifted bullish right at the order block</li>
    <li>News calendar was clear for the next two hours</li>
  </ul>
  <h2>My Emotions</h2>
  <p>Calm and patient. Waited almost 40 minutes for the 5m confirmation instead of jumping in early.</p>
  <h2>Lessons Learned</h2>
  <blockquote>Waiting for the close of the confirmation candle removes almost all of my early-entry mistakes.</blockquote>
`;

const SAMPLE_JOURNAL_LOSS = `
  <h2>Why I Entered</h2>
  <p>Saw price approaching a level I'd marked and entered <strong>before</strong> the confirmation candle actually closed.</p>
  <h2>Mistakes</h2>
  <ul>
    <li>Entered on the wick, not the close</li>
    <li>Slightly oversized the position after two prior wins</li>
  </ul>
  <h2>What I'll Improve Next Time</h2>
  <p>Set a hard rule: no entry until the 5m candle fully closes above/below the level. Write it on a sticky note if I have to.</p>
`;

export function seedTrades(accounts: Account[]): Trade[] {
  const trades: Trade[] = [];
  for (let i = 0; i < 46; i++) {
    const acc = accounts[Math.floor(Math.random() * accounts.length)];
    const pair = PAIRS[Math.floor(Math.random() * PAIRS.length)];
    const direction = Math.random() > 0.5 ? "BUY" : "SELL";
    const win = Math.random() > 0.42;
    const lot = +(Math.random() * 2 + 0.1).toFixed(2);
    const riskAmount = +(Math.random() * 150 + 30).toFixed(2);
    const rr = +(Math.random() * 3 + 0.5).toFixed(2);
    const profitLoss = win ? +(riskAmount * rr).toFixed(2) : -riskAmount;
    const date = daysAgoISO(Math.floor(Math.random() * 45));
    trades.push({
      id: id(),
      accountId: acc.id,
      date,
      time: `${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
      pair,
      direction,
      session: SESSIONS[Math.floor(Math.random() * SESSIONS.length)],
      lotSize: lot,
      riskAmount,
      riskPercent: +((riskAmount / acc.startingBalance) * 100).toFixed(2),
      rr,
      profitLoss,
      profitLossPercent: +((profitLoss / acc.startingBalance) * 100).toFixed(2),
      status: "closed",
      notes: "Followed the plan, waited for confirmation candle before entry.",
      psychologyNotes: win ? "Felt calm and confident through the trade." : "Slight hesitation on entry, second-guessed the setup.",
      mistakes: win ? [] : ["Entered slightly early"],
      lessons: win ? "Trust the process when confluence lines up." : "Wait for full candle close next time.",
      journal: i < 2 ? (win ? SAMPLE_JOURNAL_WIN : SAMPLE_JOURNAL_LOSS) : undefined,
      createdAt: date,
    });
  }
  return trades.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function seedGoals(accounts: Account[]): Goal[] {
  return [
    { id: id(), type: "daily", title: "Daily Profit Target", target: 200, current: 145, unit: "$", checklist: [] },
    { id: id(), type: "weekly", title: "Weekly Profit Target", target: 1000, current: 620, unit: "$", checklist: [] },
    { id: id(), type: "monthly", title: "Monthly Profit Target", target: 4000, current: 2380, unit: "$", checklist: [] },
    { id: id(), type: "yearly", title: "Yearly Growth Target", target: 40, current: 18, unit: "%", checklist: [] },
    {
      id: id(), type: "challenge", title: "FTMO 25K Challenge Progress", target: 2500, current: 2140, unit: "$",
      accountId: accounts[1]?.id, deadline: daysAgoISO(-14),
      checklist: [
        { id: id(), text: "Hit 10% profit target", done: true },
        { id: id(), text: "Stay under 5% daily loss", done: true },
        { id: id(), text: "Stay under 10% max drawdown", done: false },
      ],
    },
    { id: id(), type: "payout", title: "Next Payout Goal", target: 2000, current: 2000, unit: "$", accountId: accounts[1]?.id, checklist: [] },
    { id: id(), type: "growth", title: "Account Growth (Personal)", target: 25, current: -5.8, unit: "%", accountId: accounts[2]?.id, checklist: [] },
  ];
}

export function seedTasks(): Task[] {
  return [
    { id: id(), title: "Review yesterday's trades", category: "Trading", recurring: true, frequency: "daily", dueDate: todayISO(), done: true, createdAt: daysAgoISO(1) },
    { id: id(), title: "Check the economic calendar before trading", category: "Trading", recurring: true, frequency: "daily", dueDate: todayISO(), done: false, createdAt: daysAgoISO(1) },
    { id: id(), title: "Backtest order block strategy — 20 setups", category: "Study", recurring: false, dueDate: daysAgoISO(-3), done: false, createdAt: daysAgoISO(4) },
    { id: id(), title: "Morning workout", category: "Health", recurring: true, frequency: "daily", dueDate: todayISO(), done: true, createdAt: daysAgoISO(1) },
    { id: id(), title: "Update trading business expenses", category: "Business", recurring: false, dueDate: daysAgoISO(-7), done: false, createdAt: daysAgoISO(2) },
    { id: id(), title: "Call with prop firm support re: payout", category: "Personal", recurring: false, dueDate: daysAgoISO(-1), done: false, createdAt: daysAgoISO(1) },
  ];
}

export function seedPsychology(): PsychologyLog[] {
  return [
    {
      id: id(), date: daysAgoISO(1), emotionBefore: "Calm", emotionAfter: "Satisfied",
      confidence: 8, discipline: 9, mistakes: [], rulesBroken: [],
      lessons: "Sticking to the plan on high-conviction setups is paying off.",
      journal: "Good session. Took two A+ setups during London, skipped everything else.",
    },
    {
      id: id(), date: daysAgoISO(3), emotionBefore: "Anxious", emotionAfter: "Frustrated",
      confidence: 4, discipline: 3, mistakes: ["Revenge traded after a loss", "Oversized position"],
      rulesBroken: ["Max 2 trades per session"],
      lessons: "Step away from the screen after a loss before re-entering.",
      journal: "Broke my own rules chasing a loss. Need a hard stop after 2 losing trades.",
    },
  ];
}
