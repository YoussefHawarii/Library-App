"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { InlineBanner } from "@/components/ui/States";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth/AuthContext";
import { parseApiError } from "@/lib/api/http";
import { loginSchema, type LoginForm } from "@/lib/validation/auth.schemas";
import { GoogleSignInButton } from "@/features/auth/GoogleSignInButton";

function LoginFormCard() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginForm) => {
    setFormError(null);
    try {
      await login(values);
      const next = searchParams.get("next") || "/books";
      router.push(next);
    } catch (error) {
      setFormError(parseApiError(error).message);
    }
  };

  return (
    <Card className="mx-auto flex w-full max-w-md flex-col gap-5">
      <div>
        <h1 className="font-serif-heading text-2xl font-semibold">Log in</h1>
        <p className="mt-1 text-sm text-ink-soft">Access your borrowed books and account.</p>
      </div>

      {formError && <InlineBanner>{formError}</InlineBanner>}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
        </Field>
        <Button type="submit" loading={isSubmitting} className="mt-1 w-full">
          Log in
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-ink-faint">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleSignInButton redirectTo={searchParams.get("next") || "/books"} />

      <p className="text-center text-sm text-ink-soft">
        No account yet?{" "}
        <Link href="/signup" className="font-medium text-forest underline underline-offset-2">
          Sign up
        </Link>
      </p>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginFormCard />
    </Suspense>
  );
}
