"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check, Info, Phone, Ruler, User } from "lucide-react";
import { ROUTES } from "@/config/constants";
import type { FamilyProfile } from "@/lib/types";
import { notifySuccess } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth";
import { useLanguage } from "@/lib/hooks/use-language";
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
import { CityStateFields } from "../components/city-state-fields";
import { LanguageSelector } from "../components/language-selector";
import { useResolveAssessmentId, useSaveFamilyProfile } from "../hooks";
import { familyProfileSchema, type FamilyProfileInput } from "../types";
import { loadFamilyProfileDraft, saveFamilyProfileDraft } from "../draft";

const SLEEP_ROUTE = ROUTES.assessmentSection("SLEEP");

/** Deterministic empty form — also the base we merge a saved draft onto. */
const EMPTY_PROFILE: FamilyProfileInput = {
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
  heightCm: "",
  weightKg: "",
};

const MARITAL_OPTIONS = [
  { value: "MARRIED", label: "Married" },
  { value: "SINGLE", label: "Single" },
] as const;

const COOK_OPTIONS = [
  "Myself",
  "Spouse / Partner",
  "Parent (Mother / Father)",
  "In-laws",
  "Domestic help / Cook",
  "We all share / Take turns",
  "Mostly outside / Delivery",
  "Other",
] as const;

const HEALTH_DECISION_OPTIONS = [
  "Myself",
  "Spouse / Partner",
  "Both of us together",
  "Parent / Elder",
  "Whole family together",
  "Other",
] as const;

/** Field names that are rendered as a dropdown. */
type SelectName = "maritalStatus" | "primaryCook" | "healthDecisionMaker";

function SelectField({
  control,
  name,
  label,
  placeholder,
  options,
  error,
  className,
}: {
  control: Control<FamilyProfileInput>;
  name: SelectName;
  label: string;
  placeholder: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  error?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      <label className="text-sm font-medium text-[var(--foreground)]">{label}</label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select value={field.value || undefined} onValueChange={field.onChange}>
            <SelectTrigger aria-invalid={Boolean(error)}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && (
        <p className="text-xs font-medium text-[var(--destructive)]">{error}</p>
      )}
    </div>
  );
}

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

const toText = (asString: ReadonlyArray<string>) =>
  asString.map((value) => ({ value, label: value }));

export function FamilyProfileContainer() {
  const router = useRouter();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { assessmentId, isResolving, isMissing } = useResolveAssessmentId();
  const saveProfile = useSaveFamilyProfile();

  const form = useForm<FamilyProfileInput>({
    resolver: zodResolver(familyProfileSchema),
    // Starts empty so server and client first render match; a saved draft is
    // applied after mount in the restore effect below (avoids hydration drift).
    defaultValues: EMPTY_PROFILE,
  });

  const restoredRef = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isMissing) router.replace(ROUTES.welcome);
  }, [isMissing, router]);

  // Restore the user's last-entered details once (don't clobber live edits).
  useEffect(() => {
    if (restoredRef.current || !user?.id) return;
    restoredRef.current = true;
    const draft = loadFamilyProfileDraft(user.id);
    if (draft && !form.formState.isDirty) {
      form.reset({ ...EMPTY_PROFILE, ...draft });
    }
  }, [user?.id, form]);

  // Autosave every edit (debounced) so a refresh or back-navigation loses nothing.
  const watchedValues = useWatch({ control: form.control });
  useEffect(() => {
    const uid = user?.id;
    // Wait until the restore pass has run so we never overwrite a saved draft
    // with the empty initial values.
    if (!uid || !restoredRef.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(
      () => saveFamilyProfileDraft(uid, watchedValues as FamilyProfileInput),
      400,
    );
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [watchedValues, user?.id]);

  if (isResolving || isMissing || !assessmentId) {
    return (
      <FlowShell width="wide">
        <LoadingState label="Preparing your assessment…" />
      </FlowShell>
    );
  }

  const onSubmit = (values: FamilyProfileInput) => {
    // Remember the latest values so a future assessment is pre-filled.
    saveFamilyProfileDraft(user?.id, values);

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
      heightCm: Number(values.heightCm),
      weightKg: Number(values.weightKg),
      preferredLanguage: language,
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

        <div className="app-card space-y-6 p-6">
          {/* Preferred language — drives read-aloud across the assessment. */}
          <LanguageSelector />

          <div className="h-px bg-[var(--border)]" aria-hidden="true" />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              value={user?.name ?? ""}
              prefix={<User className="size-4" />}
              helper="From your account"
              readOnly
              disabled
            />
            <Input
              label="Mobile number"
              value={user?.mobile ?? ""}
              prefix={<Phone className="size-4" />}
              helper="From your account"
              inputMode="tel"
              readOnly
              disabled
            />
            <CityStateFields form={form} />
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
            <SelectField
              control={form.control}
              name="maritalStatus"
              label="Marital status"
              placeholder="Select"
              options={MARITAL_OPTIONS}
              error={form.formState.errors.maritalStatus?.message}
            />
            <Input
              label="Number of family members"
              type="number"
              inputMode="numeric"
              min={1}
              max={30}
              placeholder="e.g. 4"
              wrapperClassName="sm:col-span-2"
              {...form.register("familyMemberCount")}
              error={form.formState.errors.familyMemberCount?.message}
            />

            {/* Body metrics — power the dashboard BMI card. */}
            <div className="space-y-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-hover)] p-4 sm:col-span-2">
              <div className="flex items-center gap-2">
                <Ruler className="size-4 text-[var(--text-muted)]" aria-hidden="true" />
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  Body metrics
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Used to calculate and track your BMI on your dashboard.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Your height"
                  type="number"
                  inputMode="numeric"
                  min={100}
                  max={250}
                  placeholder="e.g. 170"
                  suffix={<span className="text-sm">cm</span>}
                  {...form.register("heightCm")}
                  error={form.formState.errors.heightCm?.message}
                />
                <Input
                  label="Your weight"
                  type="number"
                  inputMode="numeric"
                  min={20}
                  max={300}
                  placeholder="e.g. 68"
                  suffix={<span className="text-sm">kg</span>}
                  {...form.register("weightKg")}
                  error={form.formState.errors.weightKg?.message}
                />
              </div>
            </div>

            <SelectField
              control={form.control}
              name="primaryCook"
              label="Who cooks most meals?"
              placeholder="Select"
              options={toText(COOK_OPTIONS)}
              error={form.formState.errors.primaryCook?.message}
            />
            <SelectField
              control={form.control}
              name="healthDecisionMaker"
              label="Who takes health decisions?"
              placeholder="Select"
              options={toText(HEALTH_DECISION_OPTIONS)}
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

        <div className="flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
          <p className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Check
              className="size-3.5 text-[var(--success)]"
              aria-hidden="true"
            />
            Your details are saved on this device for next time
          </p>
          <Button type="submit" size="lg" isLoading={saveProfile.isPending}>
            Save &amp; continue
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </form>
    </FlowShell>
  );
}
