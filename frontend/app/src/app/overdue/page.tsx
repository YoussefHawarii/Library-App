"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { borrowedBooksApi } from "@/lib/api/borrowedBooks.api";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/States";
import { Card } from "@/components/ui/Card";
import { parseApiError } from "@/lib/api/http";
import { formatDate } from "@/lib/utils/format";

export default function OverduePage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["overdue"],
    queryFn: borrowedBooksApi.getOverdue,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif-heading text-3xl font-semibold">Overdue Books</h1>
        <p className="mt-1 text-sm text-ink-soft">Library-wide list of loans past their due date.</p>
      </div>

      {isLoading && <LoadingState label="Loading overdue books…" />}
      {isError && <ErrorState message={parseApiError(error).message} onRetry={() => refetch()} />}
      {!isLoading && !isError && (!data || data.length === 0) && (
        <EmptyState title="Nothing overdue" description="All borrowed books are within their due date." />
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.map((record) => {
            const book = typeof record.bookId === "object" ? record.bookId : null;
            const borrower = typeof record.userId === "object" ? record.userId : null;
            return (
              <Card key={record._id} className="flex flex-col gap-2 border-burgundy-soft">
                <div className="flex items-center gap-2 text-burgundy">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Overdue</span>
                </div>
                <h3 className="font-serif-heading text-base font-semibold">
                  {book?.title ?? "Unknown title"}
                </h3>
                {book && <p className="text-sm text-ink-soft">{book.author}</p>}
                <p className="text-xs text-ink-faint">Due {formatDate(record.dueDate)}</p>
                {borrower && <p className="text-xs text-ink-faint">Borrower: {borrower.name}</p>}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
