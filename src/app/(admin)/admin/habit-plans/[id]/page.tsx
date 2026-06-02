import type { Metadata } from "next";
import { AdminHabitPlanDetailContainer } from "@/features/admin";

export const metadata: Metadata = { title: "Habit plan detail" };

export default function AdminHabitPlanDetailPage() {
  return <AdminHabitPlanDetailContainer />;
}
