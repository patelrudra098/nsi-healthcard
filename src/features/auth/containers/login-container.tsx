"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Eye, EyeOff, Lock, Smartphone } from "lucide-react";
import { QUERY_KEYS, ROUTES } from "@/config/constants";
import { ROLES } from "@/config/rbac";
import { normalizeError } from "@/lib/error";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { dashboardApi } from "@/features/dashboard";
import { useLogin } from "../hooks";
import { loginSchema, type LoginInput } from "../types";

export function LoginContainer() {
  const router = useRouter();
  const login = useLogin();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { mobile: "", password: "" },
  });
  const mobileField = form.register("mobile");

  const onSubmit = async (values: LoginInput) => {
    setFormError(null);
    try {
      const { user } = await login.mutateAsync(values);

      if (user.role === ROLES.ADMIN) {
        router.replace(ROUTES.admin);
        return;
      }

      // First-time users go to the welcome flow; returning users to dashboard.
      try {
        const dashboard = await queryClient.fetchQuery({
          queryKey: QUERY_KEYS.dashboard,
          queryFn: ({ signal }) => dashboardApi.get(signal),
        });
        const isFirstTime =
          !dashboard.latestAssessment && !dashboard.stats.hasActiveAssessment;
        router.replace(isFirstTime ? ROUTES.welcome : ROUTES.dashboard);
      } catch {
        router.replace(ROUTES.dashboard);
      }
    } catch (error) {
      const normalized = normalizeError(error);
      if (normalized.status === 401) {
        form.setError("password", {
          message: "Invalid mobile or password",
        });
        return;
      }
      setFormError(normalized.message);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 space-y-1.5">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Welcome back
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Sign in to view your family health dashboard.
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
          autoComplete="current-password"
          prefix={<Lock className="size-4" />}
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
          placeholder="Enter your password"
          {...form.register("password")}
          error={form.formState.errors.password?.message}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={login.isPending || form.formState.isSubmitting}
        >
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
        New to HealthCard?{" "}
        <Link
          href={ROUTES.register}
          className="font-semibold text-[var(--primary)] outline-none hover:underline focus-visible:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
