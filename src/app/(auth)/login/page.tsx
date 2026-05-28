import type { Metadata } from "next";
import { LoginContainer } from "@/features/auth";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return <LoginContainer />;
}
