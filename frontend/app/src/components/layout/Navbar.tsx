"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/books", label: "Books" },
  { href: "/libraries", label: "Libraries" },
  { href: "/overdue", label: "Overdue" },
];

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-paper/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-serif-heading text-lg font-semibold text-forest">
          <BookOpen className="h-6 w-6" />
          <span>Athenaeum</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-sm px-3 py-2 text-sm font-medium transition-colors hover:bg-forest-soft hover:text-forest-dark",
                pathname?.startsWith(link.href) ? "text-forest" : "text-ink-soft"
              )}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              href="/my-books"
              className={cn(
                "rounded-sm px-3 py-2 text-sm font-medium transition-colors hover:bg-forest-soft hover:text-forest-dark",
                pathname?.startsWith("/my-books") ? "text-forest" : "text-ink-soft"
              )}
            >
              My Books
            </Link>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-ink-soft">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-sm px-3 py-2 text-sm font-medium text-burgundy hover:bg-burgundy-soft"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-sm px-3 py-2 text-sm font-medium text-ink-soft hover:text-forest">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-sm bg-forest px-3 py-2 text-sm font-medium text-paper-raised hover:bg-forest-dark"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-paper px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-1 pt-2">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-sm px-3 py-2 text-sm font-medium text-ink-soft hover:bg-forest-soft" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link href="/my-books" className="rounded-sm px-3 py-2 text-sm font-medium text-ink-soft hover:bg-forest-soft" onClick={() => setOpen(false)}>
                My Books
              </Link>
            )}
            <div className="mt-2 flex flex-col gap-1 border-t border-border pt-2">
              {isAuthenticated ? (
                <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-left text-sm font-medium text-burgundy">
                  <LogOut className="h-4 w-4" /> Log out ({user?.email})
                </button>
              ) : (
                <>
                  <Link href="/login" className="rounded-sm px-3 py-2 text-sm font-medium text-ink-soft" onClick={() => setOpen(false)}>
                    Log in
                  </Link>
                  <Link href="/signup" className="rounded-sm px-3 py-2 text-sm font-medium text-forest" onClick={() => setOpen(false)}>
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
