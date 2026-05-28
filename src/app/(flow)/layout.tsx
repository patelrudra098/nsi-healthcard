"use client";

import { ProtectedRoute } from "@/features/auth";

export default function FlowLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
