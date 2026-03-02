# CalTodo

Task management app for students. Syncs assignments from Canvas/bCourses, Gradescope, and Pensieve, with Google Calendar integration.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database & Auth:** Supabase (PostgreSQL + Row Level Security)
- **Styling:** Tailwind CSS v4
- **Testing:** Vitest
- **Deployment:** Vercel

## Setup

```bash
nvm use              # Node 23 (see .nvmrc)
npm install
cp .env.example .env.local   # Fill in your keys (see .env.example for descriptions)
npm run dev          # Starts on http://localhost:3000
```

### Required Services

- **Supabase** project with auth enabled (Google OAuth provider)
- **Google Cloud** OAuth credentials (for Google Calendar sync)
- **Resend** API key (for task sharing emails)
- PostHog (optional, analytics)

### Database Migrations

```bash
supabase db push     # Applies pending migrations from supabase/migrations/
```

## Project Structure

```
src/
├── app/                    Next.js App Router pages & API routes
│   ├── api/               REST endpoints (credentials, tasks, canvas, gradescope, gcal)
│   ├── app/               Protected routes (inbox, today, calendar, settings, onboarding)
│   └── login/             Auth pages
├── components/             React components organized by feature
│   ├── tasks/             TaskList, TaskItem, TaskPopover, TaskBoardView
│   ├── settings/          Integration cards, profile settings
│   ├── onboarding/        Setup flows for each integration
│   └── landing/           Marketing/landing page
├── contexts/              React Context providers
│   ├── TaskContext.tsx     Global task state, sync, CRUD operations
│   ├── ThemeContext.tsx    Dark/light mode
│   └── ToastContext.tsx    Toast notifications
├── lib/                   Utilities and services
│   ├── sync-engine.ts     Orchestrates Canvas + Gradescope + Pensieve sync
│   ├── canvas-client.ts   Canvas LMS API client
│   ├── gradescope-client.ts  Gradescope HTML scraper (no official API)
│   ├── pensieve-client.ts    Pensieve iCal parser
│   ├── gcal/              Google Calendar token management & sync
│   ├── supabase/          Supabase client helpers (server, admin, middleware)
│   ├── types.ts           All TypeScript interfaces
│   └── crypto.ts          AES-256-GCM encryption for stored passwords
└── __tests__/             Vitest unit tests
```

## Key Architecture

### Task Sync Flow

1. `TaskContext` calls `/api/assignments/sync` on app load
2. `sync-engine.ts` fetches assignments from Canvas API, scrapes Gradescope, parses Pensieve iCal
3. Assignments upserted to `tasks` table via `(user_id, source, external_id)` conflict key
4. `dismissed_at` used for soft-delete of synced tasks (prevents resurrection on resync)
5. `snoozed_until` hides tasks temporarily (countdown in Hidden section)

### Integration Credentials

Single `integration_credentials` row per user stores all tokens/keys. Gradescope password is AES-256-GCM encrypted. Additional Canvas accounts stored as JSONB array.

### Google Calendar

OAuth flow → access/refresh tokens encrypted in DB → real-time two-way sync via `gcal/` helpers.

## Development

### Commands

```bash
npm run dev          # Dev server (Turbopack)
npx tsc --noEmit     # Type check
npx vitest run       # Run all tests
npx vitest run src/__tests__/gradescope-client.test.ts  # Run specific test
```

### Conventions

- Files under 300 lines, one clear purpose each
- Use CSS variables for theme-aware colors (`var(--border)`, `bg-popover`, `text-foreground`)
- Dark mode: use explicit classes, add `box-shadow: none` in dark variants for elevated buttons
- Dropdowns/popovers use `bg-popover` (solid, never transparent)
- API routes include structured logging via `logger` from `@/lib/logger`
- Optimistic UI updates with rollback on error (see TaskContext patterns)
- **UI consistency**: See `UI_STYLE_GUIDE.md` for complete patterns (modals, buttons, colors, typography, animations). Never use gray all-caps text for labels, hardcoded colors, or transparent popover backgrounds.

### Git Workflow

- **Branch off `main`** for features/fixes (`feature/...`, `fix/...`)
- **Open a PR** — CI runs typecheck + tests automatically
- **Don't push directly to `main`** — branch protection is enabled
- Commit messages: imperative mood, concise ("Add snooze presets" not "Added snooze presets")

### After Multi-File Changes

Clear `.next` cache and restart dev server to avoid stale UI:

```bash
rm -rf .next && npm run dev
```

Then hard refresh the browser (Cmd+Shift+R).
