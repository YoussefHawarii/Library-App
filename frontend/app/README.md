# Athenaeum — Library Frontend

Next.js (App Router, TypeScript) frontend for the `assignment_11` library backend
(REST + GraphQL, see `../../claude.md` at the repo root for the full backend
reference). This app talks to the REST API only — see [Why REST-only](#why-rest-only)
below.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4, custom "reading room" theme (`src/app/globals.css`)
- TanStack Query for server-state caching
- react-hook-form + zod for form validation
- axios for HTTP, with a shared interceptor layer (`src/lib/api/http.ts`)

## Getting started

```bash
npm install
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:3000" > .env.local
npm run dev                  # http://localhost:3000 by default
```

The backend must be running and reachable at `NEXT_PUBLIC_API_BASE_URL`. Start it
from the repo root with `npm start` (reads its own `.env`, defaults to port 3000
via its `PORT` var) — if you run both on the same machine, give the frontend a
different port, e.g. `npm run dev -- -p 3001`.

### Environment variables

| Var | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | yes | Base URL of the backend (bare paths: `/user`, `/book`, `/library`, `/borrowed-book`) |

Never put secrets here — everything prefixed `NEXT_PUBLIC_` is shipped to the
browser. There is no backend secret this app needs at build/runtime.

## Scripts

- `npm run dev` — dev server
- `npm run build` / `npm start` — production build/serve
- `npm run lint` — ESLint
- `npm test` — Vitest unit tests
- `npm run test:watch` — Vitest watch mode

## Architecture

```
src/
  app/            routes (App Router)
  components/ui   presentational primitives (Button, Card, States, ...)
  components/     layout (Navbar/Footer)
  features/       domain hooks + view components (books, libraries, loans)
  lib/api/        axios instance + typed per-module API clients + DTOs
  lib/auth/       in-memory token store, AuthContext, RequireAuth guard
  lib/validation/ zod schemas mirrored from backend Joi schemas
  lib/loans/      client-side loan registry (see below)
  lib/query/      TanStack Query provider/defaults
```

## Notable backend-driven design decisions

These aren't arbitrary choices — they're direct responses to how the backend
(documented in `../../claude.md`) actually behaves today. See
`../ops-runbook.md` for the full list and what changes on the frontend if the
backend is hardened.

- **REST-only, no GraphQL in the UI.** The backend's GraphQL layer has real
  auth gaps (`Allusers` and `deleteUser` are effectively unauthenticated,
  `signUp` skips OTP and lets a caller self-assign `role: "admin"`). The
  backend's own docs call GraphQL "internal/experimental" — the frontend
  takes that at face value.
- **Tokens live in memory only** (`src/lib/auth/token-store.ts`), never in
  `localStorage`/cookies. A hard refresh logs you out. The backend has no
  refresh/rotation endpoint yet, so persisting a refresh token would be
  pure risk with no upside.
- **REST error handling matches on `message` text, not HTTP status.** A bug
  in the backend's `next(err, { cause })` calls means most REST business
  errors come back as 500 instead of their intended 4xx. See
  `parseApiError` in `src/lib/api/http.ts`.
- **"My Books" is a local, per-device loan registry**
  (`src/lib/loans/loanRegistry.ts`), not a server-fetched profile — the
  backend has no "get my borrowed books" REST endpoint, and the only
  alternative (GraphQL `Allusers`) is public and shouldn't be depended on.
- **No admin panel.** Book/library CRUD is unauthenticated on the backend,
  but that's a backend gap to fix there, not a reason to build a fake
  client-side "admin" role the backend can't actually enforce.

## Testing

`npm test` runs Vitest unit tests covering the auth token store, the
REST error-message parser (including the regression test for the
`next(err, {cause})` bug above), date/overdue formatters, and the zod
validation schemas. There is no E2E suite yet — see the ops runbook for why
(the backend's 100-req/5-min *global* rate limit is shared across the whole
app, which still makes a scripted E2E run against a live backend risky
without a dedicated, unthrottled test deployment).
