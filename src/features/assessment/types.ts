import { z } from "zod";

/** Optional free-text field that tolerates an empty string from the form. */
const optionalText = (max: number) =>
  z.string().trim().max(max, `Keep it under ${max} characters`).optional();

/** Optional whole-number field kept as a string in the form, validated by range. */
const optionalNumberString = (min: number, max: number, message: string) =>
  z
    .string()
    .trim()
    .optional()
    .refine(
      (value) =>
        !value || (/^\d+$/.test(value) && Number(value) >= min && Number(value) <= max),
      message,
    );

export const familyProfileSchema = z.object({
  city: optionalText(120),
  state: optionalText(120),
  age: optionalNumberString(1, 120, "Age must be between 1 and 120"),
  maritalStatus: z.enum(["MARRIED", "SINGLE"]).or(z.literal("")).optional(),
  familyMemberCount: optionalNumberString(1, 30, "Enter between 1 and 30"),
  hasChildren: z.boolean().optional(),
  hasElderlyParents: z.boolean().optional(),
  hasHealthCondition: z.boolean().optional(),
  primaryCook: optionalText(120),
  healthDecisionMaker: optionalText(120),
});

export type FamilyProfileInput = z.infer<typeof familyProfileSchema>;

export const improvementPlanSchema = z.object({
  biggestGap: optionalText(1000),
  habitToImprove: optionalText(1000),
  patternToReduce: optionalText(1000),
  dailyFamilyHabit: optionalText(1000),
  targetScore: optionalNumberString(1, 100, "Enter a percentage between 1 and 100"),
});

export type ImprovementPlanInput = z.infer<typeof improvementPlanSchema>;

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
