import { http, unwrap } from "@/services";
import type { DashboardResponse } from "@/lib/types";

export const dashboardApi = {
  get: async (signal?: AbortSignal): Promise<DashboardResponse> =>
    unwrap(await http.get("/dashboard", { signal })),
};
