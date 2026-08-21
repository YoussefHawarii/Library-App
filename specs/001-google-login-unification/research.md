# Phase 0 Research: Google Login with Unified Accounts

All items below were resolvable directly from the existing codebase (`src/modules/user/`, `src/DB/models/user.model.js`, `src/utils/signWithGoogle/google_login.js`, `frontend/app/src/lib/`) plus `CLAUDE.md` — no NEEDS CLARIFICATION markers remain in the Technical Context.

## 1. How is "one account per email across two providers" already enforced?

- **Decision**: Keep using the existing `email` field's `unique: true` Mongoose index on `User` (`src/DB/models/user.model.js:29`) as the single source of truth for account identity. `provider` (`system | google`) stays a descriptive field, not a key.
- **Rationale**: The unique index already guarantees no two `User` documents can share an email at the DB layer; the only gaps are at the *application* layer, where `googleLogin` currently does a plain `findOne` (no `isDeleted`/`email_verified` gating) and `login`'s error message doesn't distinguish "wrong password" from "this account has no password" (Google-originated). Both are additive checks on the existing model, not a schema change.
- **Alternatives considered**: A separate `AuthIdentity`/`accounts` join collection (one User → many identities) was considered for cleanliness, but rejected — it's a bigger migration than this feature's scope calls for, and the current one-document-per-email model already satisfies every acceptance scenario in the spec (FR-002–FR-004) without it.

## 2. How should the backend verify the Google ID token?

- **Decision**: Continue using `google-auth-library`'s `OAuth2Client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID })` (`src/utils/signWithGoogle/google_login.js`), which already validates signature, issuer, audience, and expiry server-side. Extend the function to also read `email_verified` off the returned payload and have the caller (`googleLogin` in `user.service.js`) reject when it's falsy (FR-006).
- **Rationale**: This is already the industry-standard verification path recommended by Google, already installed, already wired to `GOOGLE_CLIENT_ID` in `.env`. No reason to replace it.
- **Alternatives considered**: Verifying the token via a raw HTTPS call to Google's `tokeninfo` endpoint — rejected, strictly worse than the maintained library already in use (extra network hop, manual validation logic).

## 3. How does the frontend obtain a Google ID token to send to `POST /user/google-login`?

- **Decision**: Use Google Identity Services (GIS) via `@react-oauth/google`, the standard lightweight React wrapper around Google's `accounts.google.com/gsi/client` script. It renders Google's official "Sign in with Google" button (satisfying US3/FR-... trust requirement) and returns a `credential` (the ID token) via callback — that credential is POSTed as `idToken` to the existing `/user/google-login` REST endpoint, unchanged wire format.
- **Rationale**: This is the current, Google-supported replacement for the deprecated `gapi.auth2` library; it needs only a `GoogleOAuthProvider` wrapping the app with the existing `GOOGLE_CLIENT_ID` (already used server-side, safe to expose client-side — client IDs are not secret) and a `<GoogleLogin>` button component. No custom OAuth redirect flow or popup-window management needs to be hand-rolled.
- **Alternatives considered**: Hand-rolling the Google Sign-In JS SDK (`<script src="https://accounts.google.com/gsi/client">`) directly with `window.google.accounts.id.initialize(...)` — functionally equivalent but more boilerplate/typing to maintain vs. the typed React wrapper; rejected in favor of the wrapper for a smaller diff. Either approach lands on the same backend contract, so this choice does not affect any other part of the plan.

## 4. How should "account has no password, use Google instead" be surfaced (FR-005)?

- **Decision**: In `login()` (`src/modules/user/user.service.js`), after finding the user by email, check `existingUser.provider === loginMethods.GOOGLE` (equivalently: no `password` set) *before* calling `comparePassword`, and short-circuit with a distinct error message (e.g. "This account uses Google sign-in — continue with Google instead.") at the same `400` status class already used for other login errors in this handler, so the frontend can match on `response.data.message` per the existing pattern documented in `CLAUDE.md` §12.
- **Rationale**: `comparePassword` (`bcrypt.compareSync`) would either throw or always return false against an `undefined`/missing hash, which is indistinguishable from "wrong password" today — exactly the bug the spec calls out (US2 Scenario 3). Checking `provider` first is a one-line, additive fix consistent with the existing error-handling pattern in this file (`next(new Error(...), { cause: 400 })`).
- **Alternatives considered**: Adding a dedicated `hasPassword` boolean field — rejected as redundant; `provider` already encodes this since only `system` accounts have `password` required (`user.model.js:33-34`).

## 5. How should a soft-deleted account be blocked from Google sign-in (FR-007)?

- **Decision**: In `googleLogin()`, after `findOne({ email })`, if a user is found and `isDeleted === true`, reject with the same "account not available" style error the email/password path would need (currently neither path checks this — `login()` also doesn't check `isDeleted` today, which is a pre-existing gap; this feature closes it for both paths it touches for consistency, since the spec's edge case explicitly calls out parity with "how a deleted account behaves for email/password login today").
- **Rationale**: Directly required by the spec's edge case and FR-007. Reusing the existing `isDeleted` flag already on `User` — no schema change.
- **Alternatives considered**: None — this is a straightforward existing-field check.

## Summary of code-level gaps this feature closes (all additive, no rewrites)

| Gap | File | Current behavior | Required behavior |
|---|---|---|---|
| No `email_verified` check | `src/utils/signWithGoogle/google_login.js`, `src/modules/user/user.service.js` (`googleLogin`) | Trusts any email in the token payload | Reject sign-in if Google reports the email as unverified (FR-006) |
| No soft-delete check on Google path | `src/modules/user/user.service.js` (`googleLogin`) | Signs into/reactivates any matching document regardless of `isDeleted` | Reject sign-in for `isDeleted` accounts (FR-007) |
| Generic "Invalid password" for password-less accounts | `src/modules/user/user.service.js` (`login`) | `comparePassword` against a missing hash reads as wrong password | Distinct, actionable message directing to Google sign-in (FR-005) |
| No frontend Google entry point | `frontend/app/src/app/login/`, `.../signup/`, `src/lib/api/auth.api.ts` | No Google button, no client call to `/user/google-login` | Visible "Continue with Google" on both pages, wired to a new `authApi.googleLogin` (FR-001, FR-003, US3) |
