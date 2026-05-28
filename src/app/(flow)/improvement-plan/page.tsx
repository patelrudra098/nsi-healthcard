import type { Metadata } from "next";
import { ImprovementPlanContainer } from "@/features/assessment";

export const metadata: Metadata = { title: "Improvement plan" };

export default function ImprovementPlanPage() {
  return <ImprovementPlanContainer />;
}
