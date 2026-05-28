import type { Metadata } from "next";
import { InstructionsContainer } from "@/features/assessment";

export const metadata: Metadata = { title: "How it works" };

export default function InstructionsPage() {
  return <InstructionsContainer />;
}
