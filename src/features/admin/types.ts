import { z } from "zod";
import type { ScoreBandKey } from "@/lib/types";

export interface AdminUsersQuery {
  page: number;
  limit: number;
  search: string;
}

export interface AdminAssessmentsQuery {
  page: number;
  limit: number;
  scoreBand: ScoreBandKey | "";
  status: "IN_PROGRESS" | "COMPLETED" | "";
}

export interface AdminHabitPlansQuery {
  page: number;
  limit: number;
  status: "ACTIVE" | "COMPLETED" | "ABANDONED" | "";
}

export const adminUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters"),
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  role: z.enum(["USER", "ADMIN"]),
});

export type AdminUserInput = z.infer<typeof adminUserSchema>;
