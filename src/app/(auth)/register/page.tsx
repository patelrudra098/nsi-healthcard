import type { Metadata } from "next";
import { RegisterContainer } from "@/features/auth";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return <RegisterContainer />;
}
