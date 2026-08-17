"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { listLoans, recordReturn } from "@/lib/loans/loanRegistry";

export function useMyLoans() {
  const { user } = useAuth();
  // localStorage isn't reactive on its own, so a version counter forces a
  // re-render (and therefore a fresh listLoans() read below) after a
  // mutation, without needing an effect+setState round trip.
  const [, forceRefresh] = useState(0);

  const loans = user ? listLoans(user.id) : [];

  const markReturned = useCallback(
    (borrowedBookId: string, returnDate: string) => {
      if (!user) return;
      recordReturn(user.id, borrowedBookId, returnDate);
      forceRefresh((v) => v + 1);
    },
    [user]
  );

  return { loans, markReturned };
}
