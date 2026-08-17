/**
 * The backend has no endpoint to fetch "my borrowed books": REST exposes
 * only a public overdue list and a return-by-id action, and GraphQL's
 * `Oneuser` (which embeds borrow history) requires an admin role the signed
 * -in reader doesn't have. `Allusers` *is* public and unauthenticated, but
 * depending on it would mean fetching every user's PII just to find one's
 * own record — building a feature around a backend security hole isn't a
 * trade-off worth taking here.
 *
 * Instead we keep a small per-user loan registry in localStorage, populated
 * from the response of the borrow/return calls this app itself makes. It is
 * scoped to (browser, user id) and is a "loans made from this device"
 * record, not the account's full history — the UI says so explicitly.
 */
import type { BorrowedBook } from "@/lib/api/types";

export interface LocalLoan {
  borrowedBookId: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  borrowedAt: string;
  dueDate: string;
  returnDate: string | null;
  status: BorrowedBook["status"];
}

function storageKey(userId: string) {
  return `library:loans:${userId}`;
}

function read(userId: string): LocalLoan[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    return raw ? (JSON.parse(raw) as LocalLoan[]) : [];
  } catch {
    return [];
  }
}

function write(userId: string, loans: LocalLoan[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(userId), JSON.stringify(loans));
}

export function listLoans(userId: string): LocalLoan[] {
  return read(userId).sort(
    (a, b) => new Date(b.borrowedAt).getTime() - new Date(a.borrowedAt).getTime()
  );
}

export function recordBorrow(
  userId: string,
  book: { _id: string; title: string; author: string },
  borrowed: BorrowedBook
) {
  const loans = read(userId);
  loans.push({
    borrowedBookId: borrowed._id,
    bookId: book._id,
    bookTitle: book.title,
    bookAuthor: book.author,
    borrowedAt: borrowed.borrowedAt,
    dueDate: borrowed.dueDate,
    returnDate: borrowed.returnDate,
    status: borrowed.status,
  });
  write(userId, loans);
}

export function recordReturn(userId: string, borrowedBookId: string, returnDate: string) {
  const loans = read(userId).map((loan) =>
    loan.borrowedBookId === borrowedBookId
      ? { ...loan, returnDate, status: "returned" as const }
      : loan
  );
  write(userId, loans);
}
