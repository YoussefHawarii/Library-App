"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// Read by GoogleSignInButton to avoid rendering <GoogleLogin> outside of a
// <GoogleOAuthProvider> (which throws) when no client ID is configured.
export const isGoogleAuthConfigured = Boolean(googleClientId);

if (!googleClientId && typeof window !== "undefined") {
  // Same fail-loudly pattern as http.ts for NEXT_PUBLIC_API_BASE_URL: the
  // Google button will render but every sign-in attempt will fail, so this
  // is worth a console warning rather than a silent no-op.
  console.warn(
    "NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set — Google sign-in will not work. Check your .env.local."
  );
}

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  // Always wrap in the provider — @react-oauth/google does not validate
  // clientId at mount (it only matters once a widget actually calls Google),
  // so an empty string here is safe and keeps the Google button visible on
  // page load per spec (US3/AC1) even when misconfigured, rather than
  // silently vanishing.
  return <GoogleOAuthProvider clientId={googleClientId ?? ""}>{children}</GoogleOAuthProvider>;
}
