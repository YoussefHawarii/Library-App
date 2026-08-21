"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { InlineBanner } from "@/components/ui/States";
import { Card } from "@/components/ui/Card";
import { authApi } from "@/lib/api/auth.api";
import { parseApiError } from "@/lib/api/http";
import {
  sendOtpSchema,
  signUpSchema,
  type SendOtpForm,
  type SignUpForm,
} from "@/lib/validation/auth.schemas";
import { GoogleSignInButton } from "@/features/auth/GoogleSignInButton";

const OTP_COOLDOWN_SECONDS = 60;

function useCooldown() {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setInterval(() => setRemaining((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(timer);
  }, [remaining]);
  return { remaining, start: () => setRemaining(OTP_COOLDOWN_SECONDS) };
}

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<"otp" | "signup">("otp");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [contact, setContact] = useState<{ name: string; email: string } | null>(null);
  const cooldown = useCooldown();

  const otpForm = useForm<SendOtpForm>({ resolver: zodResolver(sendOtpSchema) });
  const signUpForm = useForm<SignUpForm>({ resolver: zodResolver(signUpSchema) });

  const requestOtp = async (values: SendOtpForm) => {
    setOtpError(null);
    try {
      await authApi.sendOtp(values);
      setContact(values);
      // Explicit reset (not just setValue on name/email) so nothing —
      // including a browser's own autofill guess — can leave stale otp/
      // password/phone values sitting in the next step's fields.
      signUpForm.reset({ name: values.name, email: values.email, otp: "", password: "", phone: "" });
      cooldown.start();
      setStep("signup");
    } catch (error) {
      setOtpError(parseApiError(error).message);
    }
  };

  const resendOtp = async () => {
    if (!contact || cooldown.remaining > 0) return;
    setOtpError(null);
    try {
      await authApi.sendOtp(contact);
      cooldown.start();
    } catch (error) {
      setOtpError(parseApiError(error).message);
    }
  };

  const completeSignUp = async (values: SignUpForm) => {
    setSignUpError(null);
    try {
      await authApi.signUp(values);
      router.push("/login?next=/books");
    } catch (error) {
      setSignUpError(parseApiError(error).message);
    }
  };

  return (
    <Card className="mx-auto flex w-full max-w-md flex-col gap-5">
      <div>
        <h1 className="font-serif-heading text-2xl font-semibold">Create an account</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {step === "otp"
            ? "We'll email you a one-time code to verify it's you."
            : `Enter the code sent to ${contact?.email} to finish signing up.`}
        </p>
      </div>

      {step === "otp" ? (
        <form onSubmit={otpForm.handleSubmit(requestOtp)} className="flex flex-col gap-4" noValidate>
          {otpError && <InlineBanner>{otpError}</InlineBanner>}
          <Field label="Name" htmlFor="otp-name" error={otpForm.formState.errors.name?.message}>
            <Input id="otp-name" autoComplete="name" {...otpForm.register("name")} />
          </Field>
          <Field label="Email" htmlFor="otp-email" error={otpForm.formState.errors.email?.message}>
            <Input id="otp-email" type="email" autoComplete="email" {...otpForm.register("email")} />
          </Field>
          <Button type="submit" loading={otpForm.formState.isSubmitting} className="w-full">
            Send verification code
          </Button>

          <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-ink-faint">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <GoogleSignInButton />
        </form>
      ) : (
        <form onSubmit={signUpForm.handleSubmit(completeSignUp)} className="flex flex-col gap-4" noValidate>
          {signUpError && <InlineBanner>{signUpError}</InlineBanner>}
          <Field label="Verification code" htmlFor="otp" error={signUpForm.formState.errors.otp?.message}>
            {/* autoComplete deliberately "off": the code is delivered by email, not
                SMS, so "one-time-code" (which targets the WebOTP API) buys nothing
                and just invites the browser to guess-fill this field. */}
            <Input id="otp" inputMode="numeric" maxLength={5} autoComplete="off" {...signUpForm.register("otp")} />
          </Field>
          <Field label="Password" htmlFor="password" error={signUpForm.formState.errors.password?.message}>
            <Input id="password" type="password" autoComplete="new-password" {...signUpForm.register("password")} />
          </Field>
          <Field label="Phone" htmlFor="phone" error={signUpForm.formState.errors.phone?.message}>
            <Input id="phone" type="tel" autoComplete="tel" {...signUpForm.register("phone")} />
          </Field>
          <Button type="submit" loading={signUpForm.formState.isSubmitting} className="w-full">
            Create account
          </Button>
          <button
            type="button"
            onClick={resendOtp}
            disabled={cooldown.remaining > 0}
            className="text-sm font-medium text-forest underline underline-offset-2 disabled:cursor-not-allowed disabled:text-ink-faint disabled:no-underline"
          >
            {cooldown.remaining > 0 ? `Resend code in ${cooldown.remaining}s` : "Resend code"}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-forest underline underline-offset-2">
          Log in
        </Link>
      </p>
    </Card>
  );
}
