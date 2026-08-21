"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { InlineBanner } from "@/components/ui/States";
import { useAuth } from "@/lib/auth/AuthContext";
import { isGoogleAuthConfigured } from "@/lib/auth/GoogleAuthProvider";
import { parseApiError } from "@/lib/api/http";

/**
 * Renders Google's own branded "Sign in with Google" button (via
 * @react-oauth/google's <GoogleLogin>, not a custom-styled substitute) so
 * it reads as a standard, trustworthy affordance. Used on both the login
 * and signup pages — it signs in or silently registers depending on
 * whether the Google account's email already has one.
 */
export function GoogleSignInButton({ redirectTo = "/books" }: { redirectTo?: string }) {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  if (!isGoogleAuthConfigured) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      {error && <InlineBanner>{error}</InlineBanner>}
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          setError(null);
          if (!credentialResponse.credential) {
            setError("Google sign-in did not return a credential. Please try again.");
            return;
          }
          try {
            await loginWithGoogle(credentialResponse.credential);
            router.push(redirectTo);
          } catch (err) {
            setError(parseApiError(err).message);
          }
        }}
        onError={() => {
          setError("Google sign-in was not completed. Please try again.");
        }}
        text="continue_with"
        width="320"
      />
    </div>
  );
}
