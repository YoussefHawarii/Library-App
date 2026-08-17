"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { booksApi } from "@/lib/api/books.api";
import { borrowedBooksApi } from "@/lib/api/borrowedBooks.api";
import type { Book } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { recordBorrow } from "@/lib/loans/loanRegistry";

export const booksQueryKey = ["books"] as const;

export function useBooks() {
  return useQuery({ queryKey: booksQueryKey, queryFn: booksApi.getAll });
}

export function useBook(id: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["book", id],
    queryFn: () => booksApi.getById(id),
    // Reuse a copy already loaded by the list page instead of firing a
    // second request against a tightly rate-limited API.
    initialData: () =>
      queryClient.getQueryData<Book[]>(booksQueryKey)?.find((book) => book._id === id),
  });
}

export function useGenres(books: Book[] | undefined) {
  return useMemo(() => {
    if (!books) return [];
    return Array.from(new Set(books.map((book) => book.genre))).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [books]);
}

export function useBorrowBook() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (book: Book) => borrowedBooksApi.borrow(book._id).then((res) => ({ book, res })),
    onSuccess: ({ book, res }) => {
      if (user) {
        recordBorrow(user.id, book, res.data);
      }
      // Optimistically reflect the decremented copy count everywhere it's
      // cached, avoiding an extra GET against the shared global rate limit.
      queryClient.setQueryData<Book[]>(booksQueryKey, (prev) =>
        prev?.map((b) => (b._id === book._id ? { ...b, availableCopies: b.availableCopies - 1 } : b))
      );
      queryClient.setQueryData<Book>(["book", book._id], (prev) =>
        prev ? { ...prev, availableCopies: prev.availableCopies - 1 } : prev
      );
    },
  });
}
