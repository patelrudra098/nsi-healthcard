import type { Metadata } from "next";
import { AdminHabitPlansContainer } from "@/features/admin";

export const metadata: Metadata = { title: "Habit plans" };

export default function AdminHabitPlansPage() {
  return <AdminHabitPlansContainer />;
}
