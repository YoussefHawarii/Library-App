import type { Metadata } from "next";
import { Literata, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query/QueryProvider";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { GoogleAuthProvider } from "@/lib/auth/GoogleAuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Athenaeum Library",
  description: "Browse books and libraries, borrow and return titles.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${literata.variable} ${sourceSans.variable} h-full antialiased`}>
      {/* suppressHydrationWarning: some editor/browser extensions (e.g. VS
          Code's "Live Preview") inject a class like `vsc-initialized` onto
          <body> before React hydrates, which is a real DOM difference but
          not one caused by our code and not one we want logged every load. */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <QueryProvider>
          <AuthProvider>
            <GoogleAuthProvider>
              <Navbar />
              <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
              <Footer />
            </GoogleAuthProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
