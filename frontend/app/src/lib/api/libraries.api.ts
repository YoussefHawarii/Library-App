import { http } from "@/lib/api/http";
import type { Book, Library } from "@/lib/api/types";

export interface CreateLibraryInput {
  name: string;
  location: string;
  books?: string[];
}

export interface UpdateLibraryInput {
  name?: string;
  location?: string;
  books?: string[];
}

export interface LibraryGenreBooksResult {
  library: string;
  location: string;
  genre: string;
  books: Book[];
  totalBooks: number;
}

export interface LibraryGenresResult {
  library: string;
  genres: string[];
  totalGenres: number;
}

export const librariesApi = {
  getAll: () => http.get<{ libraries: Library[] }>("/library/").then((res) => res.data.libraries),

  getById: (id: string) =>
    http.get<{ library: Library }>(`/library/${id}`).then((res) => res.data.library),

  create: (input: CreateLibraryInput) =>
    http
      .post<{ message: string; library: Library }>("/library/", input)
      .then((res) => res.data),

  update: (id: string, input: UpdateLibraryInput) =>
    http
      .patch<{ message: string; library: Library }>(`/library/${id}`, input)
      .then((res) => res.data),

  addBook: (libraryId: string, bookId: string) =>
    http
      .post<{ message: string; library: Library }>(`/library/${libraryId}/addBook`, { bookId })
      .then((res) => res.data),

  removeBook: (libraryId: string, bookId: string) =>
    http
      .delete<{ message: string; library: Library }>(`/library/${libraryId}/removeBook/${bookId}`)
      .then((res) => res.data),

  getBooksByGenre: (libraryId: string, genre: string) =>
    http
      .get<LibraryGenreBooksResult>(
        `/library/${libraryId}/genre/${encodeURIComponent(genre)}`
      )
      .then((res) => res.data),

  getGenres: (libraryId: string) =>
    http.get<LibraryGenresResult>(`/library/${libraryId}/genres`).then((res) => res.data),
};
