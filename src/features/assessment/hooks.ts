"use client";

import { useEffect } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { QUERY_KEYS } from "@/config/constants";
import type { FamilyProfile } from "@/lib/types";
import { notifyError } from "@/lib/notify";
import { useLanguage } from "@/lib/hooks/use-language";
import { assessmentApi } from "./api";
import { useAssessmentStore } from "./store";
import type { SectionAnswer } from "./types";

/**
 * Questions for the chosen language. Keyed by language so switching refetches
 * the translated set; the backend returns text, hints, and examples already
 * translated.
 */
export function useQuestions() {
  const { language } = useLanguage();
  return useQuery({
    queryKey: [...QUERY_KEYS.questions, language],
    queryFn: ({ signal }) => assessmentApi.getQuestions(language, signal),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useAssessmentHistory() {
  return useQuery({
    queryKey: QUERY_KEYS.assessmentHistory,
    queryFn: ({ signal }) => assessmentApi.getHistory(signal),
  });
}

export function useAssessmentAnswers(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.assessmentAnswers(id ?? "none"),
    queryFn: ({ signal }) => assessmentApi.getAnswers(id as string, signal),
    enabled: Boolean(id),
  });
}

export function useActiveAssessment(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.activeAssessment,
    queryFn: ({ signal }) => assessmentApi.getActive(signal),
    enabled,
  });
}

/**
 * Resolve the assessment id for the current flow: prefer the persisted store,
 * otherwise recover the server's in-progress assessment.
 */
export function useResolveAssessmentId() {
  const assessmentId = useAssessmentStore((s) => s.assessmentId);
  const setAssessmentId = useAssessmentStore((s) => s.setAssessmentId);
  const active = useActiveAssessment(!assessmentId);

  useEffect(() => {
    if (!assessmentId && active.data?.assessmentId) {
      setAssessmentId(active.data.assessmentId);
    }
  }, [assessmentId, active.data, setAssessmentId]);

  return {
    assessmentId: assessmentId ?? active.data?.assessmentId ?? null,
    active: active.data ?? null,
    isResolving: !assessmentId && active.isLoading,
    isMissing: !assessmentId && active.isSuccess && !active.data,
  };
}

export function useAssessmentResult(assessmentId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.assessmentResult(assessmentId ?? "none"),
    queryFn: ({ signal }) => assessmentApi.getResult(assessmentId as string, signal),
    enabled: Boolean(assessmentId),
  });
}

export function useCreateAssessment() {
  const setAssessmentId = useAssessmentStore((s) => s.setAssessmentId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => assessmentApi.create(),
    onSuccess: ({ assessmentId }) => {
      setAssessmentId(assessmentId);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeAssessment });
    },
    onError: (error) => notifyError(error),
  });
}

export function useSaveFamilyProfile() {
  return useMutation({
    mutationFn: ({
      assessmentId,
      body,
    }: {
      assessmentId: string;
      body: FamilyProfile;
    }) => assessmentApi.saveFamilyProfile(assessmentId, body),
    onError: (error) => notifyError(error),
  });
}

export function useSaveSection() {
  const upsertSectionScore = useAssessmentStore((s) => s.upsertSectionScore);
  return useMutation({
    mutationFn: ({
      assessmentId,
      sectionKey,
      answers,
    }: {
      assessmentId: string;
      sectionKey: string;
      answers: SectionAnswer[];
    }) => assessmentApi.saveSection(assessmentId, sectionKey, answers),
    onSuccess: (data) => upsertSectionScore(data.sectionScore),
    onError: (error) => notifyError(error),
  });
}

export function useCompleteAssessment() {
  const setResult = useAssessmentStore((s) => s.setResult);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assessmentId: string) => assessmentApi.complete(assessmentId),
    onSuccess: (result) => {
      setResult(result);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeAssessment });
    },
    onError: (error) => notifyError(error),
  });
}
