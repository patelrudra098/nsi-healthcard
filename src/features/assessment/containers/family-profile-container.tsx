"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Info } from "lucide-react";
import { ROUTES } from "@/config/constants";
import type { FamilyProfile } from "@/lib/types";
import { notifySuccess } from "@/lib/notify";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { FlowShell } from "@/shared/layout";
import { LoadingState } from "@/shared/components";
import { useResolveAssessmentId, useSaveFamilyProfile } from "../hooks";
import { familyProfileSchema, type FamilyProfileInput } from "../types";

const SLEEP_ROUTE = ROUTES.assessmentSection("SLEEP");

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-[var(--text-primary)]">
          {label}
        </span>
        <span className="block text-xs text-[var(--text-muted)]">
          {description}
        </span>
      </span>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </label>
  );
}

export function FamilyProfileContainer() {
  const router = useRouter();
  const { assessmentId, isResolving, isMissing } = useResolveAssessmentId();
  const saveProfile = useSaveFamilyProfile();

  const form = useForm<FamilyProfileInput>({
    resolver: zodResolver(familyProfileSchema),
    defaultValues: {
      city: "",
      state: "",
      age: "",
      maritalStatus: "",
      familyMemberCount: "",
      hasChildren: false,
      hasElderlyParents: false,
      hasHealthCondition: false,
      primaryCook: "",
      healthDecisionMaker: "",
    },
  });

  useEffect(() => {
    if (isMissing) router.replace(ROUTES.welcome);
  }, [isMissing, router]);

  if (isResolving || isMissing || !assessmentId) {
    return (
      <FlowShell width="wide">
        <LoadingState label="Preparing your assessment…" />
      </FlowShell>
    );
  }

  const onSubmit = (values: FamilyProfileInput) => {
    const body: FamilyProfile = {
      city: values.city?.trim() || undefined,
      state: values.state?.trim() || undefined,
      age: values.age ? Number(values.age) : undefined,
      maritalStatus: (values.maritalStatus as "MARRIED" | "SINGLE") || undefined,
      familyMemberCount: values.familyMemberCount
        ? Number(values.familyMemberCount)
        : undefined,
      hasChildren: values.hasChildren,
      hasElderlyParents: values.hasElderlyParents,
      hasHealthCondition: values.hasHealthCondition,
      primaryCook: values.primaryCook?.trim() || undefined,
      healthDecisionMaker: values.healthDecisionMaker?.trim() || undefined,
    };

    saveProfile.mutate(
      { assessmentId, body },
      {
        onSuccess: () => {
          notifySuccess("Family profile saved");
          router.push(SLEEP_ROUTE);
        },
      },
    );
  };

  return (
    <FlowShell exitHref={ROUTES.dashboard} width="wide">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>
        <div className="space-y-2 text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            A little about your family
          </h1>
          <p className="text-pretty mx-auto max-w-xl text-sm text-[var(--text-muted)]">
            This helps us understand your family context. All fields are required
            to continue.
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-[var(--radius-md)] bg-[var(--info-soft)] px-4 py-3 text-[var(--info)]">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p className="text-sm">
            These details give context to your scorecard — they are not scored, but
            all fields are required to continue.
          </p>
        </div>

        <div className="app-card space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="City" placeholder="e.g. Mumbai" {...form.register("city")} error={form.formState.errors.city?.message} />
            <Input label="State" placeholder="e.g. Maharashtra" {...form.register("state")} error={form.formState.errors.state?.message} />
            <Input
              label="Age"
              type="number"
              inputMode="numeric"
              min={1}
              max={120}
              placeholder="e.g. 35"
              {...form.register("age")}
              error={form.formState.errors.age?.message}
            />
            <div className="flex w-full flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--foreground)]">
                Marital status
              </label>
              <Controller
                control={form.control}
                name="maritalStatus"
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MARRIED">Married</SelectItem>
                      <SelectItem value="SINGLE">Single</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.maritalStatus && (
                <p className="text-xs font-medium text-[var(--destructive)]">
                  {form.formState.errors.maritalStatus.message}
                </p>
              )}
            </div>
            <Input
              label="Number of family members"
              type="number"
              inputMode="numeric"
              min={1}
              max={30}
              placeholder="e.g. 4"
              {...form.register("familyMemberCount")}
              error={form.formState.errors.familyMemberCount?.message}
            />
            <Input label="Who cooks most meals?" placeholder="e.g. Mother" {...form.register("primaryCook")} error={form.formState.errors.primaryCook?.message} />
            <Input
              label="Who takes health decisions?"
              placeholder="e.g. Self"
              wrapperClassName="sm:col-span-2"
              {...form.register("healthDecisionMaker")}
              error={form.formState.errors.healthDecisionMaker?.message}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="hasChildren"
              render={({ field }) => (
                <ToggleField
                  label="Children at home?"
                  description="Kids living with you"
                  checked={Boolean(field.value)}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={form.control}
              name="hasElderlyParents"
              render={({ field }) => (
                <ToggleField
                  label="Elderly parents at home?"
                  description="Seniors living with you"
                  checked={Boolean(field.value)}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={form.control}
              name="hasHealthCondition"
              render={({ field }) => (
                <ToggleField
                  label="Ongoing health condition?"
                  description="Any chronic condition in the family"
                  checked={Boolean(field.value)}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg" isLoading={saveProfile.isPending}>
            Save &amp; continue
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </form>
    </FlowShell>
  );
}
