# Contract: User authentication endpoints (existing REST routes, behavior hardened)

Base path: `/user` (mounted in `src/app.controller.js`). Both endpoints already exist in `src/modules/user/user.controller.js`; this feature changes their internal service logic, not their routes, methods, or top-level request/response shape.

## POST /user/login

**Purpose**: Email/password sign-in. Hardened to distinguish "wrong password" from "this account has no password — use Google."

### Request

```json
{ "email": "person@example.com", "password": "string, min 6 chars" }
```

Validated by existing `user.validation.js` login schema — unchanged.

### Responses

| Condition | Status | Body |
|---|---|---|
| Success | 200 | `{ "message": "You have logged in successfully!", "access_token": "<jwt>", "refresh_token": "<jwt>" }` |
| Email not found | 400 | `{ "message": "Email not found" }` (unchanged) |
| Account is Google-originated (no password set) | 400 | `{ "message": "This account uses Google sign-in — continue with Google instead." }` **(new distinct message, FR-005)** |
| Account soft-deleted | 400 | `{ "message": "Account not found" }` or equivalent **(new check, for parity with FR-007's edge case)** |
| Wrong password | 400 | `{ "message": "Invalid password" }` (unchanged) |

Token shape is unchanged: same `access_token`/`refresh_token` pair, signed with `generateToken`, as every other auth path (FR-009).

## POST /user/google-login

**Purpose**: Sign in or silently register via a Google ID token. Hardened to require a verified email and to respect soft-delete.

### Request

```json
{ "idToken": "<Google ID token string, from Google Identity Services credential>" }
```

### Responses

| Condition | Status | Body |
|---|---|---|
| Success — existing account matched (any provider) | 200 | `{ "message": "You have logged in successfully!", "access_token": "<jwt>", "refresh_token": "<jwt>" }` |
| Success — new account created | 200 | Same shape as above; `User.provider` set to `"google"`, `name` pre-filled from Google profile (FR-008) |
| Google email not verified | 400 | `{ "message": "Google email is not verified" }` **(new check, FR-006)** |
| Matched account is soft-deleted | 400 | `{ "message": "Account not found" }` or equivalent **(new check, FR-007)** — MUST NOT reactivate |
| Google token invalid/expired/verification call fails | 400 (or 401) | `{ "message": "Google sign-in failed, please try again" }` — surfaced by the existing global error handler; frontend maps this to a retryable UI message (FR-010) |

### Contract invariants (both endpoints)

- **FR-002/FR-003/FR-004**: Exactly one `User` document exists per `email` value, regardless of which endpoint is used to reach it. Neither endpoint may create a second document for an email that already resolves to one.
- **FR-009**: The JSON shape of a successful response (`message`, `access_token`, `refresh_token`) is identical between `/user/login` and `/user/google-login` — the frontend's `AuthContext` handles both with the same code path (`AuthTokens & ApiMessage`, per `frontend/app/src/lib/api/types`).
- Errors continue to arrive as HTTP 400 with a `message` string (not structured error codes), matching the existing pattern the frontend already relies on (`CLAUDE.md` §12) — no new error contract shape introduced.

## Frontend consumption contract (`frontend/app/src/lib/api/auth.api.ts`)

New client function, same `http` axios instance and `ApiMessage`/`AuthTokens` types already used by `login`/`signUp`:

```ts
googleLogin: (idToken: string) =>
  http.post<AuthTokens & ApiMessage>("/user/google-login", { idToken }).then((res) => res.data);
```

Consumed by a new `GoogleSignInButton` on both `/login` and `/signup` pages, which obtains `idToken` from `@react-oauth/google`'s `<GoogleLogin onSuccess={(cred) => ...} />` callback and feeds it into this call, then routes into `AuthContext` exactly as the existing `login` flow does.
