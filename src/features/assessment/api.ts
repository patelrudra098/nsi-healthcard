import axios from "axios";
import { http, unwrap } from "@/services";
import type {
  ActiveAssessment,
  AssessmentResult,
  FamilyProfile,
  ImprovementPlan,
  QuestionsResponse,
} from "@/lib/types";
import type { SaveSectionResponse, SectionAnswer } from "./types";

interface ActiveResponse {
  activeAssessment: ActiveAssessment | null;
}

interface CreateAssessmentResponse {
  assessmentId: string;
  status: string;
  createdAt?: string;
}

export interface ImprovementPlanBody {
  biggestGap?: string;
  habitToImprove?: string;
  patternToReduce?: string;
  dailyFamilyHabit?: string;
  targetScore?: number;
}

export const assessmentApi = {
  getQuestions: async (signal?: AbortSignal): Promise<QuestionsResponse> =>
    unwrap(await http.get("/assessment/questions", { signal })),

  getActive: async (signal?: AbortSignal): Promise<ActiveAssessment | null> => {
    const data = unwrap<ActiveResponse>(
      await http.get("/assessment/active", { signal }),
    );
    return data.activeAssessment ?? null;
  },

  /** Create a new assessment. Resolves the existing id when one is in progress (409). */
  create: async (): Promise<CreateAssessmentResponse> => {
    try {
      return unwrap(await http.post("/assessment", {}));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        const body = error.response.data as { data?: { assessmentId?: string } };
        const existingId = body?.data?.assessmentId;
        if (existingId) {
          return { assessmentId: existingId, status: "IN_PROGRESS" };
        }
      }
      throw error;
    }
  },

  saveFamilyProfile: async (
    assessmentId: string,
    body: FamilyProfile,
  ): Promise<{ familyProfileId: string; assessmentId: string }> =>
    unwrap(await http.post(`/assessment/${assessmentId}/family-profile`, body)),

  saveSection: async (
    assessmentId: string,
    sectionKey: string,
    answers: SectionAnswer[],
  ): Promise<SaveSectionResponse> =>
    unwrap(
      await http.post(`/assessment/${assessmentId}/section`, {
        sectionKey,
        answers,
      }),
    ),

  complete: async (assessmentId: string): Promise<AssessmentResult> =>
    unwrap(await http.post(`/assessment/${assessmentId}/complete`, {})),

  getResult: async (
    assessmentId: string,
    signal?: AbortSignal,
  ): Promise<AssessmentResult> =>
    unwrap(await http.get(`/assessment/${assessmentId}/result`, { signal })),

  saveImprovementPlan: async (
    assessmentId: string,
    body: ImprovementPlanBody,
  ): Promise<ImprovementPlan> =>
    unwrap(await http.post(`/assessment/${assessmentId}/improvement-plan`, body)),
};
