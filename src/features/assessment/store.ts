import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { STORAGE_KEYS } from "@/config/constants";
import type { AssessmentResult, SectionScoreResult } from "@/lib/types";

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

interface AssessmentFlowState {
  assessmentId: string | null;
  sectionScores: SectionScoreResult[];
  result: AssessmentResult | null;
  setAssessmentId: (id: string) => void;
  upsertSectionScore: (score: SectionScoreResult) => void;
  setResult: (result: AssessmentResult) => void;
  reset: () => void;
}

/**
 * Assessment flow state, persisted to sessionStorage so a page refresh mid-flow
 * keeps the active assessment id, captured section scores, and final result.
 */
export const useAssessmentStore = create<AssessmentFlowState>()(
  persist(
    (set) => ({
      assessmentId: null,
      sectionScores: [],
      result: null,

      setAssessmentId: (id) =>
        set((state) =>
          state.assessmentId === id
            ? { assessmentId: id }
            : { assessmentId: id, sectionScores: [], result: null },
        ),

      upsertSectionScore: (score) =>
        set((state) => {
          const next = state.sectionScores.filter(
            (item) => item.sectionKey !== score.sectionKey,
          );
          next.push(score);
          return { sectionScores: next };
        }),

      setResult: (result) => set({ result }),

      reset: () => set({ assessmentId: null, sectionScores: [], result: null }),
    }),
    {
      name: STORAGE_KEYS.assessmentFlow,
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : window.sessionStorage,
      ),
    },
  ),
);
