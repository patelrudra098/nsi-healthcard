import type { Metadata } from "next";
import { AdminDashboardContainer } from "@/features/admin";

export const metadata: Metadata = { title: "Admin overview" };

export default function AdminDashboardPage() {
  return <AdminDashboardContainer />;
}
