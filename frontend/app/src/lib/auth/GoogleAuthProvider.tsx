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
  // An empty clientId would throw inside the SDK; render children without
  // the provider instead so the rest of the app still works when Google
  // sign-in isn't configured (e.g. local dev without a client ID yet).
  if (!googleClientId) {
    return <>{children}</>;
  }

  return <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>;
}
