import type { Metadata } from "next";
import { DashboardContainer } from "@/features/dashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return <DashboardContainer />;
}
