import type { Metadata } from "next";
import { HistoryContainer } from "@/features/assessment";

export const metadata: Metadata = { title: "Health history" };

export default function HistoryPage() {
  return <HistoryContainer />;
}
