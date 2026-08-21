# Quickstart: Validating Google Login with Unified Accounts

Prerequisites: backend running locally (`npm run dev` from repo root) against a MongoDB instance reachable via `CONNECTION_URL`, with `GOOGLE_CLIENT_ID` set in `.env`; frontend running locally (`npm run dev` from `frontend/app/`) with `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000` and a `NEXT_PUBLIC_GOOGLE_CLIENT_ID` matching the same Google OAuth client (new env var this feature introduces on the frontend).

## Setup

```bash
# repo root
npm install
npm run dev

# frontend/app/
npm install @react-oauth/google
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:3000" >> .env.local
echo "NEXT_PUBLIC_GOOGLE_CLIENT_ID=<same client id as backend GOOGLE_CLIENT_ID>" >> .env.local
npm run dev
```

## Scenario 1 — New visitor signs in with Google (US1, FR-001, FR-008)

1. Open the frontend login page, no existing account for `newperson@example.com`.
2. Click "Continue with Google", complete the Google consent prompt using an account with `newperson@example.com`.
3. **Expected**: redirected into the signed-in app; a `User` document now exists with `provider: "google"`, `isActived: true`, `name` pre-filled from the Google profile — verify via `GET /library/` (authenticated) succeeding, or inspect the DB directly.

## Scenario 2 — Same email, two methods, one account (US2, FR-002/003/004)

1. Register an account normally via OTP sign-up flow using `dual@example.com` / a password.
2. Sign out. Click "Continue with Google" and authenticate with a Google account whose email is also `dual@example.com`.
3. **Expected**: signed into the *same* account (no new document created) — confirm by borrowing a book after step 1 and checking it's still attributed to the same user after step 2's sign-in (e.g. via the "My Books" local registry, or an admin-only `Oneuser` GraphQL query keyed by the same `_id`).
4. Separately: attempt `POST /user/sendOTP` / signup again for `dual@example.com`. **Expected**: rejected with "Email already exists" (existing behavior, now also true for emails that originated via Google).

## Scenario 3 — Password-less account tries password login (US2 Scenario 3, FR-005)

1. Using the Google-only account from Scenario 1 (`newperson@example.com`, no password ever set), go to the login page and submit the email/password form with any password.
2. **Expected**: response message is the new distinct string ("This account uses Google sign-in — continue with Google instead."), not the generic "Invalid password".

## Scenario 4 — Unverified Google email is rejected (Edge case, FR-006)

1. This is hard to trigger via the real Google consent screen (Google generally only issues verified-email tokens through the standard OAuth flow) — validate at the unit/integration level instead: call `googleLogin`'s underlying logic with a mocked token payload where `email_verified: false`.
2. **Expected**: request rejected before any `User.findOne`/`create` call; no document created for that email.

## Scenario 5 — Soft-deleted account is blocked (Edge case, FR-007)

1. Soft-delete an existing account via `DELETE /user/delete` (as that user, authenticated).
2. Attempt to sign back in via Google using that same email.
3. **Expected**: rejected (not reactivated); `isDeleted` remains `true` in the DB afterward.

## Scenario 6 — Google sign-in failure is retryable, not silent (FR-010)

1. On the login page, click "Continue with Google" and cancel/close the Google consent popup.
2. **Expected**: a visible, clear message appears on the page (not a silent no-op), and the "Continue with Google" button remains usable to retry immediately.

## Success criteria check

- SC-001: Scenario 1 completes with zero typed form fields.
- SC-002: Scenario 2 confirms a single account across 100 mixed-method attempts (run scenario 2's steps in a loop with distinct emails during manual QA, or spot-check a handful).
- SC-003: Scenario 3's message correctly directs the user to Google sign-in.
- SC-004: Not directly testable pre-release — monitored post-release per the spec (support-ticket volume).
