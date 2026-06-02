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

/** Tolerate either a paginated envelope or a bare array of plans. */
function normalizeHabitPlans(raw: unknown): AdminHabitPlansResponse {
  if (Array.isArray(raw)) {
    return { habitPlans: raw as AdminHabitPlanSummary[], pagination: null };
  }
  const record = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const list =
    (Array.isArray(record.habitPlans) && record.habitPlans) ||
    (Array.isArray(record.plans) && record.plans) ||
    (Array.isArray(record.items) && record.items) ||
    [];
  const pagination =
    record.pagination && typeof record.pagination === "object"
      ? (record.pagination as Pagination)
      : null;
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
