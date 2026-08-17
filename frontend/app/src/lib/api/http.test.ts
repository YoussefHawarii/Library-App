import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import { parseApiError } from "./http";

function makeAxiosError(opts: {
  status?: number;
  data?: unknown;
  hasResponse?: boolean;
  message?: string;
}) {
  const error = new AxiosError(opts.message ?? "Request failed");
  error.config = { headers: new AxiosHeaders() } as never;
  if (opts.hasResponse !== false) {
    error.response = {
      status: opts.status ?? 500,
      data: opts.data,
      statusText: "",
      headers: {},
      config: error.config,
    };
  }
  return error;
}

describe("parseApiError", () => {
  it("flags network errors distinctly", () => {
    const info = parseApiError(makeAxiosError({ hasResponse: false }));
    expect(info.isNetworkError).toBe(true);
    expect(info.status).toBeNull();
  });

  it("flags 429 as rate limited with a friendly message, even with a plain-text body", () => {
    const info = parseApiError(
      makeAxiosError({ status: 429, data: "Too many requests from this IP, please try again after 5 minutes" })
    );
    expect(info.isRateLimited).toBe(true);
    expect(info.status).toBe(429);
  });

  it("extracts the message from a JSON error body", () => {
    const info = parseApiError(makeAxiosError({ status: 500, data: { message: "Email already exists" } }));
    expect(info.message).toBe("Email already exists");
  });

  // Regression test: the backend's `next(err, { cause })` bug means REST
  // business errors (like "you are not allowed to return this record", a
  // 403 ownership check) commonly arrive as HTTP 500. That message must
  // NOT be treated as a session-auth failure — doing so would silently log
  // the user out on a plain permission/ownership rejection.
  it("does not treat an ownership 403 message as an auth failure", () => {
    const info = parseApiError(
      makeAxiosError({ status: 500, data: { message: "You are not allowed to return this record" } })
    );
    expect(info.isLikelyAuthFailure).toBe(false);
  });

  it("does treat a missing/invalid token message as an auth failure", () => {
    const info = parseApiError(makeAxiosError({ status: 500, data: { message: "No token provided" } }));
    expect(info.isLikelyAuthFailure).toBe(true);
  });

  it("treats a real 401 as an auth failure regardless of message", () => {
    const info = parseApiError(makeAxiosError({ status: 401, data: { message: "anything" } }));
    expect(info.isLikelyAuthFailure).toBe(true);
  });
});
