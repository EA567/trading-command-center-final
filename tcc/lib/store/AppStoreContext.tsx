"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { id } from "@/lib/utils/id";
import {
  seedAccounts, seedTrades, seedGoals, seedTasks, seedPsychology,
} from "@/lib/data/seed";
import {
  Account, Trade, Goal, Task, PsychologyLog, AppSettings,
} from "@/types";

const STORAGE_KEY = "tcc:data:v1";

interface StoreShape {
  accounts: Account[];
  trades: Trade[];
  goals: Goal[];
  tasks: Task[];
  psychologyLogs: PsychologyLog[];
  settings: AppSettings;
  activeAccountId: string | "all";
}

function defaultSettings(): AppSettings {
  return {
    currency: "USD",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    riskDefaultPercent: 1,
    profileName: "Trader",
    profileEmail: "",
  };
}

function buildSeed(): StoreShape {
  const accounts = seedAccounts();
  return {
    accounts,
    trades: seedTrades(accounts),
    goals: seedGoals(accounts),
    tasks: seedTasks(),
    psychologyLogs: seedPsychology(),
    settings: defaultSettings(),
    activeAccountId: "all",
  };
}

/**
 * Deterministic, environment-independent state used for the very first
 * render (server AND client, before hydration). It intentionally contains
 * no Math.random() output and no Intl/timezone lookups, so the server-
 * rendered HTML and the client's pre-hydration render always match exactly.
 * Real (randomized) seed data or restored localStorage data is only ever
 * applied inside the client-only useEffect below, after hydration.
 */
function emptyState(): StoreShape {
  return {
    accounts: [],
    trades: [],
    goals: [],
    tasks: [],
    psychologyLogs: [],
    settings: {
      currency: "USD",
      timezone: "UTC",
      riskDefaultPercent: 1,
      profileName: "Trader",
      profileEmail: "",
    },
    activeAccountId: "all",
  };
}

interface AppStoreValue extends StoreShape {
  loading: boolean;
  setActiveAccountId: (id: string | "all") => void;
  visibleAccounts: Account[];
  visibleTrades: Trade[];

  addAccount: (a: Omit<Account, "id" | "createdAt">) => void;
  updateAccount: (id: string, patch: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  addTrade: (t: Omit<Trade, "id" | "createdAt">) => void;
  updateTrade: (id: string, patch: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;

  addGoal: (g: Omit<Goal, "id">) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  addTask: (t: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  addPsychologyLog: (p: Omit<PsychologyLog, "id">) => void;
  deletePsychologyLog: (id: string) => void;

  updateSettings: (patch: Partial<AppSettings>) => void;

  exportData: () => string;
  importData: (json: string) => void;
  resetData: () => void;
}

const AppStoreCtx = createContext<AppStoreValue | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<StoreShape>(emptyState());

  // Load from localStorage on mount (client only)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoreShape;
        setState({ ...buildSeed(), ...parsed });
      } else {
        const seeded = buildSeed();
        setState(seeded);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      }
    } catch {
      setState(buildSeed());
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = useCallback((next: StoreShape) => {
    setState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable (private browsing, quota) - state still updates in memory
    }
  }, []);

  // -------------------- accounts --------------------
  const addAccount: AppStoreValue["addAccount"] = (a) => {
    persist({ ...state, accounts: [...state.accounts, { ...a, id: id(), createdAt: new Date().toISOString() }] });
  };
  const updateAccount: AppStoreValue["updateAccount"] = (accId, patch) => {
    persist({ ...state, accounts: state.accounts.map((a) => (a.id === accId ? { ...a, ...patch } : a)) });
  };
  const deleteAccount: AppStoreValue["deleteAccount"] = (accId) => {
    persist({
      ...state,
      accounts: state.accounts.filter((a) => a.id !== accId),
      trades: state.trades.filter((t) => t.accountId !== accId),
      activeAccountId: state.activeAccountId === accId ? "all" : state.activeAccountId,
    });
  };

  // -------------------- trades --------------------
  const applyTradeToAccounts = (accounts: Account[], accountId: string, balanceDelta: number, equityDelta: number) =>
    accounts.map((a) =>
      a.id === accountId
        ? { ...a, currentBalance: +(a.currentBalance + balanceDelta).toFixed(2), equity: +(a.equity + equityDelta).toFixed(2) }
        : a
    );

  const addTrade: AppStoreValue["addTrade"] = (t) => {
    const trade: Trade = { ...t, id: id(), createdAt: new Date().toISOString() };
    // Closed trades realize into both balance and equity. Open trades only move
    // equity (floating P/L) — balance stays untouched until the trade closes.
    const balanceDelta = trade.status === "closed" ? trade.profitLoss : 0;
    const equityDelta = trade.profitLoss;
    persist({
      ...state,
      trades: [trade, ...state.trades],
      accounts: applyTradeToAccounts(state.accounts, trade.accountId, balanceDelta, equityDelta),
    });
  };
  const updateTrade: AppStoreValue["updateTrade"] = (tradeId, patch) => {
    const existing = state.trades.find((t) => t.id === tradeId);
    if (!existing) return;
    const merged = { ...existing, ...patch };

    const oldBalanceDelta = existing.status === "closed" ? existing.profitLoss : 0;
    const oldEquityDelta = existing.profitLoss;
    const newBalanceDelta = merged.status === "closed" ? merged.profitLoss : 0;
    const newEquityDelta = merged.profitLoss;

    let accounts = state.accounts;
    if (existing.accountId === merged.accountId) {
      // Same account — apply the net difference in one step.
      accounts = applyTradeToAccounts(accounts, existing.accountId, newBalanceDelta - oldBalanceDelta, newEquityDelta - oldEquityDelta);
    } else {
      // Trade moved to a different account — fully reverse on the old account,
      // then fully apply on the new account, so both stay correctly synced.
      accounts = applyTradeToAccounts(accounts, existing.accountId, -oldBalanceDelta, -oldEquityDelta);
      accounts = applyTradeToAccounts(accounts, merged.accountId, newBalanceDelta, newEquityDelta);
    }

    persist({ ...state, trades: state.trades.map((t) => (t.id === tradeId ? merged : t)), accounts });
  };
  const deleteTrade: AppStoreValue["deleteTrade"] = (tradeId) => {
    const existing = state.trades.find((t) => t.id === tradeId);
    if (!existing) return;
    const balanceDelta = existing.status === "closed" ? -existing.profitLoss : 0;
    const equityDelta = -existing.profitLoss;
    persist({
      ...state,
      trades: state.trades.filter((t) => t.id !== tradeId),
      accounts: applyTradeToAccounts(state.accounts, existing.accountId, balanceDelta, equityDelta),
    });
  };

  // -------------------- goals --------------------
  const addGoal: AppStoreValue["addGoal"] = (g) => persist({ ...state, goals: [...state.goals, { ...g, id: id() }] });
  const updateGoal: AppStoreValue["updateGoal"] = (goalId, patch) =>
    persist({ ...state, goals: state.goals.map((g) => (g.id === goalId ? { ...g, ...patch } : g)) });
  const deleteGoal: AppStoreValue["deleteGoal"] = (goalId) => persist({ ...state, goals: state.goals.filter((g) => g.id !== goalId) });

  // -------------------- tasks --------------------
  const addTask: AppStoreValue["addTask"] = (t) =>
    persist({ ...state, tasks: [...state.tasks, { ...t, id: id(), createdAt: new Date().toISOString() }] });
  const updateTask: AppStoreValue["updateTask"] = (taskId, patch) =>
    persist({ ...state, tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)) });
  const deleteTask: AppStoreValue["deleteTask"] = (taskId) => persist({ ...state, tasks: state.tasks.filter((t) => t.id !== taskId) });

  // -------------------- psychology --------------------
  const addPsychologyLog: AppStoreValue["addPsychologyLog"] = (p) =>
    persist({ ...state, psychologyLogs: [{ ...p, id: id() }, ...state.psychologyLogs] });
  const deletePsychologyLog: AppStoreValue["deletePsychologyLog"] = (logId) =>
    persist({ ...state, psychologyLogs: state.psychologyLogs.filter((p) => p.id !== logId) });

  // -------------------- settings --------------------
  const updateSettings: AppStoreValue["updateSettings"] = (patch) =>
    persist({ ...state, settings: { ...state.settings, ...patch } });

  const setActiveAccountId = (accId: string | "all") => persist({ ...state, activeAccountId: accId });

  // -------------------- backup --------------------
  const exportData = () => JSON.stringify(state, null, 2);
  const importData = (json: string) => {
    try {
      const parsed = JSON.parse(json);
      persist({ ...buildSeed(), ...parsed });
    } catch {
      // invalid JSON - caller should surface a toast
    }
  };
  const resetData = () => persist(buildSeed());

  const visibleAccounts = useMemo(
    () => (state.activeAccountId === "all" ? state.accounts : state.accounts.filter((a) => a.id === state.activeAccountId)),
    [state.accounts, state.activeAccountId]
  );
  const visibleTrades = useMemo(
    () => (state.activeAccountId === "all" ? state.trades : state.trades.filter((t) => t.accountId === state.activeAccountId)),
    [state.trades, state.activeAccountId]
  );

  const value: AppStoreValue = {
    ...state,
    loading,
    setActiveAccountId,
    visibleAccounts,
    visibleTrades,
    addAccount, updateAccount, deleteAccount,
    addTrade, updateTrade, deleteTrade,
    addGoal, updateGoal, deleteGoal,
    addTask, updateTask, deleteTask,
    addPsychologyLog, deletePsychologyLog,
    updateSettings,
    exportData, importData, resetData,
  };

  return <AppStoreCtx.Provider value={value}>{children}</AppStoreCtx.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreCtx);
  if (!ctx) throw new Error("useAppStore must be used within an AppStoreProvider");
  return ctx;
}
