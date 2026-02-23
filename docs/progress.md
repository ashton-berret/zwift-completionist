# Zwift Route Tracker - Progress

## Project Status: Phase 1-5 Complete
**Last Updated:** 2026-02-23
**Plan:** See `docs/plan.md` for full implementation details

---

## Phase Tracking

### Phase 1: Project Setup & Auth
- [x] Initialize SvelteKit project with TypeScript
- [x] Install all dependencies (prisma, tailwindcss, lucia, echarts, pdf-parse, winston, etc.)
- [x] Set up Prisma with SQLite, create schema (User, Session, Route, CompletedRide, ImportHistory)
- [x] Run initial migration
- [x] Create `src/app.css` with neon orange theme variables
- [x] Create `src/app.html` with flash prevention script (key: `zwift-theme`)
- [x] Set up `src/app.d.ts` with Lucia types
- [x] Set up `src/hooks.server.ts` for session validation
- [x] Create `src/lib/server/auth/lucia.ts` - Lucia config
- [x] Create `src/lib/server/auth/password.ts` - Argon2 hashing
- [x] Create `src/lib/server/db/client.ts` - Prisma singleton
- [x] Create `src/lib/server/utils/logger.ts` - Winston logger
- [x] Create `src/lib/config/theme.ts` - Orange dark/light theme objects
- [x] Create `src/lib/config/chartTheme.ts` - ECharts theme with orange palette
- [x] Create `src/lib/stores/theme.ts` - Theme store (key: `zwift-theme`)
- [x] Create `src/lib/stores/index.ts` - Store exports
- [x] Create base UI components: Button, Card, Input, Select, Modal, index.ts
- [x] Create `src/lib/components/charts/EChart.svelte` - Base chart wrapper
- [x] Create `src/lib/components/layout/Navigation.svelte` - Sidebar (Dashboard, Routes, Import, Settings)
- [x] Create auth routes: `/login`, `/register`, `/logout`
- [x] Create root layout: `+layout.server.ts`, `+layout.svelte`
- [x] Create redirect page: `/+page.server.ts` (redirect to /dashboard or /login)
- [x] Create placeholder pages: `/dashboard`, `/routes`, `/import`, `/settings`
- [x] Verify: `bun run check` passes, dev server starts, register/login works

### Phase 2: PDF Import & Route Database
- [x] Create `src/lib/types/route.ts` - Route, CompletedRide, ParsedRoute types
- [x] Create `src/lib/types/import.ts` - PDF import types
- [x] Create `src/lib/types/analytics.ts` - Dashboard stat types
- [x] Create `src/lib/types/index.ts` - All type exports
- [x] Create `src/lib/server/db/repositories/route-repository.ts` - Route CRUD + queries
- [x] Create `src/lib/server/db/repositories/index.ts` - Repository exports
- [x] Create `src/lib/server/services/import/pdf-route-parser.ts` - PDF text extraction and route parsing
- [x] Create CSV fallback parser for easy route import
- [x] Create `src/lib/server/services/import/index.ts` - Service exports
- [x] Build `/import/+page.server.ts` - preview and import actions
- [x] Build `/import/+page.svelte` - `routes.csv` root-file preview table, confirm import, import history
- [x] Test: parse/import from root `routes.csv`, verify routes appear in Prisma database

### Phase 3: Route List & Ride Logging
- [x] Create `src/lib/server/db/repositories/completed-ride-repository.ts` - Ride log CRUD + stats
- [x] Create `src/lib/components/routes/RouteCard.svelte` - Route row with checkbox, info, badges
- [x] Create `src/lib/components/routes/RideModal.svelte` - Log ride details modal
- [x] Create `src/lib/components/routes/RouteFilters.svelte` - Search, world, difficulty, status, sort
- [x] Build `/routes/+page.server.ts` - Load routes with completion status, handle completeRide/uncompleteRide/updateRide
- [x] Build `/routes/+page.svelte` - Interactive route list with filters and ride logging
- [x] Implement client-side filtering and sorting
- [x] Test: browse routes, check off rides, add details, uncomplete rides

### Phase 4: Dashboard & Charts
- [x] Create `src/lib/server/services/analytics/stats-calculator.ts` - All dashboard computations
- [x] Create `src/lib/server/services/analytics/index.ts` - Service exports
- [x] Build `/dashboard/+page.server.ts` - Load all stats and chart data
- [x] Build `/dashboard/+page.svelte` - Metric cards + chart grid
- [x] Create metric cards: Routes Completed, Total Distance, Total Elevation, Total Ride Time
- [x] Create `CompletionByWorld.svelte` - Donut chart
- [x] Create `WeeklyActivity.svelte` - Bar + line chart (distance + time per week)
- [x] Create `DifficultyDistribution.svelte` - Horizontal stacked bar chart
- [x] Create `MonthlyProgress.svelte` - Cumulative area chart
- [x] Add Recent Rides list card
- [x] Add weekly/monthly stat summary cards
- [x] Test: dashboard loads with real data, all charts render correctly

### Phase 5: Polish
- [x] Add empty states (no routes imported, no rides logged)
- [x] Add loading states for forms and page transitions
- [x] Build `/settings/+page.svelte` - Theme toggle, unit preferences (km/mi)
- [x] Create `src/lib/utils/format.ts` - Distance, elevation, time, relative date formatters
- [x] Responsive design improvements
- [x] Add total XP earned/available stat
- [x] Add prominent overall completion progress bar

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | SvelteKit 2.x + Svelte 5 | Same as budget project, excellent DX |
| Database | SQLite + Prisma | No server needed, type-safe |
| Styling | TailwindCSS 4.x | Same as budget, utility-first |
| Charts | ECharts 5.x | Same as budget, powerful and flexible |
| Auth | Lucia 3.x | Same as budget, simple session auth |
| Primary Color | `#FF6B00` (neon orange) | Distinct from budget's green, Zwift-inspired energy |
| PDF Parsing | pdf-parse | Same as budget, proven PDF text extraction |
| Units | Dual km/mi stored | Zwift community uses both, avoid conversion loss |
| Routes | Global (not per-user) | All users ride the same Zwift routes |
| Package Manager | Bun | Same as budget, fast |

---

## File Count Estimates

| Category | Count |
|----------|-------|
| UI Components | 10 (6 base + 4 new) |
| Chart Components | 5 (1 base + 4 charts) |
| Server Routes | 7 (login, register, logout, dashboard, routes, import, settings) |
| Services | 3 (pdf-parser, stats-calculator, logger) |
| Repositories | 2 (route, completed-ride) |
| Type Files | 4 (route, import, analytics, index) |
| Config Files | 3 (theme, chartTheme, prisma) |
| Store Files | 2 (theme, index) |
| **Total New Files** | **~40** |

---

## Notes

- Zwift has approximately 80-130 cycling routes across ~10 worlds (as of early 2026)
- Route data can be sourced from official Zwift route PDFs or community-maintained spreadsheets
- The app is single-user focused but supports multiple users via auth
- No external API calls needed - all data is local
- The route list page should feel snappy since all ~130 routes can be loaded at once (client-side filtering)


