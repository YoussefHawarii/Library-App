"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // The backend applies a single global rate limit (100 requests / 5 minutes)
  // across every route, REST and GraphQL alike. It's generous enough for
  // normal interactive use, but still shared across the whole app and every
  // route, so defaults stay a little conservative rather than refetching
  // freely: a moderate staleTime so navigating back to an already-fetched
  // view doesn't refetch, no refetch-on-focus, and 2 retries (not the
  // default 3) so one flaky call doesn't eat too much of the budget.
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 2,
            // Default 'online' mode pauses queries (fetchStatus: 'paused')
            // when the onlineManager briefly reports offline, which then
            // never surfaces as an error to the UI. 'always' guarantees a
            // failed request reaches isError so users see a real message.
            networkMode: "always",
          },
          mutations: {
            retry: 0,
            networkMode: "always",
          },
        },
      })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
