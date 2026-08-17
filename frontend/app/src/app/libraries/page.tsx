"use client";

import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import { useLibraries } from "@/features/libraries/hooks";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/States";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { parseApiError } from "@/lib/api/http";

export default function LibrariesPage() {
  const { data: libraries, isLoading, isError, error, refetch } = useLibraries();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif-heading text-3xl font-semibold">Libraries</h1>
        <p className="mt-1 text-sm text-ink-soft">Browse branches and the shelves they hold.</p>
      </div>

      {isLoading && <LoadingState label="Loading libraries…" />}
      {isError && <ErrorState message={parseApiError(error).message} onRetry={() => refetch()} />}
      {!isLoading && !isError && (!libraries || libraries.length === 0) && (
        <EmptyState title="No libraries yet" />
      )}

      {!isLoading && !isError && libraries && libraries.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {libraries.map((library) => (
            <Link key={library._id} href={`/libraries/${library._id}`}>
              <Card className="flex h-full flex-col gap-3 transition-transform hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_var(--gold)]">
                <Building2 className="h-6 w-6 text-forest" />
                <h3 className="font-serif-heading text-lg font-semibold">{library.name}</h3>
                <p className="flex items-center gap-1.5 text-sm text-ink-soft">
                  <MapPin className="h-4 w-4" /> {library.location}
                </p>
                <Badge tone="neutral">
                  {Array.isArray(library.books) ? library.books.length : 0} titles
                </Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
