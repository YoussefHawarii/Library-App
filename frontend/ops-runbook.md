# Frontend Operations Runbook

Covers phase-08 deliverables: environments, CI, release process, and known
backend limitations that shape frontend behavior. Companion to `app/README.md`.

## Environments

| Env | API target | Notes |
|---|---|---|
| Local dev | `http://localhost:3000` (or wherever the backend's `PORT` points) | Run backend with `npm start` from repo root, frontend with `npm run dev` from `frontend/app` |
| Staging/Prod | set `NEXT_PUBLIC_API_BASE_URL` to the deployed backend origin | No secrets live in the frontend build — only the public API URL and optional Google client ID |

`NEXT_PUBLIC_*` vars are baked into the client bundle at build time. Set them
in your hosting provider's environment configuration before building, not
after.

## CI/CD

`.github/workflows/frontend-ci.yml` runs on pushes/PRs touching
`frontend/app/**`: install, lint, unit test, build. It does not deploy —
wire a deploy step for your chosen host (Vercel, etc.) once one is chosen.

## Release checklist

1. `npm run lint && npm test && npm run build` all pass locally.
2. Confirm `NEXT_PUBLIC_API_BASE_URL` for the target environment is correct
   (a stale value here fails silently as network errors, not build errors).
3. Smoke-test against the real backend by hand: browse books, browse
   libraries, sign up (real OTP email), log in, borrow, return. Budget for
   this manually — see rate-limit note below, it will not survive a scripted
   E2E run.
4. Roll back = redeploy the previous build artifact; there is no
   database/migration coupling on the frontend side to worry about.

## Known backend limitations (read before debugging a "frontend bug")

These are backend behaviors, not frontend defects, and the frontend has been
deliberately built around them. Filing a frontend bug for one of these will
send you back here.

1. **Global rate limit: 100 requests / 5 minutes, across every route
   (REST *and* GraphQL), per IP.** This is set in the backend's
   `app.controller.js` (raised from an original 5/5min during development).
   It's comfortable for normal interactive use, but it's still one shared
   budget across the whole app, so the query defaults
   (`src/lib/query/QueryProvider.tsx`) stay moderately conservative rather
   than refetching freely (a few minutes of cache, no refetch-on-focus, 2
   retries). There is nothing the frontend can do to lift a server-side
   IP-keyed ceiling beyond spending it carefully — if you hit a wall of
   "Too many requests" banners while testing (e.g. rapid manual refreshing,
   or several people testing from behind the same NAT/IP), that's this;
   wait 5 minutes, or ask the backend owner to scope the limiter per-route
   (auth vs. reads vs. writes), which is already flagged in the backend's
   own `claude.md` hardening backlog.

2. **REST error status codes are unreliable.** A bug in how the backend
   raises errors (`next(new Error(msg), { cause })` — Express's `next(err)`
   only reads the first argument) means REST business errors almost always
   arrive as HTTP 500 regardless of their intended code. The frontend
   matches on `response.data.message` instead
   (`src/lib/api/http.ts#parseApiError`). GraphQL is unaffected (different,
   correct error-raising pattern) but the frontend doesn't use GraphQL — see
   below.

3. **No "get my borrowed books" REST endpoint.** REST only exposes a public
   overdue list and a return-by-id action; the per-user borrow history that
   *is* modeled (`User.borrowedBooks[]`) is only reachable via GraphQL
   `Oneuser`, which requires an admin role a normal reader doesn't have.
   The frontend works around this with a local, per-device loan registry
   (`src/lib/loans/loanRegistry.ts`) populated from the app's own
   borrow/return calls. **This means "My Books" only shows loans made from
   the current browser** — it is not the account's full history. Fixing
   this properly needs a backend endpoint, e.g. `GET /user/me` or
   `GET /user/borrowedBooks`, scoped to the authenticated user.

4. **GraphQL is intentionally unused by this frontend.** Beyond the
   "internal/experimental" designation in the backend's own docs, three
   concrete holes make it unsafe to build UI on top of today:
   `Allusers` and `deleteUser` have no auth at all (any caller can list
   every user's data, including encrypted phone and role, or soft-delete
   any account by ID), and `signUp` skips the OTP flow entirely and accepts
   a client-supplied `role` field with no whitelist, so a caller can
   self-register as `admin`. None of this is exploitable *by* this
   frontend, but building features against these endpoints would mean
   depending on holes the frontend has no way to close.

5. **No refresh-token endpoint exists yet.** Login/Google-login return a
   `refresh_token`, but nothing on the backend can redeem it — there's no
   rotation, no revocation, no `/user/refresh`. The frontend therefore
   keeps both tokens in memory only and never persists them; a page reload
   requires logging in again. This is a deliberate trade-off, not an
   oversight — see `src/lib/auth/token-store.ts`.

6. **Books and libraries have no auth/role protection on the backend.**
   Anyone with the API can add/delete/restore books or libraries. The
   frontend does not build any admin UI on top of this — see phase-01's own
   "avoid scope creep" risk note — both because it wasn't asked for and
   because a client-side "admin" gate here would be theater: the backend
   doesn't actually check who's calling.

7. **`phone` is always ciphertext.** The backend AES-encrypts phone numbers
   at signup and never decrypts them for any response (REST or GraphQL).
   The frontend never attempts to display a user's phone number back to
   them for this reason — there's nothing decrypt-able to show.

## Post-launch monitoring (once deployed)

No observability stack is wired up yet (phase-07 scope, not built in this
pass). At minimum before a real launch, track:

- Client error rate (e.g. Sentry or similar) — the app currently only logs
  to the browser console (`src/lib/api/http.ts`), which is not visible to
  operators.
- Auth failure rate — watch for spikes correlated with backend deploys,
  since the REST 500-for-everything bug (#2 above) makes it hard to
  distinguish "expected wrong password" from "something broke" from status
  code alone; this needs message-text-based dashboards, not status-code
  ones.
- API latency / 429 rate — given limitation #1, a 429 spike likely means
  legitimate traffic hit the global limiter, not an attack.

## Feature flags

None implemented. If a flag system becomes necessary (e.g. to gate a UI
feature behind a not-yet-hardened backend endpoint), prefer a simple
env-var-driven constant over pulling in a full flag service — there's no
current need for runtime toggling.
