import { http } from "@/lib/api/http";
import type { ApiMessage, Book } from "@/lib/api/types";

export interface AddBookInput {
  title: string;
  author: string;
  genre: string;
  publishedYear: number;
  availableCopies: number;
}

export const booksApi = {
  getAll: () => http.get<{ books: Book[] }>("/book/getAllBooks").then((res) => res.data.books),

  getById: (id: string) =>
    http.get<{ book: Book }>(`/book/getBookById/${id}`).then((res) => res.data.book),

  getByGenre: (genre: string) =>
    http
      .get<{ books: Book[]; genre?: string; totalBooks?: number; message?: string }>(
        `/book/genre/${encodeURIComponent(genre)}`
      )
      .then((res) => res.data.books ?? []),

  add: (input: AddBookInput) =>
    http.post<{ message: string; book: Book }>("/book/addBook", input).then((res) => res.data),

  remove: (id: string) =>
    http.delete<ApiMessage>(`/book/deleteBook/${id}`).then((res) => res.data),

  restore: (id: string) =>
    http.patch<ApiMessage>(`/book/restoreBook/${id}`).then((res) => res.data),
};
