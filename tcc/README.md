# Trading Command Center

A professional, institutional-style trading operating system — dashboard, multi-account manager, trade journal, trading calendar with a rich document-style journal, analytics, psychology tracking, goals, tasks, and notes. Built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS**, architected for **Supabase**.

The app runs fully standalone on local browser storage (seeded with sample data matching the Supabase schema exactly), so you can clone it, run it, and see a complete working product with zero configuration. Supabase is fully scaffolded — schema, RLS policies, client/server helpers, and example API routes — and wiring it up is a documented, mechanical step (see [Connecting Supabase](#connecting-supabase)).

> **Status note:** Watchlist, the Economic News Calendar, and the standalone Notes page were intentionally removed to keep the product focused (see [Scope Changes](#scope-changes) below). All journaling now happens exclusively inside the Calendar's Trade Journal, which supports headings, bold/italic/underline, bullet/numbered/checklist lists, quotes, code blocks, tables, dividers, multi-image paste/drag-drop/upload, and a full-screen zoomable lightbox. The app now ships a complete dark/light theme system with a toggle in the Topbar.

---

## Table of Contents

1. [Features](#features)
2. [Scope Changes](#scope-changes)
3. [Tech Stack](#tech-stack)
4. [Folder Structure](#folder-structure)
5. [Installation](#installation)
6. [Environment Variables](#environment-variables)
7. [Local Development](#local-development)
8. [Connecting Supabase](#connecting-supabase)
9. [Production Build](#production-build)
10. [Deploying to GitHub](#deploying-to-github)
11. [Deploying to Vercel](#deploying-to-vercel)
12. [Architecture Notes](#architecture-notes)

---

## Features

- **Dashboard** — total balance, equity, daily/weekly/monthly P/L, overall profit, win rate, avg risk %, avg R:R, total/open/closed trades, drawdown, profit factor, equity curve, monthly performance, win/loss distribution, recent trades
- **Multi Account Manager** — unlimited accounts, instant account switching (all stats recompute per-account), broker/type/status tracking
- **Trade Journal** — account, pair, direction, session, date/time, lot size, risk $/%, R:R, profit/loss, screenshots before/after, quick notes, psychology notes, mistakes, lessons — search/filter/sort, edit/delete
- **Trading Calendar & Journal** — every day is a colored card (green/red) showing that day's total P/L and trade count; tap a day to see every trade taken as its own colored summary card; tap a trade to open a full trading notebook: headings, bold/italic/underline, bullet/numbered/checklist lists, quotes, code blocks, tables, dividers, links, and multi-image paste/drag-drop/upload (no "enter image URL" prompts) with inline display and a full-screen zoomable lightbox on click. A one-click "Journal Template" button scaffolds sections for why you entered, market analysis, emotions, mistakes, and lessons learned. This is the only place journaling happens in the app — there's no separate Notes page.
- **Dark / Light theme** — toggle in the Topbar, persisted to `localStorage`, applied instantly with no flash on reload. Every page, chart, card, table, form, and modal supports both themes.
- **Analytics** — profit grouped by month/week/day/session/pair, win/loss split, account growth, detailed equity curve, activity heat map, streak and drawdown stats
- **Psychology** — emotion before/after, confidence & discipline sliders, mistakes, rules broken, lessons, daily journal, and a live correlation panel that compares P/L on high- vs low-confidence/discipline days
- **Goals** — daily/weekly/monthly/yearly targets, funded challenge progress with checklists, payout tracking, account growth goals — time-based and growth goals auto-update live from your trades
- **Tasks** — categorized (Trading/Personal/Study/Health/Business), recurring tasks, daily checklist
- **Settings** — profile, currency, timezone, default risk %, full JSON backup/restore, data reset
- **Notifications** — auto-generated from tasks due today and goals nearing deadline
- Loading skeletons, empty states, inline validation, toast notifications, and delete confirmations throughout
- Fully responsive — sidebar nav on desktop, bottom tab bar + FAB on mobile, tablet-optimized grid breakpoints

## Scope Changes

This build intentionally removes two features that shipped earlier in the project's life, to keep the app focused on trade review and journaling rather than live market data:

- **Watchlist** — removed entirely (page, nav entry, types, store state, seed data). It only ever showed simulated prices and added surface area without a real data source.
- **Economic News Calendar** — removed entirely (page, nav entry, types, store state, seed data). Same reasoning — it only ever showed sample events.
- **Trade fields simplified** — `Entry Price`, `Stop Loss`, `Take Profit`, and `Strategy` were removed from the `Trade` type, the trade entry/edit form, the trades table, trade cards, the calendar's trade card, analytics groupings, and the Supabase schema. Risk ($/%) and Risk:Reward (R:R) remain as manually entered fields — they were never derived from Entry/SL/TP, so removing those three fields doesn't affect risk/R:R math anywhere in the app.
- **Standalone Notes page removed** — folders/tags/markdown notes were consolidated into the Calendar's Trade Journal, which is now the single place journaling happens. `react-markdown` was removed from dependencies since it had no other consumer.
- **Dark/light theme system added** — see [Architecture Notes](#architecture-notes) for how it's implemented (CSS variables + Tailwind color remapping, not a component-by-component rewrite).

If you want either of the removed features back, `git log` / your version history is the fastest way to recover the old `app/watchlist`, `app/news`, and the wider `Trade` type — nothing about the current architecture prevents re-adding them later as opt-in modules.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | lucide-react |
| Rich text editor (Trade Journal) | Tiptap (`@tiptap/react`, `starter-kit`, `extension-image`, `extension-link`, `extension-underline`, `extension-task-list`, `extension-task-item`, `extension-table`, `extension-placeholder`) |
| Database (ready) | Supabase (Postgres + Auth + RLS) |
| Local persistence (default) | Browser `localStorage`, schema-matched to Supabase |

## Folder Structure

```
trading-command-center/
├── app/                          # Next.js App Router
│   ├── layout.tsx                 # Root layout: fonts, providers, AppShell
│   ├── globals.css                # Tailwind directives + base styles
│   ├── page.tsx                   # Redirects to /dashboard
│   ├── dashboard/page.tsx
│   ├── accounts/page.tsx
│   ├── trades/page.tsx
│   ├── calendar/page.tsx
│   ├── analytics/page.tsx
│   ├── psychology/page.tsx
│   ├── goals/page.tsx
│   ├── tasks/page.tsx
│   ├── settings/page.tsx
│   ├── notifications/page.tsx
│   └── api/
│       ├── trades/route.ts        # Example Supabase CRUD route
│       └── accounts/route.ts      # Example Supabase CRUD route
├── components/
│   ├── layout/                    # Sidebar, Topbar, AppShell
│   ├── ui/                        # Panel, Badge, Button, Modal, Toast, EmptyState, PageLoading, StatCard
│   ├── charts/                    # EquityCurve, ProfitBar, WinLossPie, DailyPerformance, Heatmap
│   ├── trades/                    # TradeModal, TradeTable
│   ├── accounts/                  # AccountCard, AccountModal
│   └── calendar/                  # CalendarGrid, DayDrawer, TradeCard, TradeJournalModal, TradeJournalEditor
├── lib/
│   ├── supabase/                  # client.ts (browser), server.ts (route handlers)
│   ├── store/AppStoreContext.tsx  # Central state — all CRUD, localStorage persistence
│   ├── data/seed.ts               # Seed/mock data generators (accounts, trades, goals, tasks, notes, psychology)
│   └── utils/                     # format.ts, stats.ts, goals.ts, notifications.ts, id.ts
├── types/index.ts                 # All domain types — mirrors the Supabase schema 1:1
├── supabase/schema.sql            # Full Postgres schema + RLS policies
├── public/                        # Static assets
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
└── postcss.config.js
```

## Installation

Requires **Node.js 18.17+** and npm (or pnpm/yarn).

```bash
# 1. Extract the project and move into it
cd trading-command-center

# 2. Install dependencies
npm install

# 3. Copy the environment template
cp .env.example .env.local

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on `/dashboard` with sample data already seeded.

### Required packages

All are already declared in `package.json`; `npm install` fetches them:

- `next`, `react`, `react-dom` — framework
- `typescript`, `@types/node`, `@types/react`, `@types/react-dom` — TypeScript
- `tailwindcss`, `postcss`, `autoprefixer` — styling
- `recharts` — charts
- `lucide-react` — icons
- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/extension-underline`, `@tiptap/extension-task-list`, `@tiptap/extension-task-item`, `@tiptap/extension-table`, `@tiptap/extension-table-row`, `@tiptap/extension-table-cell`, `@tiptap/extension-table-header`, `@tiptap/extension-placeholder`, `@tiptap/pm` — the trade journal's rich text editor
- `@supabase/supabase-js`, `@supabase/ssr` — Supabase clients
- `eslint`, `eslint-config-next` — linting

## Environment Variables

Copy `.env.example` to `.env.local` and fill in what you need:

```bash
# Supabase (optional — app works without these on local storage)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

None of these are required to run the app locally — everything degrades gracefully to local storage and realistic mock data.

## Local Development

```bash
npm run dev      # start dev server with hot reload
npm run lint      # run ESLint
npm run build     # production build (also type-checks)
npm run start     # run the production build locally
```

The app's state lives in `lib/store/AppStoreContext.tsx`. It seeds sample data on first load (`lib/data/seed.ts`), persists every change to `localStorage` under the key `tcc:data:v1`, and exposes typed CRUD actions (`addTrade`, `updateAccount`, `addGoal`, etc.) via the `useAppStore()` hook used throughout `app/*/page.tsx`.

## Connecting Supabase

The app is fully usable without Supabase. To make it multi-device / multi-user:

1. **Create a Supabase project** at [supabase.com](https://supabase.com).
2. **Run the schema**: open the SQL editor in your Supabase dashboard and run the contents of `supabase/schema.sql`. This creates all tables (`accounts`, `trades`, `goals`, `tasks`, `notes`, `psychology_logs`, `app_settings`) with row-level security scoped to `auth.uid()`.
3. **Add credentials** to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. **Add authentication.** The schema assumes a logged-in `auth.uid()` for every row. The simplest option is Supabase's magic-link email auth — add a `/login` page using `createClient()` from `lib/supabase/client.ts` and `supabase.auth.signInWithOtp(...)`.
5. **Swap the store's persistence.** `lib/store/AppStoreContext.tsx` currently reads/writes `localStorage`. Two working example routes already show the pattern: `app/api/trades/route.ts` and `app/api/accounts/route.ts` (GET/POST/PATCH/DELETE against Supabase with RLS). Replicate that pattern for the remaining resources (goals, tasks, psychology_logs, app_settings), then replace the body of each action in `AppStoreContext.tsx` with a `fetch('/api/...')` call instead of `persist(...)`.
6. **Migrate existing local data (optional).** Settings → Backup → Export Backup gives you the exact JSON shape (matching the Supabase tables). Write a one-off script or admin route to bulk-insert it once you're on Supabase.

This is intentionally a mechanical, low-risk migration — the component layer never talks to storage directly, it only calls `useAppStore()`, so swapping the implementation inside the provider doesn't require touching any page or component.

## Production Build

```bash
npm run build
npm run start
```

`next build` type-checks the entire project — if it completes, there are no TypeScript errors.

## Deploying to GitHub

```bash
git init
git add .
git commit -m "Initial commit — Trading Command Center"
git branch -M main
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

`.gitignore` already excludes `node_modules`, `.next`, and `.env*.local`, so secrets won't be committed.

## Deploying to Vercel

1. Push the repo to GitHub (above).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Framework preset: **Next.js** (auto-detected, no config needed).
4. Add the same environment variables from `.env.local` under Project Settings → Environment Variables (only add the ones you're actually using — Supabase is entirely optional).
5. Deploy. Vercel builds with `next build` and serves the App Router natively, including the `app/api` route handlers.

Any other Next.js-compatible host (Netlify, Cloudflare Pages, self-hosted Node) works too, since nothing here is Vercel-specific beyond the standard Next.js build output.

## Architecture Notes

- **Single source of truth**: `AppStoreProvider` (in `app/layout.tsx`) wraps the whole app. Every page reads and writes through `useAppStore()` — there is no prop-drilling and no page-local copies of shared data, which is what makes cross-page sync automatic: adding a trade updates the account balance, and every page that derives stats from `trades`/`accounts` re-renders with the new numbers on its next paint.
- **Derived stats, not stored stats**: Dashboard/Analytics/Calendar/Goals never store computed numbers (win rate, drawdown, equity curve, goal progress) — they're recalculated from raw `trades`/`accounts` on every render via `lib/utils/stats.ts` and `lib/utils/goals.ts`. This is what guarantees they can't drift out of sync.
- **Schema-first**: `types/index.ts` and `supabase/schema.sql` are written to match field-for-field, so the local store and a future Supabase-backed store are interchangeable behind the same `useAppStore()` interface.
- **Hydration-safe seeding**: `AppStoreContext`'s initial `useState` uses a deterministic `emptyState()` (no `Math.random()`, no `Intl` timezone lookup) so the server-rendered HTML and the client's pre-hydration render always match exactly. Randomized sample data (`buildSeed()`, in `lib/data/seed.ts`) is only ever generated inside the client-only mount `useEffect`, after hydration completes. Don't move seeding back into the `useState` initializer or a component's render body — that reintroduces server/client mismatches.
- **Balance vs. equity semantics**: closed trades affect both `currentBalance` (realized) and `equity`; open trades affect only `equity` (floating P/L), matching how real trading accounts work. `updateTrade` also correctly moves the P/L effect between accounts if a trade's account is changed on edit, rather than assuming the account never changes.
- **Trade journal storage**: each trade's rich journal entry (`Trade.journal`) is stored as an HTML string, same as `screenshotBefore`/`screenshotAfter` are stored as base64 data URLs — no file storage or upload endpoint required for the local/demo setup. `components/calendar/TradeJournalEditor.tsx` sets `immediatelyRender: false` on Tiptap's `useEditor` specifically to avoid a server/client hydration mismatch under the Next.js App Router (the same class of bug documented in the hydration-safe seeding note above). If you move to Supabase and multiple people can view each other's journals, sanitize `journal` HTML server-side (e.g. with `isomorphic-dompurify`) before rendering, since it's currently trusted, single-user content. Clicking any image inside a journal entry opens `components/calendar/ImageLightbox.tsx`, a full-screen viewer with zoom controls (buttons, scroll wheel, +/-/0 keyboard shortcuts).
- **Theme system**: implemented as a CSS-variable remap rather than a component-by-component `dark:` rewrite. Every `zinc-*` shade the app uses, plus the `-400` shade of `emerald`/`rose`/`blue`/`amber`, is redefined in `tailwind.config.ts` to resolve to `rgb(var(--x) / <alpha-value>)`. `app/globals.css` defines those variables twice — once under `:root` (dark, the default) and once under `:root.light` (an inversion of the zinc ramp, plus darker accent shades for contrast on white). Toggling `.light` on `<html>` therefore re-themes the entire app without touching component code. `lib/theme/ThemeContext.tsx` owns the toggle and persists it to `localStorage` under `tcc:theme`; `app/layout.tsx` injects a small blocking `<script>` (`THEME_INIT_SCRIPT`) that applies the stored theme *before* React hydrates, which is what prevents a flash of the wrong theme on reload — this requires `suppressHydrationWarning` on `<html>`, which is the standard, documented pattern for this exact problem. Recharts components can't consume Tailwind classes (they need literal color strings for SVG props), so `lib/utils/chartColors.ts` provides a small light/dark hex palette that the five chart components read via `useTheme()`.

## Audit Methodology Note

This project was verified through several rounds of static auditing (bracket/syntax balance across every file, `@/` import graph resolution, unused-import detection, duplicate-file/duplicate-export detection, React hook-ordering safety, hydration-safety code tracing, and manual tracing of the balance/calendar/goals sync logic) since this sandbox has no network access to run a real `npm install`. Before your first real deploy, run the actual toolchain (`npm install && npm run lint && npm run build`) — with real `node_modules` and `@types/react` installed, that will give an authoritative answer.
