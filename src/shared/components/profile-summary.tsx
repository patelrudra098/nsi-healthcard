import type { FamilyProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

function text(value: string | null | undefined): string {
  return value && value.trim() ? value : "—";
}

function number(value: number | null | undefined): string {
  return value == null ? "—" : String(value);
}

function yesNo(value: boolean | null | undefined): string {
  if (value == null) return "—";
  return value ? "Yes" : "No";
}

/** Read-only family profile grid for admin detail views. */
export function ProfileSummary({
  profile,
  className,
}: {
  profile: FamilyProfile;
  className?: string;
}) {
  const rows: { label: string; value: string }[] = [
    { label: "City", value: text(profile.city) },
    { label: "State", value: text(profile.state) },
    { label: "Age", value: number(profile.age) },
    {
      label: "Marital status",
      value: profile.maritalStatus
        ? profile.maritalStatus.charAt(0) + profile.maritalStatus.slice(1).toLowerCase()
        : "—",
    },
    { label: "Family members", value: number(profile.familyMemberCount) },
    { label: "Children at home", value: yesNo(profile.hasChildren) },
    { label: "Elderly parents", value: yesNo(profile.hasElderlyParents) },
    { label: "Health condition", value: yesNo(profile.hasHealthCondition) },
    { label: "Primary cook", value: text(profile.primaryCook) },
    { label: "Health decisions by", value: text(profile.healthDecisionMaker) },
  ];

  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-5",
        className,
      )}
    >
      {rows.map((row) => (
        <div key={row.label}>
          <dt className="text-xs font-medium text-[var(--text-muted)]">
            {row.label}
          </dt>
          <dd className="mt-0.5 truncate text-sm font-medium text-[var(--text-primary)]">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
