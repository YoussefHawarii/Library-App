"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useBooks, useGenres } from "@/features/books/hooks";
import { BookCard } from "@/features/books/BookCard";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/States";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";
import { parseApiError } from "@/lib/api/http";

export default function BooksPage() {
  const { data: books, isLoading, isError, error, refetch } = useBooks();
  const genres = useGenres(books);
  const [genre, setGenre] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!books) return [];
    return books.filter((book) => {
      const matchesGenre = !genre || book.genre === genre;
      const matchesSearch =
        !search ||
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase());
      return matchesGenre && matchesSearch;
    });
  }, [books, genre, search]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif-heading text-3xl font-semibold">Books</h1>
        <p className="mt-1 text-sm text-ink-soft">Browse the full catalog, filter by genre.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <Input
            placeholder="Search title or author"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setGenre(null)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                !genre ? "border-forest bg-forest text-paper-raised" : "border-border text-ink-soft hover:bg-forest-soft"
              )}
            >
              All genres
            </button>
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium",
                  genre === g ? "border-forest bg-forest text-paper-raised" : "border-border text-ink-soft hover:bg-forest-soft"
                )}
              >
                {g}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading && <LoadingState label="Loading books…" />}
      {isError && <ErrorState message={parseApiError(error).message} onRetry={() => refetch()} />}
      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState title="No books found" description="Try a different search term or genre." />
      )}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
