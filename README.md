# Athenaeum — Library Management System

A full-stack library management app: browse a book catalog, see which library
branch holds a title, sign up with email OTP verification, log in, and borrow
/ return books. Built as a Node.js/Express/MongoDB REST + GraphQL API with a
Next.js frontend on top.

## Project structure

This is one repository with two apps:

```
.
├── index.js, src/          backend — Node.js/Express/MongoDB REST + GraphQL API
├── frontend/app/           frontend — Next.js (App Router, TypeScript) client
├── frontend/ops-runbook.md frontend release/monitoring notes + known backend limitations
└── CLAUDE.md                deep documentation for both apps (architecture, routes, schemas)
```

For anything beyond this overview — full REST/GraphQL route reference, data
models, middleware, security backlog — see [`CLAUDE.md`](CLAUDE.md), which is
the maintained source of truth for both apps' internals.

## Tech stack

**Backend**
- Node.js `20.15.1`, Express `5`
- MongoDB + Mongoose
- REST + GraphQL (`graphql`, `graphql-http`) in the same service
- JWT auth (`jsonwebtoken`) with email OTP signup and Google login (`google-auth-library`)
- Joi validation, bcrypt password hashing, AES phone encryption (`crypto-js`)
- Nodemailer (OTP/welcome emails), Helmet, CORS, `express-rate-limit`

**Frontend**
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 — custom "reading room" theme
- TanStack Query for server-state caching
- react-hook-form + zod for form validation
- axios with a shared interceptor layer
- Vitest + Testing Library for unit tests

## Getting started

Run the backend and frontend as two separate processes.

### 1. Backend (repo root)

Create a `.env` file:

```env
CONNECTION_URL=your_mongodb_connection_string
PORT=3000
SALTED_ROUNDS=10
ENCRYPTION_SECRET=your_encryption_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
JWT_ENCRYPTION_SECRET=your_jwt_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

> `EMAIL_PASSWORD` must be a Gmail **App Password** (Google Account → Security
> → 2-Step Verification → App Passwords) — a regular account password will be
> rejected by Gmail's SMTP auth.

```bash
npm install
npm run dev     # nodemon --env-file=.env index.js
# or: npm start # node --watch index.js
```

### 2. Frontend (`frontend/app/`)

```bash
cd frontend/app
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_BASE_URL to the backend above
npm run dev                  # runs on its own port — pass e.g. `-- -p 3001` if 3000 is taken
```

The frontend talks to the backend over plain HTTP using the bare REST paths
below (`/user`, `/book`, `/library`, `/borrowed-book`) — no GraphQL, see
`frontend/ops-runbook.md` for why. Full frontend setup/architecture notes:
[`frontend/app/README.md`](frontend/app/README.md).

## API Routes

Base URL (local): `http://localhost:<PORT>`

### User Routes (`/user`)

- `POST /sendOTP` - send signup OTP to email
- `POST /signUp` - create account using OTP
- `POST /login` - login and get access/refresh tokens
- `POST /google-login` - login/register via Google ID token
- `POST /borrowedBooks/:bookId` - borrow a book (requires auth + role)
- `DELETE /delete` - soft-delete authenticated user (requires auth + role)

### Book Routes (`/book`)

- `POST /addBook` - add book
- `DELETE /deleteBook/:id` - soft-delete book
- `PATCH /restoreBook/:id` - restore soft-deleted book
- `GET /getAllBooks` - list all non-deleted books
- `GET /getBookById/:id` - get one book
- `GET /genre/:genre` - list books by genre

### Library Routes (`/library`)

- `POST /` - create library
- `PATCH /:id` - update library
- `GET /` - get all libraries (populated with books)
- `GET /:id` - get library by id
- `POST /:libraryId/addBook` - add one book to library
- `DELETE /:libraryId/removeBook/:bookId` - remove one book from library
- `GET /:libraryId/genre/:genre` - get library books by genre
- `GET /:libraryId/genres` - get distinct genres in library

### Borrowed Book Routes (`/borrowed-book`)

- `GET /` - list overdue borrowed books
- `PATCH /return/:borrowedBookId` - return borrowed book (requires auth)

A GraphQL endpoint is also available at `/graphql`; see `CLAUDE.md` §6 for the
schema. It's not used by the frontend — see `frontend/ops-runbook.md` for why.

## Authentication

Protected endpoints expect:

```http
Authorization: Bearer <access_token>
```

## Core Business Rules (Current Implementation)

- OTP records expire automatically using MongoDB TTL index (5 minutes in schema).
- Passwords are hashed with bcrypt.
- Phone numbers are encrypted before storage.
- Borrow flow:
  - Prevents borrowing the same book twice before return
  - Decrements `availableCopies`
  - Sets due date to `14` days
  - Creates `BorrowedBook` record
- Return flow:
  - Only the same authenticated user can return their borrowed record
  - Marks record as returned and sets return date
  - Increments `availableCopies`
- User and book deletion are soft deletes via `isDeleted`.

## Deployment

`vercel.json` is already configured for serverless deployment of the backend
using `index.js`. If deploying on Vercel, add all `.env` keys as project
environment variables. The frontend deploys separately — see
`frontend/app/README.md` and `frontend/ops-runbook.md`.
