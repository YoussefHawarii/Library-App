# Implementation Plan: Google Login with Unified Accounts

**Branch**: `001-google-login-unification` | **Date**: 2026-08-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-google-login-unification/spec.md`

## Summary

Add a "Continue with Google" entry point to the existing sign-in/sign-up page and make email the single unifying identity key across the two sign-in methods already modeled on `User` (`provider: system | google`). The backend already has a `POST /user/google-login` route and a `verifyGoogleToken` helper (`google-auth-library`); this feature hardens that existing path (verified-email check, soft-delete block, password-less-account messaging) rather than introducing a new stack, and wires the missing frontend UI and API client call on top of the existing Next.js auth flow.

## Technical Context

**Language/Version**: JavaScript (Node.js 20.15.1, ESM) for backend; TypeScript (Next.js 16, App Router) for frontend — same languages already used throughout this repo, no new language introduced.

**Primary Dependencies**:
- Backend (already installed, reused as-is): `express`, `mongoose`, `joi`, `jsonwebtoken`, `bcrypt`, `google-auth-library` (`OAuth2Client.verifyIdToken`), `express-rate-limit`, `helmet`, `cors`.
- Frontend (already installed, reused as-is): `axios` (via `src/lib/api/http`), `@tanstack/react-query`, `react-hook-form` + `zod`, `next` App Router. One new frontend dependency is required to render Google's official sign-in button/One Tap and obtain the Google ID token: Google Identity Services (`@react-oauth/google`, the standard lightweight wrapper around Google's GIS script) — no backend dependency changes.

**Storage**: MongoDB via Mongoose — same `User` collection/model already in use (`src/DB/models/user.model.js`), no new collection. Existing `email` unique index and `provider` enum (`system | google`) are the mechanism that already encodes "one account per email."

**Testing**: No test runner currently configured for the backend (`npm test` is a placeholder — per `CLAUDE.md`, there is no backend lint/test script yet). Frontend uses Vitest (`npm test` / `npm run test:watch` in `frontend/app/`) with `@testing-library/react`; new frontend logic (Google button wiring, error-message mapping) gets Vitest coverage consistent with existing tests (e.g. `src/lib/api/http.test.ts`). This plan does not introduce a new backend test framework — manual/quickstart verification is used for backend changes, matching current project practice.

**Target Platform**: Backend deployed as a Vercel serverless Node function (`vercel.json` routes all traffic to `index.js`); frontend deployed as a separate Next.js app (Vercel). Same as today — no platform change.

**Project Type**: Web application (existing backend REST/GraphQL API at repo root + `frontend/app/` Next.js client) — reusing Option 2 (backend/frontend) structure already present in this repo.

**Performance Goals**: No new performance targets beyond existing API responsiveness; Google sign-in adds one external call to Google's token-verification endpoint per attempt (already the case for the existing `google-login` route), well within the existing global rate limit.

**Constraints**:
- Must not add a second write path that bypasses the existing `email` uniqueness constraint on `User`.
- Must not change the shape of the access/refresh token issuance already used by `login` — Google-authenticated sessions must remain indistinguishable in structure from password sessions (FR-009), so no separate token contract for frontend to handle.
- Must not silently reactivate `isDeleted` accounts (FR-007) — currently `googleLogin` in `src/modules/user/user.service.js` does not check `isDeleted` at all; this is a gap to close, not new territory.
- Must not trust an unverified Google email (FR-006) — currently `googleLogin` destructures `{ email, name }` from the token payload and ignores `email_verified`; this is a gap to close.

**Scale/Scope**: Same user base as the rest of the app (small library-management system); scope is limited to the sign-in/sign-up surface — no changes to borrowing, library, or book domains.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled template (no ratified principles for this project). There are no project-specific gates to evaluate against. This plan instead treats `CLAUDE.md`'s "Existing Security/Resilience Controls" and "Missing or Weak Areas" sections (§9–§11) as the de facto constraints already agreed for this codebase, and stays consistent with them:
- Reuses existing JWT session issuance (`generateToken`) rather than inventing a parallel mechanism.
- Closes two items already tracked as gaps in `CLAUDE.md` §5 (Critical #2, GraphQL-only) is out of scope here — this feature only touches the REST `google-login` path, not GraphQL `signUp`.
- Does not touch CORS, global rate limiting, or refresh-token persistence — out of scope, unaffected.

No violations to justify; Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-google-login-unification/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
# Option 2: Web application (backend at repo root + frontend/app/) — matches existing repo layout

src/                                   # existing backend, repo root
├── DB/models/user.model.js            # existing User model — reused, no schema change required
├── modules/user/
│   ├── user.controller.js             # existing POST /user/google-login route — reused
│   ├── user.service.js                # googleLogin() hardened here (isDeleted check, email_verified check,
│   │                                   #   password-less-account message added to login())
│   └── user.validation.js             # googleLogin JOI schema — reused/extended if idToken validation missing
└── utils/signWithGoogle/google_login.js  # verifyGoogleToken() — extended to surface email_verified

frontend/app/
├── src/lib/api/auth.api.ts            # add googleLogin(idToken) client call, reusing existing http instance
├── src/lib/auth/AuthContext.tsx       # reused as-is: same token shape from googleLogin as from login
├── src/app/login/                     # existing login route — add "Continue with Google" entry point
├── src/app/signup/                    # existing signup route — add "Continue with Google" entry point
└── src/features/auth/ (new, if not present)  # GoogleSignInButton component wrapping @react-oauth/google
```

**Structure Decision**: Web application, Option 2 — this feature adds no new top-level projects. All backend changes live inside the existing `src/modules/user/` and `src/utils/signWithGoogle/` files; all frontend changes live inside the existing `frontend/app/src/` tree (API client, auth feature, login/signup pages). No new services, no new database collections.

## Complexity Tracking

*Not applicable — no constitution violations.*
