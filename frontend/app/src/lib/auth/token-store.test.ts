import { describe, expect, it, vi } from "vitest";
import { clearTokens, getAccessToken, getRefreshToken, setTokens, subscribe } from "./token-store";

describe("token-store", () => {
  it("starts with no tokens", () => {
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it("stores and clears tokens", () => {
    setTokens({ access_token: "a", refresh_token: "b" });
    expect(getAccessToken()).toBe("a");
    expect(getRefreshToken()).toBe("b");

    clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it("notifies subscribers on set and clear, but not on redundant clear", () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    setTokens({ access_token: "x", refresh_token: "y" });
    expect(listener).toHaveBeenCalledTimes(1);

    clearTokens();
    expect(listener).toHaveBeenCalledTimes(2);

    clearTokens();
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
  });
});
