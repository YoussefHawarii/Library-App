"use client";

import { useState } from "react";
import { BookMarked, Info, Undo2 } from "lucide-react";
import { RequireAuth } from "@/lib/auth/RequireAuth";
import { useMyLoans } from "@/features/loans/useMyLoans";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, InlineBanner } from "@/components/ui/States";
import { borrowedBooksApi } from "@/lib/api/borrowedBooks.api";
import { parseApiError } from "@/lib/api/http";
import { formatDate, isOverdue } from "@/lib/utils/format";

function MyBooksContent() {
  const { loans, markReturned } = useMyLoans();
  const [returningId, setReturningId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const active = loans.filter((l) => l.status !== "returned" && !l.returnDate);
  const past = loans.filter((l) => l.status === "returned" || l.returnDate);

  const handleReturn = async (borrowedBookId: string) => {
    setReturningId(borrowedBookId);
    setErrors((prev) => ({ ...prev, [borrowedBookId]: "" }));
    try {
      const res = await borrowedBooksApi.returnBook(borrowedBookId);
      markReturned(borrowedBookId, res.data.returnDate ?? new Date().toISOString());
    } catch (err) {
      setErrors((prev) => ({ ...prev, [borrowedBookId]: parseApiError(err).message }));
    } finally {
      setReturningId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif-heading text-3xl font-semibold">My Books</h1>
        <p className="mt-1 text-sm text-ink-soft">Loans you&apos;ve made from this device.</p>
      </div>

      <InlineBanner tone="warning">
        <span className="inline-flex items-start gap-1.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          The backend doesn&apos;t yet expose an endpoint to fetch a user&apos;s full borrow
          history, so this list is kept on this device/browser only, starting from books you
          borrow here. It won&apos;t show loans made elsewhere.
        </span>
      </InlineBanner>

      {loans.length === 0 && (
        <EmptyState
          title="No loans yet"
          description="Borrow a book from the catalog to see it here."
        />
      )}

      {active.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-serif-heading text-lg font-semibold">Currently borrowed</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {active.map((loan) => (
              <Card key={loan.borrowedBookId} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <BookMarked className="h-5 w-5 text-forest" />
                  <Badge tone={isOverdue(loan.dueDate, loan.returnDate) ? "danger" : "neutral"}>
                    {isOverdue(loan.dueDate, loan.returnDate) ? "Overdue" : "Due " + formatDate(loan.dueDate)}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-serif-heading text-base font-semibold">{loan.bookTitle}</h3>
                  <p className="text-sm text-ink-soft">{loan.bookAuthor}</p>
                </div>
                <p className="text-xs text-ink-faint">Borrowed {formatDate(loan.borrowedAt)}</p>
                {errors[loan.borrowedBookId] && <InlineBanner>{errors[loan.borrowedBookId]}</InlineBanner>}
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-fit"
                  loading={returningId === loan.borrowedBookId}
                  onClick={() => handleReturn(loan.borrowedBookId)}
                >
                  <Undo2 className="h-4 w-4" /> Return book
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-serif-heading text-lg font-semibold">Returned</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {past.map((loan) => (
              <Card key={loan.borrowedBookId} className="flex flex-col gap-2 opacity-80">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-serif-heading text-base font-semibold">{loan.bookTitle}</h3>
                  <Badge tone="success">Returned</Badge>
                </div>
                <p className="text-sm text-ink-soft">{loan.bookAuthor}</p>
                <p className="text-xs text-ink-faint">
                  {formatDate(loan.borrowedAt)} — {formatDate(loan.returnDate)}
                </p>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function MyBooksPage() {
  return (
    <RequireAuth>
      <MyBooksContent />
    </RequireAuth>
  );
}
