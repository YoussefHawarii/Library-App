# Library Management System API

A modular REST API for managing users, books, libraries, and borrowing flows.

Built with Node.js, Express, and MongoDB (Mongoose), with OTP-based signup and JWT authentication.

## Overview

This project provides:

- User registration with email OTP verification
- Login with access and refresh tokens
- Book CRUD-style operations (including soft delete and restore)
- Library management with book linking
- Borrowing and returning logic with due dates
- Overdue borrowed books tracking

## Tech Stack

- Node.js `20.15.1`
- Express `5`
- MongoDB + Mongoose
- Joi (request validation)
- JWT (`jsonwebtoken`)
- Bcrypt (password hashing)
- CryptoJS (phone encryption)
- Nodemailer (email sending)

## Project Structure

```text
LibraryApp/
├── index.js
├── package.json
├── package-lock.json
├── vercel.json
├── README.md
├── TODO.txt
└── src/
    ├── app.controller.js
    ├── DB/
    │   ├── connection.js
    │   └── models/
    │       ├── user.model.js
    │       ├── book.model.js
    │       ├── library.model.js
    │       ├── borrowedBook.model.js
    │       └── OTP.model.js
    ├── middleware/
    │   ├── Authentication.middleware.js
    │   ├── Authorization.middleware.js
    │   └── validation.middleware.js
    ├── modules/
    │   ├── user/
    │   │   ├── user.controller.js
    │   │   ├── user.service.js
    │   │   ├── user.validation.js
    │   │   └── user.endpoints.js
    │   ├── book/
    │   │   ├── book.controller.js
    │   │   ├── book.service.js
    │   │   ├── book.validation.js
    │   │   └── book.endpoints.js
    │   ├── library/
    │   │   ├── library.controller.js
    │   │   ├── library.service.js
    │   │   └── library.validation.js
    │   └── borrowedBook/
    │       ├── borrowedBook.controller.js
    │       └── borrowedBook.service.js
    └── utils/
        ├── emails/
        │   ├── email.event.js
        │   ├── generateHTML.js
        │   └── sendEmails.js
        ├── encryption/
        │   └── encryption.js
        ├── errors/
        │   ├── asyncHandler.js
        │   └── globalErrorHandler.js
        ├── hashing/
        │   └── hash.js
        └── token/
            └── token.js
```

## Environment Variables

Create `.env` in the root with:

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
```

## Installation and Run

```bash
npm install
npm run dev
```

Production mode:

```bash
npm start
```

Server entry point: `index.js`

## API Routes

Base URL (local): `http://localhost:<PORT>`

### User Routes (`/user`)

- `POST /sendOTP` - send signup OTP to email
- `POST /signUp` - create account using OTP
- `POST /login` - login and get access/refresh tokens
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

## Authentication

Protected endpoints expect:

```http
Authorization: Bearer <access_token>
```

Role checks are implemented in `user.endpoints.js`:

- `borrowBook`: `user`
- `deleteUser`: `user`, `admin`

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

`vercel.json` is already configured for serverless deployment using `index.js`.

If deploying on Vercel, add all `.env` keys as project environment variables.
