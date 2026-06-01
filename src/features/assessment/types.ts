import { z } from "zod";

/** Required free-text field with a friendly "this is required" message. */
const requiredText = (max: number, requiredMessage: string) =>
  z
    .string()
    .trim()
    .min(1, requiredMessage)
    .max(max, `Keep it under ${max} characters`);

/** Required whole-number field (kept as a string in the form), validated by range. */
const requiredNumberString = (
  min: number,
  max: number,
  requiredMessage: string,
  rangeMessage: string,
) =>
  z
    .string()
    .trim()
    .min(1, requiredMessage)
    .refine(
      (value) => /^\d+$/.test(value) && Number(value) >= min && Number(value) <= max,
      rangeMessage,
    );

export const familyProfileSchema = z.object({
  city: requiredText(120, "City is required"),
  state: requiredText(120, "State is required"),
  age: requiredNumberString(1, 120, "Age is required", "Age must be between 1 and 120"),
  maritalStatus: z.string().min(1, "Select your marital status"),
  familyMemberCount: requiredNumberString(
    1,
    30,
    "Number of family members is required",
    "Enter between 1 and 30",
  ),
  hasChildren: z.boolean().optional(),
  hasElderlyParents: z.boolean().optional(),
  hasHealthCondition: z.boolean().optional(),
  primaryCook: requiredText(120, "Tell us who cooks most meals"),
  healthDecisionMaker: requiredText(120, "Tell us who takes health decisions"),
});

export type FamilyProfileInput = z.infer<typeof familyProfileSchema>;

export interface SectionAnswer {
  questionKey: string;
  score: number;
}

export interface SaveSectionResponse {
  sectionScore: import("@/lib/types").SectionScoreResult;
  progress: {
    coreRawScore: number;
    coreScorePercentage: number;
    sectionsCompleted: number;
    totalCoreSections: number;
    progressPercent: number;
  };
  nextSection: string | null;
}
