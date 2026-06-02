import type { Metadata } from "next";
import { HistoryDetailContainer } from "@/features/assessment";

export const metadata: Metadata = { title: "Assessment details" };

export default function HistoryDetailPage() {
  return <HistoryDetailContainer />;
}
