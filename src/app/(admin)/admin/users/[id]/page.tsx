import type { Metadata } from "next";
import { AdminUserDetailContainer } from "@/features/admin";

export const metadata: Metadata = { title: "User detail" };

export default function AdminUserDetailPage() {
  return <AdminUserDetailContainer />;
}
