# Zwift Route Tracker - Complete Implementation Plan

A personal Zwift route completion tracker. Import all Zwift routes from a PDF, check them off as you ride, log details, and view fun stats on a dashboard with interactive charts.

**This plan is fully self-contained.** All file contents, configurations, and source code are included inline so the project can be built from scratch without referencing any other codebase.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack & Dependencies](#tech-stack--dependencies)
3. [Color Scheme](#color-scheme)
4. [Database Schema](#database-schema)
5. [Project Structure](#project-structure)
6. [Configuration Files](#configuration-files)
7. [Source Files - Foundation](#source-files---foundation)
8. [Source Files - UI Components](#source-files---ui-components)
9. [Source Files - Auth Pages](#source-files---auth-pages)
10. [Pages & Routes](#pages--routes)
11. [PDF Import](#pdf-import)
12. [Dashboard Stats & Charts](#dashboard-stats--charts)
13. [Implementation Phases](#implementation-phases)

---

## Project Overview

### Goal
Track progress through all Zwift cycling routes. Import route data (name, world, distance, elevation, lead-in, badge XP, difficulty) from a PDF export. Mark routes as completed, add ride details (date, time, perceived difficulty, notes). View progress via interactive charts and stats.

### Core Principles
- **No external APIs required** - all data from manual PDF import and user input
- **SvelteKit + Prisma + TailwindCSS + ECharts** full-stack app
- **Dark-first with neon orange** - cyberpunk aesthetic, orange accents
- **Two main pages** - Dashboard (stats/charts) and Routes (interactive list)
- **Simple auth** - Lucia session-based, single user is fine

---

## Tech Stack & Dependencies

### Initialize Project

```bash
bunx sv create zwift-tracker
# Select: SvelteKit minimal, TypeScript, no additional options
cd zwift-tracker
```

### package.json

```json
{
  "name": "zwift-tracker",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "prepare": "svelte-kit sync || echo ''",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch"
  },
  "devDependencies": {
    "@oslojs/crypto": "^1.0.1",
    "@oslojs/encoding": "^1.1.0",
    "@sveltejs/adapter-auto": "^7.0.0",
    "@sveltejs/kit": "^2.49.1",
    "@sveltejs/vite-plugin-svelte": "^6.2.1",
    "@tailwindcss/vite": "^4.1.18",
    "@types/node": "^25.0.8",
    "prisma": "^7.2.0",
    "svelte": "^5.45.6",
    "svelte-check": "^4.3.4",
    "tailwindcss": "^4.1.18",
    "typescript": "^5.9.3",
    "vite": "^7.2.6"
  },
  "dependencies": {
    "@libsql/client": "^0.17.0",
    "@lucia-auth/adapter-prisma": "^4.0.1",
    "@node-rs/argon2": "^2.0.2",
    "@prisma/adapter-libsql": "^7.2.0",
    "@prisma/client": "^7.2.0",
    "dotenv": "^17.2.3",
    "echarts": "^6.0.0",
    "lucia": "^3.2.2",
    "papaparse": "^5.5.3",
    "pdf-parse": "1.1.1",
    "winston": "^3.19.0"
  }
}
```

After creating `package.json`, run `bun install`.

---

## Color Scheme

### Neon Orange Dark Theme (Default)

```css
:root {
    --color-bg-base: #0E100F;
    --color-bg-surface: #161818;
    --color-bg-surface-elevated: #1E2020;
    --color-bg-surface-overlay: #262828;
    --color-primary: #FF6B00;
    --color-primary-hover: #E55F00;
    --color-primary-glow: rgba(255, 107, 0, 0.4);
    --color-secondary: #FFB800;
    --color-success: #0AE448;
    --color-warning: #FFB800;
    --color-danger: #FF4757;
    --color-text-primary: #F5F5F5;
    --color-text-secondary: #A3A3A3;
    --color-text-muted: #6B6B6B;
    --color-border: #2D2D2D;
    --color-border-hover: #3D3D3D;
}
```

### Light Theme Override

```css
.light {
    --color-bg-base: #F3F4F6;
    --color-bg-surface: #FFFFFF;
    --color-bg-surface-elevated: #FFFFFF;
    --color-bg-surface-overlay: #F9FAFB;
    --color-primary: #EA580C;
    --color-primary-hover: #C2410C;
    --color-primary-glow: rgba(234, 88, 12, 0.3);
    --color-secondary: #F59E0B;
    --color-success: #10B981;
    --color-warning: #F59E0B;
    --color-danger: #EF4444;
    --color-text-primary: #111827;
    --color-text-secondary: #6B7280;
    --color-text-muted: #9CA3AF;
    --color-border: #E5E7EB;
    --color-border-hover: #D1D5DB;
}
```

### World/Map Colors (for charts)

| World | Hex |
|-------|-----|
| Watopia | `#FF6B00` |
| London | `#3B82F6` |
| New York | `#FFB800` |
| Innsbruck | `#0AE448` |
| Richmond | `#8B5CF6` |
| Yorkshire | `#EC4899` |
| France | `#00D4FF` |
| Paris | `#14B8A6` |
| Makuri Islands | `#FF4757` |
| Scotland | `#84CC16` |

---

## Database Schema

### `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
}

// ============================================
// AUTHENTICATION
// ============================================

model User {
  id           String    @id @default(cuid())
  username     String    @unique
  passwordHash String
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  sessions       Session[]
  completedRides CompletedRide[]
}

model Session {
  id        String   @id
  userId    String
  expiresAt DateTime

  user User @relation(references: [id], fields: [userId], onDelete: Cascade)

  @@index([userId])
}

// ============================================
// ROUTES (imported from PDF)
// ============================================

model Route {
  id              String   @id @default(cuid())
  name            String   @unique
  world           String
  distanceKm      Float
  distanceMi      Float
  elevationM      Float
  elevationFt     Float
  leadInKm        Float    @default(0)
  leadInMi        Float    @default(0)
  badgeXp         Int      @default(0)
  difficulty      String
  difficultyScore Int      @default(1)
  eventOnly       Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  completedRides CompletedRide[]
}

// ============================================
// COMPLETED RIDES (user ride log)
// ============================================

model CompletedRide {
  id                  String   @id @default(cuid())
  userId              String
  routeId             String
  rideDate            DateTime
  rideTimeMinutes     Int?
  avgPowerWatts       Int?
  avgHeartRate        Int?
  perceivedDifficulty Int?
  notes               String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  route Route @relation(fields: [routeId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([routeId])
  @@index([userId, rideDate])
}

// ============================================
// IMPORT HISTORY
// ============================================

model ImportHistory {
  id            String       @id @default(cuid())
  fileName      String
  routeCount    Int
  newRoutes     Int
  updatedRoutes Int
  status        ImportStatus
  errors        String?
  importedAt    DateTime     @default(now())
}

enum ImportStatus {
  SUCCESS
  PARTIAL
  FAILED
}
```

### Schema Design Decisions

1. **Routes are global** - not per-user. All users see the same Zwift routes.
2. **CompletedRide links User to Route** - a user can complete the same route multiple times.
3. **Dual units** - store both km/mi and m/ft. Calculate on import.
4. **Difficulty as both string and int** - string for display ("2/5"), int for sorting/filtering.
5. **Optional ride metrics** - time, power, HR, perceived difficulty are all optional.

After creating the schema, run:
```bash
bunx prisma migrate dev --name initial_schema
```

---

## Project Structure

```
src/
├── app.css
├── app.html
├── app.d.ts
├── hooks.server.ts
│
├── lib/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.svelte
│   │   │   ├── Card.svelte
│   │   │   ├── Input.svelte
│   │   │   ├── Select.svelte
│   │   │   ├── Modal.svelte
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   └── Navigation.svelte
│   │   ├── charts/
│   │   │   ├── EChart.svelte
│   │   │   ├── CompletionByWorld.svelte
│   │   │   ├── DifficultyDistribution.svelte
│   │   │   ├── WeeklyActivity.svelte
│   │   │   └── MonthlyProgress.svelte
│   │   └── routes/
│   │       ├── RouteCard.svelte
│   │       ├── RideModal.svelte
│   │       └── RouteFilters.svelte
│   │
│   ├── config/
│   │   ├── theme.ts
│   │   └── chartTheme.ts
│   │
│   ├── server/
│   │   ├── auth/
│   │   │   ├── lucia.ts
│   │   │   └── password.ts
│   │   ├── db/
│   │   │   ├── client.ts
│   │   │   └── repositories/
│   │   │       ├── route-repository.ts
│   │   │       ├── completed-ride-repository.ts
│   │   │       └── index.ts
│   │   ├── services/
│   │   │   ├── import/
│   │   │   │   ├── pdf-route-parser.ts
│   │   │   │   └── index.ts
│   │   │   └── analytics/
│   │   │       ├── stats-calculator.ts
│   │   │       └── index.ts
│   │   └── utils/
│   │       └── logger.ts
│   │
│   ├── stores/
│   │   ├── theme.ts
│   │   └── index.ts
│   │
│   ├── types/
│   │   ├── route.ts
│   │   ├── analytics.ts
│   │   ├── import.ts
│   │   └── index.ts
│   │
│   └── utils/
│       └── format.ts
│
├── routes/
│   ├── +layout.server.ts
│   ├── +layout.svelte
│   ├── +page.server.ts
│   ├── +page.svelte
│   ├── login/
│   │   ├── +page.server.ts
│   │   └── +page.svelte
│   ├── register/
│   │   ├── +page.server.ts
│   │   └── +page.svelte
│   ├── logout/
│   │   └── +page.server.ts
│   ├── dashboard/
│   │   ├── +page.server.ts
│   │   └── +page.svelte
│   ├── routes/
│   │   ├── +page.server.ts
│   │   └── +page.svelte
│   ├── import/
│   │   ├── +page.server.ts
│   │   └── +page.svelte
│   └── settings/
│       ├── +page.server.ts
│       └── +page.svelte
│
└── prisma/
    └── schema.prisma
```

---

## Configuration Files

### `vite.config.ts`

```typescript
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [tailwindcss(), sveltekit()],
});
```

### `svelte.config.js`

```javascript
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),
    kit: {
        adapter: adapter()
    }
};

export default config;
```

### `tsconfig.json`

```json
{
    "extends": "./.svelte-kit/tsconfig.json",
    "compilerOptions": {
        "rewriteRelativeImportExtensions": true,
        "allowJs": true,
        "checkJs": true,
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        "resolveJsonModule": true,
        "skipLibCheck": true,
        "sourceMap": true,
        "strict": true,
        "moduleResolution": "bundler"
    }
}
```

### `.env`

```bash
DATABASE_URL="file:./prisma/zwift.db"
NODE_ENV="development"
LOG_LEVEL="debug"
```

### `.gitignore`

```
node_modules
.output
.vercel
.netlify
.wrangler
/.svelte-kit
/build
.DS_Store
Thumbs.db
.env
.env.*
!.env.example
vite.config.js.timestamp-*
vite.config.ts.timestamp-*
*.db
*.db-journal
prisma/zwift.db
/generated
bun.lockb
nul
logs/
```

---

## Source Files - Foundation

### `src/app.css`

```css
@import "tailwindcss";

/* Theme CSS Variables - Dark mode as default (Neon Orange) */
:root {
    --color-bg-base: #0E100F;
    --color-bg-surface: #161818;
    --color-bg-surface-elevated: #1E2020;
    --color-bg-surface-overlay: #262828;
    --color-primary: #FF6B00;
    --color-primary-hover: #E55F00;
    --color-primary-glow: rgba(255, 107, 0, 0.4);
    --color-secondary: #FFB800;
    --color-success: #0AE448;
    --color-warning: #FFB800;
    --color-danger: #FF4757;
    --color-text-primary: #F5F5F5;
    --color-text-secondary: #A3A3A3;
    --color-text-muted: #6B6B6B;
    --color-border: #2D2D2D;
    --color-border-hover: #3D3D3D;
}

/* Light mode overrides */
.light {
    --color-bg-base: #F3F4F6;
    --color-bg-surface: #FFFFFF;
    --color-bg-surface-elevated: #FFFFFF;
    --color-bg-surface-overlay: #F9FAFB;
    --color-primary: #EA580C;
    --color-primary-hover: #C2410C;
    --color-primary-glow: rgba(234, 88, 12, 0.3);
    --color-secondary: #F59E0B;
    --color-success: #10B981;
    --color-warning: #F59E0B;
    --color-danger: #EF4444;
    --color-text-primary: #111827;
    --color-text-secondary: #6B7280;
    --color-text-muted: #9CA3AF;
    --color-border: #E5E7EB;
    --color-border-hover: #D1D5DB;
}

html {
    transition: background-color 0.2s ease, color 0.2s ease;
}

body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background-color: var(--color-bg-base);
    color: var(--color-text-primary);
    transition: background-color 0.2s ease, color 0.2s ease;
}

.card-glow {
    transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

.card-glow:hover {
    box-shadow:
        0 0 20px var(--color-primary-glow),
        0 0 40px var(--color-primary-glow);
    border-color: var(--color-primary);
}

.btn-glow {
    transition: box-shadow 0.3s ease;
}

.btn-glow:hover:not(:disabled) {
    box-shadow:
        0 0 15px var(--color-primary-glow),
        0 0 30px var(--color-primary-glow);
}

.toggle-switch {
    position: relative;
    width: 48px;
    height: 24px;
    background-color: var(--color-border);
    border-radius: 12px;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.toggle-switch.active {
    background-color: var(--color-primary);
}

.toggle-switch::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background-color: var(--color-text-primary);
    border-radius: 50%;
    transition: transform 0.2s ease;
}

.toggle-switch.active::after {
    transform: translateX(24px);
    background-color: #0E100F;
}
```

### `src/app.html`

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script>
            const stored = localStorage.getItem('zwift-theme');
            if (stored === 'light') document.documentElement.classList.add('light');
        </script>
        %sveltekit.head%
    </head>
    <body data-sveltekit-preload-data="hover">
        <div style="display: contents">%sveltekit.body%</div>
    </body>
</html>
```

### `src/app.d.ts`

```typescript
declare global {
    namespace App {
        interface Locals {
            user: import("lucia").User | null;
            session: import("lucia").Session | null;
        }
    }
}

export {};
```

### `src/hooks.server.ts`

```typescript
import type { Handle } from "@sveltejs/kit";
import { lucia } from "$lib/server/auth/lucia";

export const handle: Handle = async ({ event, resolve }) => {
    const sessionId = event.cookies.get(lucia.sessionCookieName);

    if (!sessionId) {
        event.locals.user = null;
        event.locals.session = null;
        return resolve(event);
    }

    const { session, user } = await lucia.validateSession(sessionId);

    if (session && session.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id);
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: ".",
            ...sessionCookie.attributes,
        });
    }

    if (!session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: ".",
            ...sessionCookie.attributes,
        });
    }

    event.locals.user = user;
    event.locals.session = session;

    return resolve(event);
};
```

### `src/lib/server/auth/lucia.ts`

```typescript
import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { dev } from "$app/environment";
import { prisma } from "../db/client";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            secure: !dev,
        },
    },
    getUserAttributes: (attributes) => {
        return {
            username: attributes.username,
        };
    },
});

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes;
    }
}

interface DatabaseUserAttributes {
    username: string;
}
```

### `src/lib/server/auth/password.ts`

```typescript
import { hash, verify } from "@node-rs/argon2";

const HASH_OPTIONS = {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
};

export async function hashPassword(password: string): Promise<string> {
    return await hash(password, HASH_OPTIONS);
}

export async function verifyPassword(
    hash: string,
    password: string
): Promise<boolean> {
    try {
        return await verify(hash, password, HASH_OPTIONS);
    } catch {
        return false;
    }
}

export function validatePassword(password: string): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];
    if (password.length < 8) errors.push("Password must be at least 8 characters long");
    if (password.length > 128) errors.push("Password must be less than 128 characters");
    if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter");
    if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter");
    if (!/[0-9]/.test(password)) errors.push("Password must contain at least one number");
    return { valid: errors.length === 0, errors };
}

export function validateUsername(username: string): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];
    if (username.length < 3) errors.push("Username must be at least 3 characters long");
    if (username.length > 32) errors.push("Username must be less than 32 characters");
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) errors.push("Username can only contain letters, numbers, underscores, and hyphens");
    return { valid: errors.length === 0, errors };
}
```

### `src/lib/server/db/client.ts`

```typescript
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
    url: "file:./prisma/zwift.db",
});

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: process.env.DEBUG_SQL === "true"
            ? ["query", "error", "warn"]
            : ["error"],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;
```

### `src/lib/server/utils/logger.ts`

```typescript
import winston from "winston";
import { dev } from "$app/environment";
import fs from "fs";
import path from "path";

const { combine, timestamp, printf, colorize, errors } = winston.format;

const LOG_DIR = "logs";
const LOG_FILE = "app.log";
const MAX_LOG_FILES = 5;

function rotateLogsOnStartup(): void {
    try {
        if (!fs.existsSync(LOG_DIR)) {
            fs.mkdirSync(LOG_DIR, { recursive: true });
            return;
        }
        const logPath = path.join(LOG_DIR, LOG_FILE);
        if (!fs.existsSync(logPath)) return;

        const oldestLog = path.join(LOG_DIR, `app.${MAX_LOG_FILES}.log`);
        if (fs.existsSync(oldestLog)) fs.unlinkSync(oldestLog);

        for (let i = MAX_LOG_FILES - 1; i >= 1; i--) {
            const currentFile = path.join(LOG_DIR, `app.${i}.log`);
            const nextFile = path.join(LOG_DIR, `app.${i + 1}.log`);
            if (fs.existsSync(currentFile)) fs.renameSync(currentFile, nextFile);
        }
        fs.renameSync(logPath, path.join(LOG_DIR, "app.1.log"));
    } catch (error) {
        console.error("Failed to rotate log files:", error);
    }
}

rotateLogsOnStartup();

const fileFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}] ${message}`;
    const metaKeys = Object.keys(meta);
    if (metaKeys.length > 0) {
        const metaStr = metaKeys.map(key => `${key}=${JSON.stringify(meta[key])}`).join(" ");
        log += ` | ${metaStr}`;
    }
    if (stack) log += `\n  Stack: ${stack}`;
    return log;
});

const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    const metaKeys = Object.keys(meta);
    if (metaKeys.length > 0) log += ` ${JSON.stringify(meta)}`;
    if (stack) log += `\n${stack}`;
    return log;
});

const logLevel = process.env.LOG_LEVEL || (dev ? "debug" : "info");

const transports: winston.transport[] = [
    new winston.transports.Console({
        format: combine(colorize({ all: true }), errors({ stack: true }), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), consoleFormat),
    }),
    new winston.transports.File({
        filename: path.join(LOG_DIR, LOG_FILE),
        format: combine(errors({ stack: true }), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), fileFormat),
    }),
];

export const logger = winston.createLogger({
    level: logLevel,
    format: combine(errors({ stack: true }), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), fileFormat),
    transports,
});

logger.info("=".repeat(60));
logger.info("Server started", { environment: dev ? "development" : "production" });
logger.info("=".repeat(60));

export default logger;

export function logAuth(
    event: "login" | "logout" | "register" | "login_failed",
    username: string,
    details?: Record<string, unknown>
) {
    const level = event === "login_failed" ? "warn" : "info";
    logger[level](`[AUTH] ${event.toUpperCase()}: ${username}`, details);
}

export function logError(message: string, error?: Error | unknown, context?: Record<string, unknown>) {
    if (error instanceof Error) {
        logger.error(message, { error: error.message, stack: error.stack, name: error.name, ...context });
    } else if (error) {
        logger.error(message, { error: String(error), ...context });
    } else {
        logger.error(message, context);
    }
}
```

### `src/lib/config/theme.ts`

```typescript
export const darkTheme = {
    bg: { base: '#0E100F', surface: '#161818', surfaceElevated: '#1E2020', surfaceOverlay: '#262828' },
    primary: { DEFAULT: '#FF6B00', hover: '#E55F00', glow: 'rgba(255, 107, 0, 0.4)' },
    secondary: '#FFB800',
    success: '#0AE448',
    warning: '#FFB800',
    danger: '#FF4757',
    text: { primary: '#F5F5F5', secondary: '#A3A3A3', muted: '#6B6B6B' },
    border: { DEFAULT: '#2D2D2D', hover: '#3D3D3D' },
} as const;

export const lightTheme = {
    bg: { base: '#F3F4F6', surface: '#FFFFFF', surfaceElevated: '#FFFFFF', surfaceOverlay: '#F9FAFB' },
    primary: { DEFAULT: '#EA580C', hover: '#C2410C', glow: 'rgba(234, 88, 12, 0.3)' },
    secondary: '#F59E0B',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    text: { primary: '#111827', secondary: '#6B7280', muted: '#9CA3AF' },
    border: { DEFAULT: '#E5E7EB', hover: '#D1D5DB' },
} as const;

export type ThemeMode = 'dark' | 'light';
```

### `src/lib/config/chartTheme.ts`

```typescript
import type { ThemeMode } from './theme';

export function getChartTheme(mode: ThemeMode) {
    const isDark = mode === 'dark';
    return {
        backgroundColor: 'transparent',
        textStyle: { color: isDark ? '#A3A3A3' : '#6B7280' },
        title: { textStyle: { color: isDark ? '#F5F5F5' : '#111827' } },
        legend: { textStyle: { color: isDark ? '#A3A3A3' : '#6B7280' } },
        tooltip: {
            backgroundColor: isDark ? '#1E2020' : '#FFFFFF',
            borderColor: isDark ? '#2D2D2D' : '#E5E7EB',
            textStyle: { color: isDark ? '#F5F5F5' : '#111827' },
        },
        xAxis: {
            axisLine: { lineStyle: { color: isDark ? '#2D2D2D' : '#E5E7EB' } },
            axisLabel: { color: isDark ? '#A3A3A3' : '#6B7280' },
            splitLine: { lineStyle: { color: isDark ? '#2D2D2D' : '#F3F4F6' } },
        },
        yAxis: {
            axisLine: { lineStyle: { color: isDark ? '#2D2D2D' : '#E5E7EB' } },
            axisLabel: { color: isDark ? '#A3A3A3' : '#6B7280' },
            splitLine: { lineStyle: { color: isDark ? '#2D2D2D' : '#F3F4F6' } },
        },
        color: isDark
            ? ['#FF6B00', '#FFB800', '#00D4FF', '#0AE448', '#8B5CF6', '#EC4899', '#FF4757', '#14B8A6']
            : ['#EA580C', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#EF4444', '#14B8A6'],
    };
}
```

### `src/lib/stores/theme.ts`

```typescript
import { writable } from 'svelte/store';
import type { ThemeMode } from '$lib/config/theme';

const STORAGE_KEY = 'zwift-theme';

function createThemeStore() {
    const { subscribe, set, update } = writable<ThemeMode>('dark');

    return {
        subscribe,
        initialize() {
            if (typeof window === 'undefined') return;
            const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
            const theme = stored === 'light' ? 'light' : 'dark';
            set(theme);
            applyTheme(theme);
        },
        toggle() {
            update((current) => {
                const next = current === 'dark' ? 'light' : 'dark';
                if (typeof window !== 'undefined') {
                    localStorage.setItem(STORAGE_KEY, next);
                    applyTheme(next);
                }
                return next;
            });
        },
        setTheme(theme: ThemeMode) {
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, theme);
                applyTheme(theme);
            }
            set(theme);
        },
    };
}

function applyTheme(theme: ThemeMode) {
    if (typeof document === 'undefined') return;
    if (theme === 'light') {
        document.documentElement.classList.add('light');
    } else {
        document.documentElement.classList.remove('light');
    }
}

export const theme = createThemeStore();
```

### `src/lib/stores/index.ts`

```typescript
export { theme } from './theme';
```

---

## Source Files - UI Components

### `src/lib/components/ui/Button.svelte`

```svelte
<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLButtonAttributes } from "svelte/elements";

    type Variant = "primary" | "secondary" | "danger" | "ghost";
    type Size = "sm" | "md" | "lg";

    interface Props extends HTMLButtonAttributes {
        variant?: Variant;
        size?: Size;
        loading?: boolean;
        children: Snippet;
    }

    let {
        variant = "primary",
        size = "md",
        loading = false,
        disabled = false,
        class: className = "",
        children,
        ...restProps
    }: Props = $props();

    const baseClasses =
        "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses: Record<Variant, string> = {
        primary:
            "bg-[var(--color-primary)] text-[#0E100F] hover:bg-[var(--color-primary-hover)] focus:ring-[var(--color-primary)] btn-glow",
        secondary:
            "bg-[var(--color-bg-surface-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-surface-overlay)] focus:ring-[var(--color-border)]",
        danger: "bg-[var(--color-danger)] text-white hover:opacity-90 focus:ring-[var(--color-danger)]",
        ghost: "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface-overlay)] hover:text-[var(--color-text-primary)] focus:ring-[var(--color-border)]",
    };

    const sizeClasses: Record<Size, string> = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
    };

    const focusOffsetClass = "focus:ring-offset-[var(--color-bg-base)]";

    const classes = $derived(
        `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${focusOffsetClass} ${className}`
    );
</script>

<button class={classes} disabled={disabled || loading} {...restProps}>
    {#if loading}
        <svg class="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    {/if}
    {@render children()}
</button>
```

### `src/lib/components/ui/Card.svelte`

```svelte
<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";

    interface Props extends HTMLAttributes<HTMLDivElement> {
        padding?: "none" | "sm" | "md" | "lg";
        glow?: boolean;
        children: Snippet;
        header?: Snippet;
        footer?: Snippet;
    }

    let { padding = "md", glow = false, class: className = "", children, header, footer, ...restProps }: Props = $props();

    const paddingClasses: Record<string, string> = { none: "", sm: "p-4", md: "p-6", lg: "p-8" };
    const baseClasses = "bg-[var(--color-bg-surface-elevated)] rounded-lg shadow border border-[var(--color-border)] transition-colors";
    const glowClasses = glow ? "card-glow" : "";
</script>

<div class="{baseClasses} {glowClasses} {className}" {...restProps}>
    {#if header}
        <div class="border-b border-[var(--color-border)] px-6 py-4">{@render header()}</div>
    {/if}
    <div class={paddingClasses[padding]}>{@render children()}</div>
    {#if footer}
        <div class="border-t border-[var(--color-border)] px-6 py-4">{@render footer()}</div>
    {/if}
</div>
```

### `src/lib/components/ui/Input.svelte`

```svelte
<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";

    interface Props extends Omit<HTMLInputAttributes, "value"> {
        label?: string;
        error?: string;
        hint?: string;
        value?: string | number | null;
    }

    let { label, error, hint, id, value = $bindable(""), class: className = "", ...restProps }: Props = $props();

    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    const baseClasses = "w-full rounded-md border px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 bg-[var(--color-bg-surface-overlay)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]";
    const stateClasses = $derived(
        error
            ? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/20"
            : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20"
    );
</script>

<div class="w-full">
    {#if label}
        <label for={inputId} class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">{label}</label>
    {/if}
    <input id={inputId} class="{baseClasses} {stateClasses} {className}" bind:value {...restProps} />
    {#if error}
        <p class="mt-1 text-sm text-[var(--color-danger)]">{error}</p>
    {:else if hint}
        <p class="mt-1 text-sm text-[var(--color-text-muted)]">{hint}</p>
    {/if}
</div>
```

### `src/lib/components/ui/Select.svelte`

```svelte
<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLSelectAttributes } from "svelte/elements";

    interface Props extends Omit<HTMLSelectAttributes, "value"> {
        label?: string;
        error?: string;
        hint?: string;
        value?: string;
        children: Snippet;
    }

    let { label, error, hint, id, value = $bindable(""), class: className = "", children, ...restProps }: Props = $props();

    const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`;
    const baseClasses = "w-full rounded-md border px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 bg-[var(--color-bg-surface-overlay)] text-[var(--color-text-primary)]";
    const stateClasses = $derived(
        error
            ? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/20"
            : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20"
    );
</script>

<div class="w-full">
    {#if label}
        <label for={selectId} class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">{label}</label>
    {/if}
    <select id={selectId} class="{baseClasses} {stateClasses} {className}" bind:value {...restProps}>
        {@render children()}
    </select>
    {#if error}
        <p class="mt-1 text-sm text-[var(--color-danger)]">{error}</p>
    {:else if hint}
        <p class="mt-1 text-sm text-[var(--color-text-muted)]">{hint}</p>
    {/if}
</div>
```

### `src/lib/components/ui/Modal.svelte`

```svelte
<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        open: boolean;
        title?: string;
        onClose: () => void;
        children: Snippet;
        footer?: Snippet;
    }

    let { open, title, onClose, children, footer }: Props = $props();

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Escape") onClose();
    }

    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) onClose();
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onclick={handleBackdropClick}>
        <div class="w-full max-w-lg rounded-lg bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border)] shadow-xl" role="dialog" aria-modal="true" aria-labelledby={title ? "modal-title" : undefined} tabindex="-1">
            {#if title}
                <div class="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
                    <h2 id="modal-title" class="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h2>
                    <button type="button" class="rounded-md p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface-overlay)] hover:text-[var(--color-text-secondary)]" onclick={onClose} aria-label="Close modal">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            {/if}
            <div class="p-6">{@render children()}</div>
            {#if footer}
                <div class="flex justify-end gap-3 border-t border-[var(--color-border)] px-6 py-4">{@render footer()}</div>
            {/if}
        </div>
    </div>
{/if}
```

### `src/lib/components/ui/index.ts`

```typescript
export { default as Button } from "./Button.svelte";
export { default as Card } from "./Card.svelte";
export { default as Input } from "./Input.svelte";
export { default as Modal } from "./Modal.svelte";
export { default as Select } from "./Select.svelte";
```

### `src/lib/components/charts/EChart.svelte`

```svelte
<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import * as echarts from "echarts";
    import type { EChartsOption } from "echarts";
    import { theme } from "$lib/stores";
    import { getChartTheme } from "$lib/config/chartTheme";

    interface Props {
        option: EChartsOption;
        height?: string;
        class?: string;
    }

    let { option, height = "300px", class: className = "" }: Props = $props();

    let chartContainer: HTMLDivElement;
    let chart: echarts.ECharts | null = null;
    let currentTheme: 'dark' | 'light' = 'dark';

    function applyChartTheme() {
        if (!chart) return;
        const chartTheme = getChartTheme(currentTheme);
        const mergedOption: EChartsOption = {
            ...option,
            textStyle: chartTheme.textStyle,
            tooltip: { ...chartTheme.tooltip, ...(option.tooltip as object || {}) },
            legend: { ...chartTheme.legend, ...(option.legend as object || {}) },
            xAxis: Array.isArray(option.xAxis)
                ? option.xAxis.map(axis => ({ ...chartTheme.xAxis, ...axis }))
                : { ...chartTheme.xAxis, ...(option.xAxis as object || {}) },
            yAxis: Array.isArray(option.yAxis)
                ? option.yAxis.map(axis => ({ ...chartTheme.yAxis, ...axis }))
                : { ...chartTheme.yAxis, ...(option.yAxis as object || {}) },
        };
        chart.setOption(mergedOption, true);
    }

    onMount(() => {
        chart = echarts.init(chartContainer);
        const unsubscribe = theme.subscribe((themeValue) => {
            currentTheme = themeValue;
            applyChartTheme();
        });
        const resizeObserver = new ResizeObserver(() => { chart?.resize(); });
        resizeObserver.observe(chartContainer);
        return () => { resizeObserver.disconnect(); unsubscribe(); };
    });

    onDestroy(() => { chart?.dispose(); });

    $effect(() => { if (chart) applyChartTheme(); });
</script>

<div bind:this={chartContainer} class={className} style="height: {height}; width: 100%;"></div>
```

---

## Source Files - Auth Pages

### `src/routes/+layout.server.ts`

```typescript
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
    return {
        user: locals.user
            ? { id: locals.user.id, username: locals.user.username }
            : null,
    };
};
```

### `src/routes/+layout.svelte`

```svelte
<script lang="ts">
    import "../app.css";
    import { onMount } from "svelte";
    import Navigation from "$lib/components/layout/Navigation.svelte";
    import { theme } from "$lib/stores";
    import type { LayoutData } from "./$types";
    import { page } from "$app/state";

    let { children, data }: { children: any; data: LayoutData } = $props();

    const authPages = ["/login", "/register"];
    const isAuthPage = $derived(authPages.includes(page.url.pathname));
    const showNavigation = $derived(data.user && !isAuthPage);

    onMount(() => { theme.initialize(); });
</script>

<svelte:head>
    <title>Zwift Route Tracker</title>
</svelte:head>

{#if showNavigation}
    <Navigation user={data.user} />
    <main class="ml-64 min-h-screen bg-[var(--color-bg-base)] p-8">
        {@render children()}
    </main>
{:else}
    {@render children()}
{/if}
```

### `src/routes/+page.server.ts`

```typescript
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user) redirect(302, "/dashboard");
    return {};
};
```

### `src/routes/+page.svelte`

This is the landing page for unauthenticated users. Adapt text/icons for Zwift theme (orange, cycling-related).

### `src/routes/login/+page.server.ts`

```typescript
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { lucia } from "$lib/server/auth/lucia";
import { verifyPassword } from "$lib/server/auth/password";
import { prisma } from "$lib/server/db/client";
import { logAuth } from "$lib/server/utils/logger";

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user) redirect(302, "/dashboard");
    return {};
};

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData();
        const username = formData.get("username");
        const password = formData.get("password");

        if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
            return fail(400, { message: "Invalid username or password" });
        }

        const user = await prisma.user.findUnique({ where: { username: username.toLowerCase() } });
        if (!user) {
            logAuth("login_failed", username, { reason: "user_not_found" });
            return fail(400, { message: "Invalid username or password" });
        }

        const validPassword = await verifyPassword(user.passwordHash, password);
        if (!validPassword) {
            logAuth("login_failed", username, { reason: "invalid_password" });
            return fail(400, { message: "Invalid username or password" });
        }

        const session = await lucia.createSession(user.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookies.set(sessionCookie.name, sessionCookie.value, { path: ".", ...sessionCookie.attributes });

        logAuth("login", username, { userId: user.id });
        redirect(302, "/dashboard");
    },
};
```

### `src/routes/login/+page.svelte`

```svelte
<script lang="ts">
    import { enhance } from "$app/forms";
    import type { ActionData } from "./$types";

    let { form }: { form: ActionData } = $props();
    let loading = $state(false);
</script>

<svelte:head><title>Login - Zwift Tracker</title></svelte:head>

<div class="flex min-h-screen items-center justify-center bg-[var(--color-bg-base)] px-4">
    <div class="w-full max-w-md">
        <div class="rounded-lg bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border)] p-8 shadow-lg">
            <h1 class="mb-6 text-center text-2xl font-bold text-[var(--color-text-primary)]">Welcome Back</h1>
            <p class="mb-8 text-center text-[var(--color-text-secondary)]">Sign in to your Zwift tracker</p>

            {#if form?.message}
                <div class="mb-4 rounded-md bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 p-4 text-sm text-[var(--color-danger)]">{form.message}</div>
            {/if}

            <form method="POST" use:enhance={() => { loading = true; return async ({ update }) => { loading = false; await update(); }; }}>
                <div class="mb-4">
                    <label for="username" class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">Username</label>
                    <input type="text" id="username" name="username" required autocomplete="username" class="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface-overlay)] px-4 py-2 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" placeholder="Enter your username" />
                </div>
                <div class="mb-6">
                    <label for="password" class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">Password</label>
                    <input type="password" id="password" name="password" required autocomplete="current-password" class="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface-overlay)] px-4 py-2 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" placeholder="Enter your password" />
                </div>
                <button type="submit" disabled={loading} class="w-full rounded-md bg-[var(--color-primary)] px-4 py-2 font-medium text-[#0E100F] transition-colors hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-base)] disabled:cursor-not-allowed disabled:opacity-50 btn-glow">
                    {loading ? "Signing in..." : "Sign in"}
                </button>
            </form>

            <p class="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
                Don't have an account? <a href="/register" class="font-medium text-[var(--color-primary)] hover:opacity-80">Create one</a>
            </p>
        </div>
    </div>
</div>
```

### `src/routes/register/+page.server.ts`

```typescript
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { lucia } from "$lib/server/auth/lucia";
import { hashPassword, validatePassword, validateUsername } from "$lib/server/auth/password";
import { prisma } from "$lib/server/db/client";
import { logAuth, logError } from "$lib/server/utils/logger";

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user) redirect(302, "/dashboard");
    return {};
};

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData();
        const username = formData.get("username");
        const password = formData.get("password");
        const confirmPassword = formData.get("confirmPassword");

        if (typeof username !== "string" || typeof password !== "string" || typeof confirmPassword !== "string") {
            return fail(400, { message: "Invalid form data" });
        }

        const usernameValidation = validateUsername(username);
        if (!usernameValidation.valid) return fail(400, { message: usernameValidation.errors[0] });

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) return fail(400, { message: passwordValidation.errors[0] });

        if (password !== confirmPassword) return fail(400, { message: "Passwords do not match" });

        const existingUser = await prisma.user.findUnique({ where: { username: username.toLowerCase() } });
        if (existingUser) return fail(400, { message: "Username already taken" });

        const passwordHash = await hashPassword(password);

        try {
            const user = await prisma.user.create({
                data: { username: username.toLowerCase(), passwordHash },
            });

            const session = await lucia.createSession(user.id, {});
            const sessionCookie = lucia.createSessionCookie(session.id);
            cookies.set(sessionCookie.name, sessionCookie.value, { path: ".", ...sessionCookie.attributes });

            logAuth("register", username.toLowerCase(), { userId: user.id });
            redirect(302, "/dashboard");
        } catch (error) {
            logError("Registration failed", error, { username: username.toLowerCase() });
            return fail(500, { message: "An error occurred during registration" });
        }
    },
};
```

### `src/routes/register/+page.svelte`

Same structure as login page but with confirm password field. Change titles to "Create Account" / "Start tracking your Zwift rides".

### `src/routes/logout/+page.server.ts`

```typescript
import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { lucia } from "$lib/server/auth/lucia";
import { logAuth } from "$lib/server/utils/logger";

export const load: PageServerLoad = async () => { redirect(302, "/"); };

export const actions: Actions = {
    default: async ({ locals, cookies }) => {
        if (!locals.session) redirect(302, "/login");
        const username = locals.user?.username || "unknown";
        const userId = locals.user?.id;
        await lucia.invalidateSession(locals.session.id);
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies.set(sessionCookie.name, sessionCookie.value, { path: ".", ...sessionCookie.attributes });
        logAuth("logout", username, { userId });
        redirect(302, "/login");
    },
};
```

---

## Pages & Routes

### Navigation (`src/lib/components/layout/Navigation.svelte`)

Same structure as budget project's Navigation.svelte but with these nav items:
- Dashboard (home icon)
- Routes (list icon)
- Import (upload icon)
- Settings (cog icon)

Use the same SVG icons from the budget project. The active state uses orange glow instead of green:
```
bg-[var(--color-primary)]/10 text-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary-glow)]
```

### Dashboard (`/dashboard`)

**Metric Cards (top row, 4 columns):**

| Card | Value | Subtitle |
|------|-------|----------|
| Routes Completed | `47 / 128` | `36.7% complete` |
| Total Distance | `1,247.3 km` | `of 4,892.1 km total (25.5%)` |
| Total Elevation | `18,420 m` | `of 72,340 m total (25.5%)` |
| Total Ride Time | `84h 32m` | `avg 1h 48m per ride` |

**Charts:** Completion by World (donut), Weekly Activity (bar+line), Difficulty Distribution (horizontal stacked bar), Monthly Progress (area), Recent Rides (list).

### Routes (`/routes`)

Interactive list with: search, world filter, difficulty filter, status filter (All/Completed/Remaining), sort. Each route shows checkbox, name, world badge, distance, elevation, difficulty stars, XP. Completed routes get an orange left border. Clicking checkbox opens ride log modal.

### Import (`/import`)

Upload PDF/CSV, preview parsed routes, confirm import. Show import history below.

### Settings (`/settings`)

Theme toggle, unit preferences (km/mi).

---

## Dashboard Stats & Charts

### `DashboardStats` Interface

```typescript
interface DashboardStats {
    totalRoutes: number;
    completedRoutes: number;
    completionPercentage: number;
    totalDistanceRidden: number;
    totalDistanceAvailable: number;
    distancePercentage: number;
    totalElevationRidden: number;
    totalElevationAvailable: number;
    elevationPercentage: number;
    totalRideTimeMinutes: number;
    averageRideTimeMinutes: number;
    totalXpEarned: number;
    totalXpAvailable: number;
    xpPercentage: number;
    weeklyDistance: number;
    weeklyTime: number;
    weeklyRides: number;
    monthlyDistance: number;
    monthlyTime: number;
    monthlyRides: number;
    completionByWorld: { world: string; completed: number; total: number; color: string }[];
    difficultyDistribution: { difficulty: number; completed: number; total: number }[];
    weeklyActivity: { week: string; distance: number; timeMinutes: number; rides: number }[];
    monthlyProgress: { month: string; cumulativeRoutes: number; cumulativeDistance: number }[];
    recentRides: { routeName: string; world: string; date: string; time: number; difficulty: number }[];
}
```

---

## PDF Import

### Zwift Route PDF Structure

| Column | Example | Maps To |
|--------|---------|---------|
| Route Name | "Road to Ruins" | `name` |
| World/Map | "Watopia" | `world` |
| Distance | "18.5 km / 11.5 mi" | `distanceKm`, `distanceMi` |
| Elevation | "246 m / 807 ft" | `elevationM`, `elevationFt` |
| Lead-In | "0.4 km / 0.2 mi" | `leadInKm`, `leadInMi` |
| Badge XP | "590" | `badgeXp` |
| Difficulty | "2/5" | `difficulty`, `difficultyScore` |

### Fallback CSV Format

```csv
Name,World,Distance (km),Distance (mi),Elevation (m),Elevation (ft),Lead-In (km),Lead-In (mi),Badge XP,Difficulty
Road to Ruins,Watopia,18.5,11.5,246,807,0.4,0.2,590,2
```

Import page should support both PDF upload and CSV upload.

---

## Implementation Phases

### Phase 1: Project Setup & Auth

1. Initialize SvelteKit, install deps, set up Prisma with schema above
2. Create all config files (vite, svelte, tsconfig, .env, .gitignore)
3. Create all foundation source files listed above (app.css, app.html, app.d.ts, hooks, auth, db, logger, theme config, stores)
4. Create all UI components (Button, Card, Input, Select, Modal, index.ts, EChart)
5. Create Navigation.svelte with 4 nav items
6. Create auth routes (login, register, logout) with full server + page files
7. Create layout files and root redirect
8. Create placeholder pages for /dashboard, /routes, /import, /settings
9. Verify: `bun run check` passes, register/login works

### Phase 2: PDF Import & Route Database

1. Create type definitions (route.ts, import.ts, analytics.ts)
2. Create route-repository.ts with upsertMany, findAll, stat queries
3. Create pdf-route-parser.ts + CSV fallback
4. Build /import page with upload, preview, confirm flow
5. Test with real Zwift route data

### Phase 3: Route List & Ride Logging

1. Create completed-ride-repository.ts
2. Create RouteCard, RideModal, RouteFilters components
3. Build /routes page with full CRUD for ride logging
4. Client-side filtering/sorting (~130 routes loads fine at once)

### Phase 4: Dashboard & Charts

1. Create stats-calculator.ts with all DashboardStats computations
2. Build /dashboard page with 4 metric cards
3. Create chart components (CompletionByWorld, WeeklyActivity, DifficultyDistribution, MonthlyProgress)
4. Add recent rides list card
5. Add weekly/monthly summary cards

### Phase 5: Polish

1. Empty states, loading states
2. Settings page with theme toggle + unit preferences
3. Format utilities (distance, time, relative dates)
4. Overall completion progress bar

