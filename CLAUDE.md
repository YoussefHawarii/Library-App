# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This is two apps in one repo:

- **Backend** (repo root): Node.js/Express/MongoDB REST + GraphQL API. Entry point `index.js`.
- **Frontend** (`frontend/app/`): Next.js (App Router, TypeScript) client. See
  [Frontend](#13-frontend-frontendapp) below and `frontend/app/README.md` /
  `frontend/ops-runbook.md` for full detail — those docs are the source of
  truth for frontend conventions, don't duplicate them here.

## Commands

### Backend (run from repo root)

```bash
npm install
npm run dev     # nodemon --env-file=.env index.js
npm start       # node --watch index.js
```

There is no backend lint or test script configured yet (`npm test` is a placeholder that exits 1).

### Frontend (run from `frontend/app/`)

```bash
npm install
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:3000" > .env.local
npm run dev                  # dev server
npm run build && npm start   # production build/serve
npm run lint                 # ESLint
npm test                     # Vitest, single run
npm run test:watch           # Vitest watch mode
```

To run a single Vitest file: `npx vitest run src/lib/api/http.test.ts` (from `frontend/app/`).

---

# Library App Backend Deep Documentation

## 1) Project Snapshot

- **Project type:** Node.js backend for a library management system.
- **Protocols:** REST + GraphQL in the same service.
- **Database:** MongoDB via Mongoose.
- **Auth model:** JWT (access + refresh tokens), plus OTP-based signup and Google login.
- **Main domains:** Users, Books, Libraries, Borrowed books.

---

## 2) Runtime, Tooling, and Dependencies

- **Node engine:** `20.15.1`
- **Module system:** ESM (`"type": "module"`)
- **Entry point:** `index.js`
- **Run scripts:**
  - `npm run dev` -> nodemon + `.env`
  - `npm start` -> `node --watch index.js`

### Dependency usage map

- `express`: API framework.
- `mongoose`: ODM and schemas.
- `joi`: request and GraphQL arg validation wrappers.
- `jsonwebtoken`: token signing/verification.
- `bcrypt`: password hash/compare.
- `crypto-js`: AES encryption (phone field).
- `nodemailer`: SMTP email sending.
- `randomstring`: OTP generation.
- `helmet`: security headers.
- `cors`: cross-origin handling.
- `express-rate-limit`: global request limiting.
- `graphql` + `graphql-http`: GraphQL schema + HTTP handler.
- `google-auth-library`: Google ID token verification.
- `dotenv`: environment variable loading.

---

## 3) Startup and App Bootstrapping

## `index.js`

1. Loads env with `dotenv.config()`.
2. Creates Express app.
3. Calls async bootstrap.
4. Starts HTTP server on `process.env.PORT`.

## `src/app.controller.js`

Bootstrap flow:

1. Connect DB (`connectDB()`).
2. Register middlewares in order:
   - `cors()`
   - `helmet()`
   - global `rateLimit(...)`
   - `express.json()`
3. Mount GraphQL at `/graphql`.
4. Mount REST routers:
   - `/user`
   - `/book`
   - `/library`
   - `/borrowed-book`
5. 404 fallback.
6. Global error handler.

### Current global rate limit

- Window: 5 minutes
- Max: 100 requests per IP (across **all** endpoints, REST and GraphQL)
- Message: plain text limit message
- Set in `src/app.controller.js` (raised from an initial `max: 5` during development)

---

## 4) Database Layer

## `src/DB/connection.js`

- Uses `mongoose.connect(CONNECTION_URL)`.
- Logs success/failure.
- **Important behavior:** on connection failure, it logs but does not rethrow (app can continue booting without hard stop).

## Models

### `User` model (`src/DB/models/user.model.js`)

Fields:
- `name` (lowercase, trim, 3..30)
- `email` (regex, lowercase, trim, unique)
- `password` (required only for `provider=system`)
- `phone` (required only for `provider=system`)
- `role` (`admin | user`, default `user`)
- `borrowedBooks[]` embedded history:
  - `bookId`
  - `borrowedDate`
  - `dueDate`
  - `returnDate`
- `isActived` (default false)
- `isDeleted` (default false)
- `provider` (`google | system`, default `system`)
- timestamps

Exports:
- `roles`
- `loginMethods`

### `Book` model (`src/DB/models/book.model.js`)

Fields:
- `title`, `author`, `genre` required/trimmed
- `publishedYear` number required
- `availableCopies` number, min 0
- `isDeleted` soft delete flag
- timestamps

### `Library` model (`src/DB/models/library.model.js`)

Fields:
- `name`
- `location`
- `books[]` references `Book`
- timestamps

### `BorrowedBook` model (`src/DB/models/borrowedBook.model.js`)

Fields:
- `userId` ref `User`
- `bookId` ref `Book`
- `borrowedAt`
- `dueDate`
- `returnDate`
- `status` enum: `borrowed | returned | overdue`
- `returned` boolean
- timestamps

### `OTP` model (`src/DB/models/OTP.model.js`)

Fields:
- `email`
- `otp`
- timestamps

Index:
- TTL index on `createdAt` expiring after **300 sec (5 min)**.

---

## 5) REST API Layer

## User module (`src/modules/user/`)

Routes (`user.controller.js`):
- `POST /user/sendOTP`
- `POST /user/signUp`
- `POST /user/login`
- `POST /user/google-login`
- `POST /user/borrowedBooks/:bookId` (auth + role)
- `DELETE /user/delete` (auth + role)

Validation (`user.validation.js`):
- JOI schemas for sendOTP, signUp, login, googleLogin.

Authorization matrix (`user.endpoints.js`):
- `borrowBook`: `user`
- `deleteUser`: `user`, `admin`

Service behaviors (`user.service.js`):
- **sendOTP**
  - Rejects existing email.
  - Generates 5-digit numeric OTP.
  - Stores in OTP collection.
  - Emits email event.
- **signUp**
  - Rechecks email uniqueness.
  - Verifies OTP by `email + otp`.
  - Hashes password.
  - Encrypts phone.
  - Creates active user (`isActived=true`).
  - Emits thank-you email.
- **login**
  - Validates email/password.
  - Returns access + refresh token.
- **googleLogin**
  - Verifies Google ID token.
  - Creates user if not found (`provider=google`).
  - Returns access + refresh token.
- **borrowBook**
  - Ensures user exists and not deleted.
  - Prevents duplicate active borrowing of same book.
  - Ensures book exists, not deleted, and copies available.
  - Decrements book copies.
  - Creates `BorrowedBook` with 14-day due date.
  - Adds embedded history item under user.
- **deleteUser**
  - Soft delete user (`isDeleted=true`, `isActived=false`).

## Book module (`src/modules/book/`)

Routes (`book.controller.js`):
- `POST /book/addBook`
- `DELETE /book/deleteBook/:id`
- `PATCH /book/restoreBook/:id`
- `GET /book/getAllBooks`
- `GET /book/getBookById/:id`
- `GET /book/genre/:genre`

Service highlights (`book.service.js`):
- Duplicate check by `title + author + isDeleted:false`.
- Soft delete / restore through `isDeleted`.
- Query endpoints hide internal fields with `.select(...)`.

Validation:
- `addBook` validated (JOI).
- Other routes currently do not validate IDs/params with JOI.

## Library module (`src/modules/library/`)

Routes (`library.controller.js`):
- `POST /library/`
- `PATCH /library/:id`
- `GET /library/`
- `GET /library/:id`
- `POST /library/:libraryId/addBook`
- `DELETE /library/:libraryId/removeBook/:bookId`
- `GET /library/:libraryId/genre/:genre`
- `GET /library/:libraryId/genres`

Service highlights (`library.service.js`):
- Create with duplicate check (`name + location`).
- Update by ID with population.
- Read all/single with book population.
- Add book with `$addToSet` (dedupe).
- Remove book with `$pull`.
- Genre-filtered populated query.
- Distinct genres derived from populated books.

## BorrowedBook module (`src/modules/borrowedBook/`)

Routes (`borrowedBook.controller.js`):
- `GET /borrowed-book/` (overdue list)
- `PATCH /borrowed-book/return/:borrowedBookId` (auth)

Service highlights (`borrowedBook.service.js`):
- Overdue list: records with dueDate < now and returned=false.
- Return flow:
  - ownership check (only borrower can return)
  - marks returned + returnDate + status
  - increments `Book.availableCopies`
  - updates embedded history returnDate in User

---

## 6) GraphQL Layer

## Schema (`src/app.Graphql_Schema.js`)

- Root query merges:
  - `userQuery`
  - `bookQuery`
- Root mutation merges:
  - `userMutation`
  - `bookMutation`

## User GraphQL (`src/modules/user/graphql/`)

Queries:
- `Allusers`
- `Oneuser(id)` (composed middleware: auth(role admin) + validation)

Mutations:
- `signUp`
- `login`
- `deleteUser(id)`

Types:
- user object includes borrowedBooks with nested book resolver.
- login response includes `access_token`, `refresh_token`.

## Book GraphQL (`src/modules/book/graphql/`)

Queries:
- `bookByID(id)`
- `allbooks`
- `bookByGenre(genre)`

Mutations:
- `addBook(input)`
- `deleteBook(id)`
- `restoreBook(id)`

---

## 7) Middleware and Utilities

## REST middleware

- `Authentication.middleware.js`
  - Requires `Authorization: Bearer <token>`.
  - Verifies JWT and loads user minus password into `req.user`.
- `Authorization.middleware.js`
  - Role gate based on supplied allowed roles.
- `validation.middleware.js`
  - JOI validates body + params + query merged payload.

## GraphQL middleware

- `Authentication.graphql.js`
  - Reads auth header from context.
  - Verifies token and optional role list.
- `validation.graphql.js`
  - JOI validation for args.
- `allFunctions.js`
  - Composes resolver with middleware chain.

## Utility modules

- `utils/token/token.js`: sign/verify wrappers.
- `utils/hashing/hash.js`: bcrypt sync hash/compare.
- `utils/encryption/encryption.js`: AES encrypt/decrypt.
- `utils/signWithGoogle/google_login.js`: verify Google ID tokens.
- `utils/emails/sendEmails.js`: SMTP sender + predefined subjects.
- `utils/emails/email.event.js`: event-driven OTP/thank-you sending.
- `utils/emails/generateHTML.js`: HTML templates.
- `utils/errors/asyncHandler.js`: wraps async controllers.
- `utils/errors/globalErrorHandler.js`: final error serialization.

---

## 8) Environment and Deployment

Primary env keys:
- `CONNECTION_URL`
- `PORT`
- `SALTED_ROUNDS`
- `ENCRYPTION_SECRET`
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `JWT_ENCRYPTION_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `GOOGLE_CLIENT_ID`

Deployment:
- `vercel.json` routes all traffic to `index.js` (`@vercel/node`).

---

## 9) Existing Security/Resilience Controls (Already Implemented)

1. `helmet` enabled globally.
2. Global IP rate limiter enabled.
3. JWT-based authentication middleware for protected REST and some GraphQL flows.
4. Role-based authorization in selected REST and GraphQL paths.
5. JOI validation in multiple routes and GraphQL query `Oneuser`.
6. Password hashing with bcrypt.
7. Phone encryption with AES.
8. OTP persistence with TTL expiration index.
9. Soft-delete pattern for users/books.

---

## 10) Missing or Weak Areas (Actionable Hardening Backlog)

## Critical

1. **GraphQL auth gaps**
   - `Allusers` query is public.
   - `deleteUser` mutation has no auth middleware in resolver chain.
2. **GraphQL signup encryption bug**
   - `encrypt({ phone })` is called, but utility expects `data`; can encrypt undefined.
3. **CORS is fully open**
   - No origin allowlist/credential policy for production.
4. **Error stack exposure condition appears inverted**
   - `globalErrorHandler` adds stack when `NODE_ENV !== "development"`.

## High

1. **Refresh token lifecycle not managed**
   - No persistence/rotation/revocation/blacklist/logout handling.
2. **No brute-force protections on login/OTP**
   - Missing per-route limits / lockouts / backoff.
3. **Global rate limit policy too coarse**
   - A single shared budget (currently 100 requests/5min) for the entire app conflates auth, reads, and writes, and is easy to bypass by distribution.
4. **DB connection failure does not fail fast**
   - App may keep running in degraded state.

## Medium

1. **Validation coverage incomplete**
   - Many route IDs/params not JOI-validated.
2. **Missing centralized audit/security logging**
   - No structured logs for auth attempts, permission denials, suspicious behavior.
3. **No CSRF model decision documented**
   - If browser cookies are introduced later, CSRF controls must be added.
4. **No security headers fine-tuning**
   - Helmet defaults used, no CSP/reporting strategy.

## Low (but important for production quality)

1. **No automated tests**
   - Unit/integration coverage absent.
2. **No API versioning strategy**
   - Could complicate frontend evolution.
3. **No health/readiness endpoints**
   - Harder production monitoring and orchestration.
4. **No OpenAPI/Postman source-of-truth automation**
   - Docs drift risk.

---

## 11) Recommended Implementation Order

1. Lock down GraphQL auth + fix GraphQL encryption bug.
2. Correct error stack policy + enforce fail-fast DB startup.
3. Split rate limiters by endpoint class (auth vs public reads vs writes).
4. Restrict CORS by environment.
5. Add refresh token persistence/rotation/revoke.
6. Expand JOI coverage for IDs/params and normalize error responses.
7. Add structured logging + health endpoints.
8. Add baseline automated tests for auth/borrow/return flows.

---

## 12) Frontend Integration Notes

- No refresh-token endpoint exists yet (see High #1 above), so the frontend keeps tokens in-memory only rather than persisting an unredeemable refresh token.
- GraphQL is not equally hardened (see Critical #1 above: `Allusers` and `deleteUser` have no auth, `signUp` skips OTP and accepts a client-supplied `role`) — the frontend treats it as internal/experimental and doesn't build UI on top of it.
- REST business errors mostly arrive as HTTP 500 rather than their intended 4xx (see Critical #4 / the `next(err, {cause})` pattern used throughout the REST services) — the frontend matches on `response.data.message` instead of status code for these.
- There is no REST endpoint to fetch a user's own borrow history (`User.borrowedBooks[]` is only reachable via the admin-only GraphQL `Oneuser`) — the frontend works around this with a local, per-device loan registry. A proper fix would be an authenticated `GET /user/me` or `GET /user/borrowedBooks`.

## 13) Frontend (`frontend/app/`)

Next.js 16 (App Router) + TypeScript + Tailwind v4, REST-only client (no GraphQL — see above). TanStack Query for server state, react-hook-form + zod for forms, axios for HTTP.

```
frontend/
  phase-0*.md       planning docs (product scope → deployment), one per phase
  ops-runbook.md     known backend limitations, release checklist, monitoring
  app/
    src/app/         routes (App Router)
    src/components/  ui primitives + layout (Navbar/Footer)
    src/features/    domain hooks + view components (books, libraries, loans)
    src/lib/api/     axios instance + typed per-module clients + DTOs
    src/lib/auth/    in-memory token store, AuthContext, RequireAuth guard
    src/lib/validation/  zod schemas mirrored from backend Joi schemas
```

Full architecture, environment variables, and testing notes: `frontend/app/README.md`. Full list of backend-driven design decisions (why GraphQL is unused, why tokens aren't persisted, why "My Books" is local-only, etc.) and the release/monitoring checklist: `frontend/ops-runbook.md`.
