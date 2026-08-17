import type { AuthTokens } from "@/lib/api/types";

/**
 * Access + refresh tokens are held in memory only (module-level variable),
 * never written to localStorage/sessionStorage/cookies. This follows the
 * frontend's phase-03 spec ("in-memory access token") and is the safest
 * option given the backend currently has no refresh/rotation endpoint to
 * redeem a persisted refresh token against — persisting a secret nobody can
 * use yet is pure downside (XSS-readable) with zero UX benefit.
 *
 * Trade-off: a full page reload clears the session and the user must log
 * in again. This is called out in the UI and in the ops runbook.
 */
let accessToken: string | null = null;
let refreshToken: string | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function setTokens(tokens: AuthTokens) {
  accessToken = tokens.access_token;
  refreshToken = tokens.refresh_token;
  notify();
}

export function clearTokens() {
  if (accessToken === null && refreshToken === null) return;
  accessToken = null;
  refreshToken = null;
  notify();
}

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  return refreshToken;
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
