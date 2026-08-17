import Link from "next/link";
import { BookMarked } from "lucide-react";
import type { Book } from "@/lib/api/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function BookCard({ book }: { book: Book }) {
  return (
    <Link href={`/books/${book._id}`}>
      <Card className="flex h-full flex-col gap-3 transition-transform hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_var(--gold)]">
        <div className="flex items-start justify-between gap-2">
          <BookMarked className="h-5 w-5 shrink-0 text-forest" />
          <Badge tone={book.availableCopies > 0 ? "success" : "danger"}>
            {book.availableCopies > 0 ? `${book.availableCopies} available` : "None available"}
          </Badge>
        </div>
        <div>
          <h3 className="font-serif-heading text-base font-semibold leading-snug text-ink">{book.title}</h3>
          <p className="text-sm text-ink-soft">{book.author}</p>
        </div>
        <div className="mt-auto flex items-center justify-between text-xs text-ink-faint">
          <span>{book.genre}</span>
          <span>{book.publishedYear}</span>
        </div>
      </Card>
    </Link>
  );
}
