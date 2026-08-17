// DTOs mirrored from the backend Mongoose models / REST response shapes.
// See CLAUDE.md (backend) sections 4 and 5 for the source of truth.

export type Role = "admin" | "user";
export type Provider = "google" | "system";

export interface Book {
  _id: string;
  title: string;
  author: string;
  genre: string;
  publishedYear: number;
  availableCopies: number;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Library {
  _id: string;
  name: string;
  location: string;
  books: Book[] | string[];
  createdAt?: string;
  updatedAt?: string;
}

export type BorrowedBookStatus = "borrowed" | "returned" | "overdue";

export interface BorrowedBook {
  _id: string;
  userId: string | { _id: string; name: string; email: string };
  bookId: string | { _id: string; title: string; author: string };
  borrowedAt: string;
  dueDate: string;
  returnDate: string | null;
  status: BorrowedBookStatus;
  returned: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface DecodedAccessToken {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

export interface ApiMessage {
  message: string;
}
