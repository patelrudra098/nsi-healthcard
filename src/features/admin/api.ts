import { http, unwrap } from "@/services";
import type {
  AdminAssessmentDetail,
  AdminAssessmentSummary,
  AdminHabitPlanDetail,
  AdminHabitPlanSummary,
  AdminUserDetail,
  AdminUserSummary,
  PlatformStats,
  Role,
} from "@/lib/types";
import type {
  AdminAssessmentsQuery,
  AdminHabitPlansQuery,
  AdminUserInput,
  AdminUsersQuery,
} from "./types";

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUsersResponse {
  users: AdminUserSummary[];
  pagination: Pagination;
}

export interface AdminAssessmentsResponse {
  assessments: AdminAssessmentSummary[];
  pagination: Pagination;
}

export interface AdminHabitPlansResponse {
  habitPlans: AdminHabitPlanSummary[];
  pagination: Pagination | null;
}

/**
 * Tolerate the real envelope ({ data: [...], total, page, limit }), a nested
 * `pagination` object, or a bare array. `totalPages` is derived when the API
 * only sends flat counts.
 */
function normalizeHabitPlans(raw: unknown): AdminHabitPlansResponse {
  if (Array.isArray(raw)) {
    return { habitPlans: raw as AdminHabitPlanSummary[], pagination: null };
  }
  const record = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const list =
    (Array.isArray(record.data) && record.data) ||
    (Array.isArray(record.habitPlans) && record.habitPlans) ||
    (Array.isArray(record.plans) && record.plans) ||
    (Array.isArray(record.items) && record.items) ||
    [];

  let pagination: Pagination | null = null;
  if (record.pagination && typeof record.pagination === "object") {
    pagination = record.pagination as Pagination;
  } else if (typeof record.total === "number") {
    const total = record.total;
    const page = typeof record.page === "number" ? record.page : 1;
    const limit =
      typeof record.limit === "number" && record.limit > 0
        ? record.limit
        : list.length || 20;
    pagination = { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  return { habitPlans: list as AdminHabitPlanSummary[], pagination };
}

export interface UpdatedUser {
  id: string;
  name: string;
  mobile: string;
  role: Role;
  updatedAt: string;
}

export const adminApi = {
  getStats: async (signal?: AbortSignal): Promise<PlatformStats> =>
    unwrap(await http.get("/admin/stats", { signal })),

  getUsers: async (
    query: AdminUsersQuery,
    signal?: AbortSignal,
  ): Promise<AdminUsersResponse> => {
    const params: Record<string, string | number> = {
      page: query.page,
      limit: query.limit,
    };
    if (query.search.trim()) params.search = query.search.trim();
    return unwrap(await http.get("/admin/users", { params, signal }));
  },

  getUser: async (id: string, signal?: AbortSignal): Promise<AdminUserDetail> =>
    unwrap(await http.get(`/admin/users/${id}`, { signal })),

  updateUser: async (id: string, body: AdminUserInput): Promise<UpdatedUser> =>
    unwrap(await http.patch(`/admin/users/${id}`, body)),

  deleteUser: async (id: string): Promise<{ deleted: boolean; userId: string }> =>
    unwrap(await http.delete(`/admin/users/${id}`)),

  getAssessments: async (
    query: AdminAssessmentsQuery,
    signal?: AbortSignal,
  ): Promise<AdminAssessmentsResponse> => {
    const params: Record<string, string | number> = {
      page: query.page,
      limit: query.limit,
    };
    if (query.scoreBand) params.scoreBand = query.scoreBand;
    if (query.status) params.status = query.status;
    return unwrap(await http.get("/admin/assessments", { params, signal }));
  },

  getAssessment: async (
    id: string,
    signal?: AbortSignal,
  ): Promise<AdminAssessmentDetail> =>
    unwrap(await http.get(`/admin/assessments/${id}`, { signal })),

  deleteAssessment: async (
    id: string,
  ): Promise<{ deleted: boolean; assessmentId: string }> =>
    unwrap(await http.delete(`/admin/assessments/${id}`)),

  getHabitPlans: async (
    query: AdminHabitPlansQuery,
    signal?: AbortSignal,
  ): Promise<AdminHabitPlansResponse> => {
    const params: Record<string, string | number> = {
      page: query.page,
      limit: query.limit,
    };
    if (query.status) params.status = query.status;
    if (query.userId) params.userId = query.userId;
    return normalizeHabitPlans(
      unwrap(await http.get("/admin/habit-plans", { params, signal })),
    );
  },

  getHabitPlan: async (
    planId: string,
    signal?: AbortSignal,
  ): Promise<AdminHabitPlanDetail> =>
    unwrap(await http.get(`/admin/habit-plans/${planId}`, { signal })),
};
