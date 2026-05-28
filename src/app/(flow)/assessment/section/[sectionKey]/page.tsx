import type { Metadata } from "next";
import { SectionContainer } from "@/features/assessment";

export const metadata: Metadata = { title: "Assessment section" };

export default function SectionPage() {
  return <SectionContainer />;
}
