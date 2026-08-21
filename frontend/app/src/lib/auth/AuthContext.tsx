"use client";

import { jwtDecode } from "jwt-decode";
import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { authApi, type LoginInput } from "@/lib/api/auth.api";
import type { DecodedAccessToken } from "@/lib/api/types";
import { clearTokens, getAccessToken, setTokens, subscribe } from "@/lib/auth/token-store";

interface SessionUser {
  id: string;
  email: string;
}

interface AuthContextValue {
  user: SessionUser | null;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeUser(token: string | null): SessionUser | null {
  if (!token) return null;
  try {
    const decoded = jwtDecode<DecodedAccessToken>(token);
    if (decoded.exp * 1000 < Date.now()) return null;
    return { id: decoded.id, email: decoded.email };
  } catch {
    return null;
  }
}

const getSnapshot = () => getAccessToken();
const getServerSnapshot = () => null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Tokens are an external store (module-level variable in token-store.ts),
  // so useSyncExternalStore is the correct primitive here rather than
  // useState+useEffect — it also sidesteps any hydration mismatch for free,
  // since the server snapshot (no token) and the client's first snapshot
  // (also no token, as tokens are never persisted across a reload) always
  // agree.
  const token = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const user = useMemo(() => decodeUser(token), [token]);

  const login = useCallback(async (input: LoginInput) => {
    const data = await authApi.login(input);
    setTokens(data);
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const data = await authApi.googleLogin(idToken);
    setTokens(data);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      loginWithGoogle,
      logout,
    }),
    [user, login, loginWithGoogle, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
