# Feature Specification: Google Login with Unified Accounts

**Feature Branch**: `001-google-login-unification`

**Created**: 2026-08-22

**Status**: Draft

**Input**: User description: "i want to add login with google to my project, to make the login more easy to the user, and also i would like to handle an issue like if the user loged in with google and then logged in with his emial and it is the same google email, i want it to show only one account and don't save two accounts in the DB"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - One-click sign-in with Google (Priority: P1)

A visitor lands on the sign-in / sign-up page and wants to get into the library app without filling out a registration form, waiting for an OTP email, or remembering another password. They choose "Continue with Google", approve access in the Google prompt, and land inside the app already signed in.

**Why this priority**: This is the core ask — reducing sign-in friction. Without a working, visible entry point for Google sign-in, none of the rest of the feature has value.

**Independent Test**: Can be fully tested by a brand-new visitor (no existing account) selecting "Continue with Google" and confirming they reach the signed-in app state without ever entering a password or OTP.

**Acceptance Scenarios**:

1. **Given** a visitor with no existing account, **When** they choose "Continue with Google" and approve the Google consent prompt, **Then** they are signed into the app and a new account is created for them automatically.
2. **Given** a returning visitor who previously signed in with Google, **When** they choose "Continue with Google" again, **Then** they are signed into their existing account.
3. **Given** a visitor who cancels or declines the Google consent prompt, **When** they return to the app, **Then** they see a clear message that sign-in was not completed and can try again.

---

### User Story 2 - Same email never creates a second account (Priority: P1)

A person already has an account (created either through email/password registration or through Google) and later signs in through the *other* method using the same email address. They expect to land in the same account, with the same borrowing history, rather than accidentally creating a second, separate profile.

**Why this priority**: This is the explicit correctness/data-integrity concern raised — losing or splitting a user's history across two accounts is a trust-breaking bug, not a minor inconvenience, so it ranks alongside Story 1.

**Independent Test**: Can be fully tested by creating an account with one sign-in method, then attempting to sign in with the other method using the identical email address, and confirming exactly one account record exists and it contains the original history.

**Acceptance Scenarios**:

1. **Given** a person who already registered with email/password using `person@example.com`, **When** they sign in with Google using the Google account `person@example.com`, **Then** they are signed into their existing account (no second account is created) and their existing borrowing history is still there.
2. **Given** a person who already has an account created via Google sign-in with `person@example.com`, **When** they attempt to register a new email/password account using `person@example.com`, **Then** the system prevents a duplicate account from being created and explains that an account already exists for that email.
3. **Given** a person whose account was created via Google sign-in (no password ever set), **When** they try to sign in using the email/password form with the same email, **Then** the system does not create or expose a second account, and gives them a clear, specific message pointing them to sign in with Google instead of a generic "invalid password" error.

---

### User Story 3 - Recognizable, trustworthy Google sign-in entry point (Priority: P2)

A visitor who is cautious about clicking unfamiliar buttons wants the Google sign-in option to look and behave like a standard, trustworthy Google sign-in flow, and wants their basic profile info (name, email) to already be filled in on first login instead of retyping it.

**Why this priority**: Improves adoption and trust in the new option, but the feature already delivers its core value (Stories 1–2) without this polish.

**Independent Test**: Can be tested by inspecting the sign-in page for a standard Google sign-in affordance and by confirming a first-time Google sign-in populates the visitor's name automatically without manual entry.

**Acceptance Scenarios**:

1. **Given** a visitor on the sign-in/sign-up page, **When** the page loads, **Then** a clearly labeled "Continue with Google" option is visible alongside the existing email/password options.
2. **Given** a first-time Google sign-in, **When** the account is created, **Then** the visitor's display name from their Google profile is used without requiring manual entry.

---

### Edge Cases

- What happens when a visitor's Google account email matches an existing account that was previously soft-deleted? System MUST NOT silently reactivate a deleted account; it MUST be treated as blocked/unavailable for sign-in, consistent with how a deleted account behaves for email/password login today.
- What happens when Google reports a person's email as unverified? System MUST reject sign-in for unverified Google emails rather than trusting them for account matching.
- What happens if the Google sign-in network call fails or times out? Visitor MUST see a clear retryable error and no partial account should be created.
- What happens when a person signed up via email/password, never verified/used Google, and simply forgot their password? Out of scope for this feature — handled by existing/future password-reset functionality, not by Google sign-in.
- What happens when the same email is used by two *different* real people (e.g., a shared inbox)? Out of scope — the system treats one email address as one account, matching existing account-uniqueness behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST let a visitor sign in or sign up using their Google account from the sign-in/sign-up page, without requiring an OTP or password.
- **FR-002**: System MUST treat "email address" as the single unique identifier for an account, regardless of whether the account was created via email/password or via Google.
- **FR-003**: System MUST NOT create a new account when a Google sign-in's email matches an email already on file; it MUST sign the person into the existing account instead.
- **FR-004**: System MUST NOT allow a new email/password registration to succeed when the email already belongs to an existing account (of either sign-in method); it MUST reject the registration with a message explaining an account already exists.
- **FR-005**: System MUST give a distinguishable, actionable error message when someone whose account has no password set (i.e., created via Google) attempts to sign in via the email/password form, directing them to use Google sign-in instead of returning a generic invalid-credentials message.
- **FR-006**: System MUST only complete a Google sign-in when the identity information supplied by Google is verified (i.e., MUST NOT trust an unverified email for account matching or creation).
- **FR-007**: System MUST NOT sign a visitor into (or reactivate) an account that has been soft-deleted, whether the sign-in attempt is via Google or email/password.
- **FR-008**: System MUST pre-fill the display name for a newly created Google-originated account from the visitor's Google profile, without requiring manual re-entry.
- **FR-009**: System MUST issue the same kind of authenticated session/access to a visitor regardless of whether they signed in via Google or via email/password.
- **FR-010**: System MUST present a clear, user-facing error (not a silent failure) when the Google sign-in attempt fails or is cancelled, allowing the visitor to retry.

### Key Entities

- **Account**: A single person's identity in the system, uniquely identified by email address. Tracks which sign-in method(s) created/can access it, display name, active/deleted status, and (for email/password accounts) credentials. Exactly one Account MUST exist per email address regardless of how many sign-in methods are used against it.
- **Sign-in attempt**: A single instance of a visitor trying to authenticate via Google or via email/password; resolves to either "matched to existing Account," "new Account created," or "rejected" (with a reason).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new visitor can go from landing on the sign-in page to being signed into the app using Google in under 15 seconds, with zero form fields typed.
- **SC-002**: 100% of sign-in attempts (via either method) against an email address that already has an account resolve to that single existing account — zero duplicate accounts are ever created for the same email, verified across at least 100 mixed-method sign-in attempts in testing.
- **SC-003**: Visitors whose account has no password (Google-originated) and who mistakenly try the email/password form receive a message that correctly tells them what to do next, measured by these visitors successfully signing in via Google on their next attempt at least 90% of the time in testing.
- **SC-004**: Support/manual-intervention requests related to "duplicate account" or "can't log in with my email" drop to zero after release, monitored over the first month.

## Assumptions

- Google sign-in is offered as an *additional* entry point alongside the existing email/password flow, not a replacement for it.
- "Same account" is determined strictly by exact email address match; no fuzzy or alias matching (e.g., `+` addressing) is performed.
- An account created via Google does not have a password by default; this feature does not require adding a "set a password later" capability — that is a possible future enhancement, not required here.
- Soft-deleted accounts remain blocked from sign-in via any method, consistent with current email/password behavior.
- Only the identity fields Google reliably provides (verified email, display name) are relied upon; no additional Google profile data (e.g., profile photo) is required by this feature.
- Existing account data (borrowing history, role, etc.) is unaffected by which sign-in method is used to access the account — access method does not change what the person can see or do.
