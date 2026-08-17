import axios, { AxiosError } from "axios";
import { getAccessToken, clearTokens } from "@/lib/auth/token-store";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseURL && typeof window !== "undefined") {
  // Fail loudly in the browser console rather than silently hitting a relative URL.
  console.error(
    "NEXT_PUBLIC_API_BASE_URL is not set — API requests will fail. Check your .env.local."
  );
}

export const http = axios.create({
  baseURL,
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * The backend's REST error handler has a bug: business errors are raised via
 * `next(new Error(msg), { cause })`, but Express's `next(err)` only reads the
 * first argument, so `cause` is silently dropped and every REST business
 * error (already-exists, not-found, unauthorized, forbidden, ...) comes back
 * as HTTP 500 instead of its intended 4xx code. GraphQL responses are not
 * affected (they use `new Error(msg, { cause })`, read correctly there).
 *
 * So for REST calls we cannot branch on `error.response.status` for expected
 * business failures — we surface `response.data.message` as the source of
 * truth and only treat status codes as reliable for transport-level cases
 * (429 rate limit, network failure, and true 401 fallback).
 */
export type ApiErrorInfo = {
  status: number | null;
  message: string;
  isRateLimited: boolean;
  isLikelyAuthFailure: boolean;
  isNetworkError: boolean;
};

// Deliberately narrow: only patterns that unambiguously mean "your session
// token is missing/invalid", never business-rule 403s like "you are not
// allowed to return this record" (ownership check) which would wrongly log
// the user out if matched here.
const AUTH_FAILURE_PATTERNS = [/no token/i, /token .*(required|expired|invalid)/i, /invalid.*jwt|jwt.*invalid/i, /unauthenticated/i];

export function parseApiError(error: unknown): ApiErrorInfo {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<unknown>;
    const status = axiosError.response?.status ?? null;

    if (!axiosError.response) {
      return {
        status: null,
        message: "Could not reach the server. Check your connection and try again.",
        isRateLimited: false,
        isLikelyAuthFailure: false,
        isNetworkError: true,
      };
    }

    if (status === 429) {
      return {
        status,
        message:
          "Too many requests — the API is temporarily rate limited. Please wait a few minutes and try again.",
        isRateLimited: true,
        isLikelyAuthFailure: false,
        isNetworkError: false,
      };
    }

    const data = axiosError.response.data;
    const message =
      typeof data === "string"
        ? data
        : (data as ApiMessageLike | undefined)?.message ?? axiosError.message;

    // Note: 403 is intentionally excluded — it's used for legitimate
    // business-rule denials (e.g. "not allowed to return this record") that
    // must not force a logout.
    const isLikelyAuthFailure =
      status === 401 || AUTH_FAILURE_PATTERNS.some((pattern) => pattern.test(message));

    return {
      status,
      message: message || "Something went wrong. Please try again.",
      isRateLimited: false,
      isLikelyAuthFailure,
      isNetworkError: false,
    };
  }

  return {
    status: null,
    message: "An unexpected error occurred.",
    isRateLimited: false,
    isLikelyAuthFailure: false,
    isNetworkError: false,
  };
}

interface ApiMessageLike {
  message?: string;
}

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const info = parseApiError(error);
    if (info.isLikelyAuthFailure && typeof window !== "undefined") {
      clearTokens();
    }
    return Promise.reject(error);
  }
);
