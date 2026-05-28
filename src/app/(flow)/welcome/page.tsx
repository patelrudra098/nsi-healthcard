import type { Metadata } from "next";
import { WelcomeContainer } from "@/features/assessment";

export const metadata: Metadata = { title: "Welcome" };

export default function WelcomePage() {
  return <WelcomeContainer />;
}
