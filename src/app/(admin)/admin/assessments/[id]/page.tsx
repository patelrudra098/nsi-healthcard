import type { Metadata } from "next";
import { AdminAssessmentDetailContainer } from "@/features/admin";

export const metadata: Metadata = { title: "Assessment detail" };

export default function AdminAssessmentDetailPage() {
  return <AdminAssessmentDetailContainer />;
}
