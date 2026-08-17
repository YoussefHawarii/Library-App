import Link from "next/link";
import { BookOpen, Building2, Undo2 } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col items-start gap-6 py-8">
        <span className="rounded-full bg-gold-soft px-3 py-1 text-xs font-medium tracking-wide text-ink uppercase">
          Reading room, digitized
        </span>
        <h1 className="max-w-2xl font-serif-heading text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Find a book, find its library, and keep track of what you borrow.
        </h1>
        <p className="max-w-xl text-ink-soft">
          Athenaeum is a small front door onto the library catalog — browse titles by genre,
          see which branch holds them, and manage what&apos;s currently on loan to you.
        </p>
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/books">Browse books</LinkButton>
          <LinkButton href="/libraries" variant="secondary">
            Explore libraries
          </LinkButton>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="flex flex-col gap-3">
          <BookOpen className="h-6 w-6 text-forest" />
          <h2 className="font-serif-heading text-lg font-semibold">Catalog</h2>
          <p className="text-sm text-ink-soft">
            Search the full book catalog and filter by genre to find your next read.
          </p>
          <Link href="/books" className="text-sm font-medium text-forest underline underline-offset-2">
            Go to books
          </Link>
        </Card>
        <Card className="flex flex-col gap-3">
          <Building2 className="h-6 w-6 text-forest" />
          <h2 className="font-serif-heading text-lg font-semibold">Libraries</h2>
          <p className="text-sm text-ink-soft">
            See which branches hold a title, and browse each library&apos;s own shelves.
          </p>
          <Link href="/libraries" className="text-sm font-medium text-forest underline underline-offset-2">
            Go to libraries
          </Link>
        </Card>
        <Card className="flex flex-col gap-3">
          <Undo2 className="h-6 w-6 text-forest" />
          <h2 className="font-serif-heading text-lg font-semibold">My Books</h2>
          <p className="text-sm text-ink-soft">
            Track what you&apos;ve borrowed from this device and return it when you&apos;re done.
          </p>
          <Link href="/my-books" className="text-sm font-medium text-forest underline underline-offset-2">
            Go to my books
          </Link>
        </Card>
      </section>
    </div>
  );
}
