import { http, unwrap } from "@/services";
import type {
  AdminAssessmentDetail,
  AdminAssessmentSummary,
  AdminUserDetail,
  AdminUserSummary,
  PlatformStats,
  Role,
} from "@/lib/types";
import type { AdminAssessmentsQuery, AdminUserInput, AdminUsersQuery } from "./types";

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
};
