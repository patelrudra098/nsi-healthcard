import type { Metadata } from "next";
import { Suspense } from "react";
import { ImprovementPlanContainer } from "@/features/habit-plan";

export const metadata: Metadata = { title: "Improvement plan" };

export default function ImprovementPlanPage() {
  return (
    <Suspense fallback={null}>
      <ImprovementPlanContainer />
    </Suspense>
  );
}
