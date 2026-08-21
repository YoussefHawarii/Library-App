---

description: "Task list template for feature implementation"
---

# Tasks: Google Login with Unified Accounts

**Input**: Design documents from `/specs/001-google-login-unification/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/user-auth.md, quickstart.md

**Tests**: Not explicitly requested in the spec — no dedicated test tasks are generated; each story's checkpoint instead points at the matching `quickstart.md` scenario for manual verification.

**Organization**: Tasks are grouped by user story (US1/US2/US3, per spec.md priorities) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- File paths are exact and relative to the repository root unless noted

## Path Conventions

Web app, matching existing repo layout: backend at repo root (`src/`), frontend at `frontend/app/src/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the one new dependency and env var this feature requires; everything else reuses existing installed packages.

- [X] T001 [P] Add `@react-oauth/google` to `frontend/app/package.json` dependencies and run `npm install` in `frontend/app/`
- [X] T002 [P] Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to `frontend/app/.env.local` (same value as backend's existing `GOOGLE_CLIENT_ID`) and document it in `frontend/app/README.md`'s environment variables section
- [X] T003 [P] Add a note to `frontend/ops-runbook.md` that Google sign-in requires `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to be set and match the backend's `GOOGLE_CLIENT_ID`

**Checkpoint**: Dependency installed, env var documented — no behavior yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared plumbing every user story's tasks build on. Must complete before Phase 3+.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Extend `verifyGoogleToken` in `src/utils/signWithGoogle/google_login.js` to return the full payload (it already does via `ticket.getPayload()`) and confirm callers can read `email_verified` off the returned object — add no filtering inside this util so `email_verified`, `email`, and `name` all remain available to callers
- [X] T005 Create a `GoogleOAuthProvider` wrapper around the app root in `frontend/app/src/app/layout.tsx` (or a new `frontend/app/src/lib/auth/GoogleAuthProvider.tsx` composed into the existing providers tree), configured with `process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID`, alongside the existing `AuthContext` provider
- [X] T006 [P] Add `googleLogin(idToken: string)` to `frontend/app/src/lib/api/auth.api.ts`, calling `http.post<AuthTokens & ApiMessage>("/user/google-login", { idToken })`, matching the existing `login`/`signUp` pattern in that file

**Checkpoint**: Frontend can reach a Google-auth-aware provider tree and has a typed client call; backend util exposes what's needed. User story implementation can now begin.

---

## Phase 3: User Story 1 - One-click sign-in with Google (Priority: P1) 🎯 MVP

**Goal**: A visitor can click "Continue with Google", approve the consent prompt, and land signed into the app — whether they're brand-new or returning — without typing a password or OTP.

**Independent Test**: A brand-new visitor with no existing account selects "Continue with Google" and reaches the signed-in app state without entering a password or OTP (spec.md US1 Independent Test; validate with `quickstart.md` Scenario 1).

### Implementation for User Story 1

- [X] T007 [US1] Create `GoogleSignInButton` component in `frontend/app/src/features/auth/GoogleSignInButton.tsx` using `<GoogleLogin>` from `@react-oauth/google`; on `onSuccess`, call `authApi.googleLogin(credentialResponse.credential)`
- [X] T008 [US1] In `GoogleSignInButton`, on a successful `googleLogin` response, store `access_token`/`refresh_token` via the existing `AuthContext` (same mechanism `login` already uses) and redirect into the signed-in app, matching the existing post-login navigation used by the email/password flow
- [X] T009 [US1] In `GoogleSignInButton`, handle the `onError` callback (consent declined/cancelled or Google script failure) by showing a clear, visible, retryable error message in place — do not fail silently (FR-010, US1 Acceptance Scenario 3)
- [X] T010 [US1] Render `GoogleSignInButton` on the login page `frontend/app/src/app/login/page.tsx`, alongside the existing email/password form
- [X] T011 [US1] Render `GoogleSignInButton` on the signup page `frontend/app/src/app/signup/page.tsx`, alongside the existing OTP sign-up form
- [X] T012 [US1] In `src/modules/user/user.service.js`, confirm/adjust `googleLogin()` issues `access_token`/`refresh_token` via `generateToken` with the exact same payload shape and `expiresIn` options as `login()`, so a Google-authenticated session is structurally identical to a password session (FR-009)
- [X] T013 [US1] Add a JOI validation schema for `googleLogin` (`idToken` required, non-empty string) in `src/modules/user/user.validation.js`, and wire it into the `POST /user/google-login` route in `src/modules/user/user.controller.js` via the existing `validation.middleware.js`, matching how `login`/`signUp` are already validated

**Checkpoint**: A new visitor can sign up via Google end-to-end; a returning Google user can sign back in; Google-issued tokens work identically to password-issued tokens. User Story 1 is independently testable via `quickstart.md` Scenario 1.

---

## Phase 4: User Story 2 - Same email never creates a second account (Priority: P1)

**Goal**: Signing in with the "other" method against an email that already has an account always resolves to that single existing account — never a duplicate, never data loss, and a password-less (Google-originated) account gets a specific, actionable error instead of a generic one when someone tries the password form.

**Independent Test**: Create an account with one sign-in method, then sign in with the other method using the identical email; confirm exactly one account record exists with the original history intact (spec.md US2 Independent Test; validate with `quickstart.md` Scenarios 2, 3, 5).

### Implementation for User Story 2

- [X] T014 [US2] In `src/modules/user/user.service.js`'s `googleLogin()`, after `verifyGoogleToken` resolves, reject with a clear error (`next(new Error(...), { cause: 400 })`) when the payload's `email_verified` is not `true`, *before* any `User.findOne`/`User.create` call (FR-006)
- [X] T015 [US2] In `src/modules/user/user.service.js`'s `googleLogin()`, after `findOne({ email })` returns an existing document, reject with a clear "account not available" error when `userExists.isDeleted === true` — do not reactivate or authenticate it (FR-007)
- [X] T016 [US2] In `src/modules/user/user.service.js`'s `login()`, after `findOne({ email })` returns an existing document, reject with the same "account not available" error when `existingUser.isDeleted === true`, for parity with the Google path (FR-007 edge case)
- [X] T017 [US2] In `src/modules/user/user.service.js`'s `login()`, before calling `comparePassword`, check `existingUser.provider === loginMethods.GOOGLE` (password-less account) and reject with a distinct message (e.g. "This account uses Google sign-in — continue with Google instead.") instead of falling through to the generic invalid-password path (FR-005, US2 Acceptance Scenario 3)
- [X] T018 [P] [US2] In `frontend/app/src/app/login/page.tsx`, ensure the login form surfaces `response.data.message` as-is (or maps it to a "Continue with Google" call-to-action) so the new distinct message from T017 reaches the visitor clearly, consistent with the existing `response.data.message`-matching pattern noted in `CLAUDE.md` §12

**Checkpoint**: Duplicate accounts are structurally impossible for a matching email regardless of sign-in order; deleted accounts stay blocked on both paths; password-less accounts get an actionable message. User Story 2 is independently testable via `quickstart.md` Scenarios 2, 3, and 5, and remains correct together with User Story 1.

---

## Phase 5: User Story 3 - Recognizable, trustworthy Google sign-in entry point (Priority: P2)

**Goal**: The Google sign-in option looks and behaves like a standard, trustworthy Google button, and a first-time Google sign-in pre-fills the visitor's name without manual entry.

**Independent Test**: Inspect the sign-in page for a standard Google sign-in affordance, and confirm a first-time Google sign-in populates the visitor's display name automatically (spec.md US3 Independent Test; validate with `quickstart.md` Scenario 1, name-prefill assertion).

### Implementation for User Story 3

- [X] T019 [US3] Confirm `GoogleSignInButton` (`frontend/app/src/features/auth/GoogleSignInButton.tsx`) renders `@react-oauth/google`'s default, Google-branded button UI (not a custom-styled substitute), so it visually matches a standard "Sign in with Google" affordance
- [X] T020 [P] [US3] Confirm the login (`frontend/app/src/app/login/page.tsx`) and signup (`frontend/app/src/app/signup/page.tsx`) pages present the Google button clearly alongside, not hidden behind, the existing email/password fields, with a visible "Continue with Google" label
- [X] T021 [US3] In `src/modules/user/user.service.js`'s `googleLogin()`, confirm the `name` field on `User.create(...)` for a new account is populated from the Google payload's `name` claim with no additional manual-entry step required (already implemented — verify it still holds after T014/T015 changes) (FR-008)

**Checkpoint**: All three user stories are independently functional; the Google entry point is both correct (US1/US2) and recognizable (US3).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and end-to-end validation across all stories.

- [X] T022 [P] Update `frontend/app/README.md` and/or `CLAUDE.md` §12 (Frontend Integration Notes) to note that Google sign-in is now wired end-to-end (no longer just backend-only/experimental for this path)
- [X] T023 [P] Confirm no `idToken`, `access_token`, or `refresh_token` values are logged anywhere in the new frontend/backend code paths touched by this feature (T004–T021)
- [ ] T024 Run all six scenarios in `specs/001-google-login-unification/quickstart.md` end-to-end against a local dev environment and confirm each matches its expected outcome — **not runnable in the implementation sandbox** (needs a live MongoDB `CONNECTION_URL`, a real `GOOGLE_CLIENT_ID`/`NEXT_PUBLIC_GOOGLE_CLIENT_ID` pair, and an interactive browser for the Google consent screen); `npm run build`, `npm run lint`, `npm test` (frontend), and `node --check` (backend) were run instead as the automatable subset — this task is left for the developer to complete locally

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001–T003) — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) only
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) only — implemented in the same two files (`user.service.js`, and the login page) as US1 but touches different functions/branches (`login()`'s password-less/deleted checks, `googleLogin()`'s verified/deleted checks), so it is logically independent even though T016/T017 sit in the same file as T012
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) and on `GoogleSignInButton` existing (T007, from US1) to have something to confirm/polish — practically sequenced after US1, but adds no new required behavior to US1 or US2
- **Polish (Phase 6)**: Depends on all three user stories being complete

### Within Each User Story

- US1: T007 → T008, T009 (same file, sequential) → T010, T011 (parallel, different pages) once T007–T009 exist; T012, T013 (backend) are independent of the frontend tasks and can run in parallel with T007–T011
- US2: T014 and T015 are both inside `googleLogin()` — sequential edits to the same function; T016 and T017 are both inside `login()` — sequential edits to the same function; T014/T015 and T016/T017 touch different functions in the same file and can be done in either order; T018 (frontend) can run in parallel with all backend US2 tasks
- US3: T019 and T021 touch different files and can run in parallel; T020 depends on T010/T011 (US1) already existing on both pages

### Parallel Opportunities

- T001, T002, T003 (Setup) — all parallel
- T006 (Foundational, frontend client) can run in parallel with T004 (Foundational, backend util confirmation)
- T012, T013 (US1 backend) can run in parallel with T007–T011 (US1 frontend)
- T018 (US2 frontend) can run in parallel with T014–T017 (US2 backend)
- T020 (US3) can run in parallel with T019/T021 (US3)
- T022, T023 (Polish) can run in parallel with each other

---

## Parallel Example: User Story 1

```bash
# Backend and frontend halves of US1 can proceed in parallel once Phase 2 is done:
Task: "Confirm googleLogin() token issuance matches login() in src/modules/user/user.service.js (T012)"
Task: "Add JOI validation for idToken in src/modules/user/user.validation.js (T013)"
Task: "Create GoogleSignInButton in frontend/app/src/features/auth/GoogleSignInButton.tsx (T007)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T006) — blocks everything else
3. Complete Phase 3: User Story 1 (T007–T013)
4. **STOP and VALIDATE**: Run `quickstart.md` Scenario 1 — new visitor signs in with Google end-to-end
5. Note: without User Story 2's hardening (Phase 4), a returning visitor who already has a password account and later uses Google with the same email will still land in the *same* account (existing `googleLogin` already does a plain email match) — but soft-deleted accounts could be incorrectly reactivated and password-less accounts would get a generic "Invalid password" message until Phase 4 lands. Given both US1 and US2 are P1, ship them together for a real MVP; do not deploy US1 alone to production.

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add User Story 1 (T007–T013) → validate via Scenario 1
3. Add User Story 2 (T014–T018) → validate via Scenarios 2, 3, 5 — now both P1 stories are safely shippable together
4. Add User Story 3 (T019–T021) → validate via Scenario 1's name-prefill check and a visual pass on both pages
5. Polish (T022–T024) → run full `quickstart.md` pass

---

## Notes

- [P] tasks touch different files (or clearly separable regions) with no ordering dependency
- [Story] label maps each task to its user story for traceability back to spec.md
- No automated test tasks were generated (not requested in the spec); `quickstart.md` scenarios serve as the independent-test criteria for each story
- Commit after each task or logical group
- Stop at any checkpoint to validate a story independently before moving on
