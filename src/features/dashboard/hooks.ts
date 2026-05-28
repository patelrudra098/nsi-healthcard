"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/config/constants";
import { dashboardApi } from "./api";

export function useDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard,
    queryFn: ({ signal }) => dashboardApi.get(signal),
  });
}
