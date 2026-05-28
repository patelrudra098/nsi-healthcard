import type { Metadata } from "next";
import { ResultContainer } from "@/features/assessment";

export const metadata: Metadata = { title: "Your score" };

export default function ResultPage() {
  return <ResultContainer />;
}
