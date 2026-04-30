# AGENTS.md

Guidance for AI agents working on the euroflow codebase.

## What is this

euroflow connects EU bank accounts (via Enable Banking PSD2) and syncs your transactions to a local CSV file. Fully local — no transaction data touches a third-party server. Push to Actual Budget can be enabled. MIT licensed, open source.

## Tech Stack

| Layer | Choice |
|---|---|
| Language | TypeScript |
| Runtime | Node.js |
| Backend | Express |
| Frontend | React + Vite |
| Styling | Tailwind v4 — tokens via `@theme` in CSS, no `tailwind.config.js` |
| Accessible primitives | Radix UI (unstyled) — `@radix-ui/react-*` |
| Server state | TanStack Query (`@tanstack/react-query`) |
| Routing | TanStack Router (`@tanstack/react-router`) |
| Fonts | Inter + JetBrains Mono, self-hosted woff2 in `public/fonts/` |
| Storage | `better-sqlite3` + Drizzle ORM (SQLite) |
| Open banking | Enable Banking (PSD2) |
| Actual integration | `@actual-app/api` |
| Test runner | vitest |
| Lint/format | Biome |

## Folder Structure

```
src/
  client/     React frontend (browser, jsdom in tests)
  server/     Express backend (Node, node environment in tests)
    db/       Drizzle schema + db instance
  shared/     Zod schemas and inferred TypeScript types only — no runtime logic
public/       Static assets served by Vite
drizzle/      Generated migration files (drizzle-kit output)
```

**Rule:** `src/shared/` is for types and Zod schemas that both sides import. Do not put runtime logic there.

## Key Design Decisions

- **Node.js only** — do not switch runtimes
- **Drizzle ORM** — `drizzle-orm` with `better-sqlite3` driver; schema defined in `src/server/db/schema.ts`; migrations generated with `pnpm db:generate` and applied with `pnpm db:migrate`
- **Biome** — single tool for lint and format; no ESLint, no Prettier
- **REST API** — Express routes under `/api/*`; request/response shapes defined as Zod schemas in `src/shared/`; infer TypeScript types from schemas with `z.infer<>`
- **Dev setup** — `pnpm dev` runs Vite (port 3000) and Express (port 3001) concurrently; Vite proxies `/api/*` to `localhost:3001`; Express is run with `tsx watch` in dev
- **Terminal aesthetic** — mono font on every number, date, IBAN; ISO timestamps everywhere; visible grid lines in tables
- **Wizard shares components with Settings** — wizard passes `embedded` prop to suppress Save/Reset buttons; never duplicate forms
- **Sync guard** — `is_syncing` boolean (in-memory); manual trigger returns 409 if already running; cron tick skips silently

## Conventions

### Branches
- One branch per task, prefixed by type: `<type>/<slug>` where slug is kebab-case, no task number
- Types: `feat` (new feature), `fix` (bug fix), `chore` (tooling, deps, config), `docs` (documentation), `refactor` (no behaviour change), `test` (tests only)
- Examples:
  - `feat/token-system-theme`, `feat/app-shell`, `feat/status-page`
  - `fix/sync-skipping-pending-transactions`, `fix/consent-expiry-warning-off-by-one`
  - `chore/upgrade-drizzle`, `chore/add-vitest-coverage`
  - `docs/update-readme-getting-started`
  - `refactor/extract-enable-banking-client`
  - `test/sync-engine-partial-failure`

### Commits
- **Branch commits** — conventional commits prefix, no branch name in message: `feat: description`, `fix: description`, `chore: description`, `refactor: description`, `docs: description`, `test: description`
- **Main commits** — GitHub squash merge format: imperative sentence + `(#N)` suffix, no conventional prefix
- AI-authored commits: add `Co-Authored-By: Claude <noreply@anthropic.com>` trailer — GitHub shows the Claude badge automatically

### Pull Requests
- Squash merge into `main` — the PR title becomes the commit on `main`, so make it count
- Title: imperative natural language, no prefix, under 72 characters — describes what was built, not the task name. "Add token system, CSS custom properties, and ThemeProvider", "Fix sync skipping pending transactions", "Add CSV export to sync log"
- Body: brief summary of what was done and any notable decisions. No issue references needed.

## Local Configuration

Local agentic workflow configuration (gitignored) lives in `.agents/`.

## Before Starting Any Task

1. One branch per task — `feat/<slug>` (see Conventions)
2. Before opening a PR: `pnpm check` → `pnpm typecheck` → `pnpm test` — all must pass
3. A task is done when the PR is open and CI is green on GitHub Actions
