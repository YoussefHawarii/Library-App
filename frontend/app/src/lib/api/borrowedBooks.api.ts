import { http } from "@/lib/api/http";
import type { BorrowedBook } from "@/lib/api/types";

export const borrowedBooksApi = {
  borrow: (bookId: string) =>
    http
      .post<{ message: string; data: BorrowedBook }>(`/user/borrowedBooks/${bookId}`)
      .then((res) => res.data),

  returnBook: (borrowedBookId: string) =>
    http
      .patch<{ message: string; data: BorrowedBook }>(`/borrowed-book/return/${borrowedBookId}`)
      .then((res) => res.data),

  getOverdue: () =>
    http
      .get<{ message: string; data: BorrowedBook[] }>("/borrowed-book/")
      .then((res) => res.data.data),
};
