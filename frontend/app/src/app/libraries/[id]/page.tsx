"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { useLibrary } from "@/features/libraries/hooks";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/States";
import { cn } from "@/lib/utils/cn";
import { parseApiError } from "@/lib/api/http";
import type { Book } from "@/lib/api/types";
import { BookCard } from "@/features/books/BookCard";

export default function LibraryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: library, isLoading, isError, error, refetch } = useLibrary(id);
  const [genre, setGenre] = useState<string | null>(null);

  const books = useMemo<Book[]>(
    () => (library?.books ?? []).filter((b): b is Book => typeof b === "object"),
    [library]
  );
  const genres = useMemo(
    () => Array.from(new Set(books.map((b) => b.genre))).sort((a, b) => a.localeCompare(b)),
    [books]
  );
  const filtered = genre ? books.filter((b) => b.genre === genre) : books;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/libraries" className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-forest">
        <ArrowLeft className="h-4 w-4" /> Back to libraries
      </Link>

      {isLoading && <LoadingState label="Loading library…" />}
      {isError && <ErrorState message={parseApiError(error).message} onRetry={() => refetch()} />}

      {library && (
        <>
          <div>
            <h1 className="font-serif-heading text-3xl font-semibold">{library.name}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
              <MapPin className="h-4 w-4" /> {library.location}
            </p>
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

          {books.length === 0 ? (
            <EmptyState title="No books in this library yet" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
