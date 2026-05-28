import type { Metadata } from "next";
import { FamilyProfileContainer } from "@/features/assessment";

export const metadata: Metadata = { title: "Family profile" };

export default function FamilyProfilePage() {
  return <FamilyProfileContainer />;
}
