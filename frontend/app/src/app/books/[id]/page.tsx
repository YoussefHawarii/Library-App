"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookMarked, CalendarCheck } from "lucide-react";
import { useBook, useBorrowBook } from "@/features/books/hooks";
import { LoadingState, ErrorState, InlineBanner } from "@/components/ui/States";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { parseApiError } from "@/lib/api/http";
import { useAuth } from "@/lib/auth/AuthContext";
import { formatDate } from "@/lib/utils/format";

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: book, isLoading, isError, error, refetch } = useBook(id);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const borrow = useBorrowBook();
  const [borrowError, setBorrowError] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null);

  const handleBorrow = async () => {
    if (!book) return;
    setBorrowError(null);
    try {
      const { res } = await borrow.mutateAsync(book);
      setDueDate(res.data.dueDate);
    } catch (err) {
      setBorrowError(parseApiError(err).message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Link href="/books" className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-forest">
        <ArrowLeft className="h-4 w-4" /> Back to books
      </Link>

      {isLoading && <LoadingState label="Loading book…" />}
      {isError && <ErrorState message={parseApiError(error).message} onRetry={() => refetch()} />}

      {book && (
        <Card className="flex flex-col gap-5 sm:max-w-xl">
          <div className="flex items-start justify-between gap-3">
            <BookMarked className="h-8 w-8 text-forest" />
            <Badge tone={book.availableCopies > 0 ? "success" : "danger"}>
              {book.availableCopies > 0 ? `${book.availableCopies} available` : "None available"}
            </Badge>
          </div>
          <div>
            <h1 className="font-serif-heading text-2xl font-semibold">{book.title}</h1>
            <p className="mt-1 text-ink-soft">by {book.author}</p>
          </div>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-ink-faint">Genre</dt>
            <dd className="text-ink">{book.genre}</dd>
            <dt className="text-ink-faint">Published</dt>
            <dd className="text-ink">{book.publishedYear}</dd>
          </dl>

          {borrowError && <InlineBanner>{borrowError}</InlineBanner>}

          {dueDate ? (
            <InlineBanner tone="success">
              <span className="inline-flex items-center gap-1.5">
                <CalendarCheck className="h-4 w-4" /> Borrowed! Due back {formatDate(dueDate)}.
              </span>{" "}
              <Link href="/my-books" className="font-medium underline underline-offset-2">
                View my books
              </Link>
            </InlineBanner>
          ) : isAuthenticated ? (
            <Button
              onClick={handleBorrow}
              loading={borrow.isPending}
              disabled={book.availableCopies === 0}
              className="w-fit"
            >
              Borrow this book
            </Button>
          ) : (
            <Button onClick={() => router.push(`/login?next=/books/${book._id}`)} className="w-fit">
              Log in to borrow
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
