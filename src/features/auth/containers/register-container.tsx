"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Lock, Smartphone, User } from "lucide-react";
import { ROUTES } from "@/config/constants";
import { normalizeError } from "@/lib/error";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useRegister } from "../hooks";
import { registerSchema, type RegisterInput } from "../types";

const FIELD_KEYS: (keyof RegisterInput)[] = ["name", "mobile", "password"];

export function RegisterContainer() {
  const router = useRouter();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", mobile: "", password: "" },
  });
  const mobileField = form.register("mobile");

  const onSubmit = async (values: RegisterInput) => {
    setFormError(null);
    try {
      await registerMutation.mutateAsync(values);
      router.replace(ROUTES.welcome);
    } catch (error) {
      const normalized = normalizeError(error);
      if (normalized.status === 409) {
        form.setError("mobile", {
          message: "Mobile number is already registered",
        });
        return;
      }
      if (normalized.fieldErrors) {
        for (const key of FIELD_KEYS) {
          const message = normalized.fieldErrors[key];
          if (message) form.setError(key, { message });
        }
        return;
      }
      setFormError(normalized.message);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 space-y-1.5">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Create your account
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Start measuring your family&apos;s health in minutes.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-[var(--radius-md)] border px-4 py-3"
            style={{
              backgroundColor: "var(--error-soft)",
              borderColor: "color-mix(in srgb, var(--error) 25%, transparent)",
              color: "var(--error)",
            }}
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p className="text-sm leading-snug">{formError}</p>
          </div>
        )}
        <Input
          label="Full name"
          autoComplete="name"
          prefix={<User className="size-4" />}
          placeholder="Your name"
          {...form.register("name")}
          error={form.formState.errors.name?.message}
        />
        <Input
          label="Mobile number"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={10}
          prefix={<Smartphone className="size-4" />}
          placeholder="98XXXXXXXX"
          {...mobileField}
          onChange={(e) => {
            e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
            mobileField.onChange(e);
          }}
          error={form.formState.errors.mobile?.message}
        />
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          prefix={<Lock className="size-4" />}
          helper="At least 8 characters."
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="text-[var(--text-muted)] outline-none transition-colors hover:text-[var(--text-primary)] focus-visible:text-[var(--primary)]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          }
          placeholder="Create a password"
          {...form.register("password")}
          error={form.formState.errors.password?.message}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={registerMutation.isPending || form.formState.isSubmitting}
        >
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
        Already have an account?{" "}
        <Link
          href={ROUTES.login}
          className="font-semibold text-[var(--primary)] outline-none hover:underline focus-visible:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
