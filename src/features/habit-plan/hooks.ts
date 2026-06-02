"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/config/constants";
import type { CheckInPayload } from "@/lib/types";
import { notifyError } from "@/lib/notify";
import { habitPlanApi } from "./api";

export function useActiveHabitPlan(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.habitPlanActive,
    queryFn: ({ signal }) => habitPlanApi.getActive(signal),
    enabled,
  });
}

export function useScoreHistory(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.habitPlanScoreHistory,
    queryFn: ({ signal }) => habitPlanApi.getScoreHistory(signal),
    enabled,
  });
}

/**
 * Fire-and-forget plan generation after an assessment completes. Errors are
 * swallowed: the endpoint is idempotent, so a "plan already exists" response is
 * a success from the user's point of view.
 */
export function useGenerateHabitPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assessmentId: string) => habitPlanApi.generate(assessmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habitPlanActive });
    },
  });
}

export function useSubmitCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CheckInPayload) => habitPlanApi.submitCheckIn(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habitPlanActive });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
    },
    onError: (error) => notifyError(error),
  });
}
