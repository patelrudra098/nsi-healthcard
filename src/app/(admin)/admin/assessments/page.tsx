import type { Metadata } from "next";
import { AdminAssessmentsContainer } from "@/features/admin";

export const metadata: Metadata = { title: "Assessments" };

export default function AdminAssessmentsPage() {
  return <AdminAssessmentsContainer />;
}
