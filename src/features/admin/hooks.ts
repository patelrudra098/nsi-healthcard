"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { QUERY_KEYS } from "@/config/constants";
import { notifyError } from "@/lib/notify";
import { adminApi } from "./api";
import type {
  AdminAssessmentsQuery,
  AdminHabitPlansQuery,
  AdminUserInput,
  AdminUsersQuery,
} from "./types";

export function useAdminStats() {
  return useQuery({
    queryKey: QUERY_KEYS.adminStats,
    queryFn: ({ signal }) => adminApi.getStats(signal),
  });
}

export function useAdminUsers(query: AdminUsersQuery) {
  return useQuery({
    queryKey: QUERY_KEYS.adminUsers({ ...query }),
    queryFn: ({ signal }) => adminApi.getUsers(query, signal),
    placeholderData: keepPreviousData,
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminUser(id),
    queryFn: ({ signal }) => adminApi.getUser(id, signal),
    enabled: Boolean(id),
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminUserInput) => adminApi.updateUser(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminUser(id) });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminStats });
    },
    onError: (error) => notifyError(error),
  });
}

export function useAdminAssessments(query: AdminAssessmentsQuery) {
  return useQuery({
    queryKey: QUERY_KEYS.adminAssessments({ ...query }),
    queryFn: ({ signal }) => adminApi.getAssessments(query, signal),
    placeholderData: keepPreviousData,
  });
}

export function useAdminAssessment(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminAssessment(id),
    queryFn: ({ signal }) => adminApi.getAssessment(id, signal),
    enabled: Boolean(id),
  });
}

export function useAdminHabitPlans(query: AdminHabitPlansQuery) {
  return useQuery({
    queryKey: QUERY_KEYS.adminHabitPlans({ ...query }),
    queryFn: ({ signal }) => adminApi.getHabitPlans(query, signal),
    placeholderData: keepPreviousData,
  });
}

export function useAdminHabitPlan(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminHabitPlan(id),
    queryFn: ({ signal }) => adminApi.getHabitPlan(id, signal),
    enabled: Boolean(id),
  });
}

export function useDeleteAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteAssessment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "assessments"] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminStats });
    },
    onError: (error) => notifyError(error),
  });
}
