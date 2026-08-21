# Phase 1 Data Model: Google Login with Unified Accounts

No new collections. This feature only adds *behavior* around the existing `User` model (`src/DB/models/user.model.js`); the schema itself is unchanged.

## Entity: User (existing — `src/DB/models/user.model.js`)

Represents the spec's **Account** entity. One document per email, enforced by the existing unique index.

| Field | Type | Notes (existing, unchanged) | Relevance to this feature |
|---|---|---|---|
| `email` | String, unique, required, lowercase, trimmed | Single identity key across both sign-in methods | Matching key for FR-002/FR-003/FR-004 |
| `provider` | enum `system \| google`, default `system` | Records *how the account was created* | Used to detect password-less accounts (FR-005) and is set to `google` on first Google sign-in |
| `password` | String, required only when `provider === "system"` | Absent/undefined for Google-originated accounts | Read (never written) by the hardened `login()` check |
| `name` | String, required, 3–30 chars, lowercase, trimmed | Pre-filled from Google's `name` claim on first Google sign-in (FR-008) | No change — `googleLogin` already does this |
| `isActived` | Boolean, default false | Set `true` immediately for both signUp and googleLogin paths | Unchanged |
| `isDeleted` | Boolean, default false | Soft-delete flag | **New read**: `googleLogin` must now check this and reject sign-in (FR-007) |
| `role`, `borrowedBooks[]`, `phone`, timestamps | — | Unaffected by sign-in method (per spec Assumptions) | No change |

### Validation rules (clarified/added by this feature, no schema changes)

- **Email uniqueness** (already enforced by the Mongoose unique index + existing `findOne` checks in `sendOTP`/`signUp`): a Google sign-in for an email that already has a `system`-provider account MUST resolve to that existing document (FR-003), never create a second one.
- **Google-email-verification gate** (new, in the service layer, not the schema): a `googleLogin` call whose Google token payload has `email_verified !== true` MUST be rejected before any `findOne`/`create` against `User` (FR-006).
- **Soft-delete gate** (new, in the service layer): if `findOne({ email })` returns a document with `isDeleted === true`, both `login()` and `googleLogin()` MUST reject rather than authenticate (FR-007).
- **Password-less-account gate** (new, in the service layer): in `login()`, if the matched document's `provider === "google"` (equivalently, no `password` set), reject with a distinct message before attempting `comparePassword` (FR-005).

### State transitions

No new states. Existing lifecycle is unaffected:

```
(no document) --signUp or first googleLogin--> isActived=true, isDeleted=false
                                                 |
                                                 v
                                        (either sign-in method authenticates this same document)
                                                 |
                                                 v
                                     deleteUser --> isDeleted=true, isActived=false (blocks both sign-in methods)
```

## Entity: Sign-in attempt (spec concept, not persisted)

Not a new collection — this is the request/response shape of `POST /user/login` and `POST /user/google-login`, documented in `contracts/`. No storage change; each attempt either succeeds (returns tokens) or fails (4xx with a message), matching the existing pattern in `CLAUDE.md` §12 (business errors arrive as `response.data.message`, not distinct status codes).
