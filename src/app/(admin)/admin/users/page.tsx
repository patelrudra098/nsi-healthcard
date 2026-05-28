import type { Metadata } from "next";
import { AdminUsersContainer } from "@/features/admin";

export const metadata: Metadata = { title: "Users" };

export default function AdminUsersPage() {
  return <AdminUsersContainer />;
}
