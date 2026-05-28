import type { ScoreBandKey } from "@/config/constants";
import type { Role } from "@/lib/rbac";

export type { ScoreBandKey, Role };

export interface User {
  id: string;
  name: string;
  mobile: string;
  role: Role;
  createdAt: string;
}

export interface Question {
  questionKey: string;
  text: string;
  hint: string | null;
}

export interface Section {
  sectionKey: string;
  label: string;
  order: number;
  maxScore: number;
  isBonus: boolean;
  questions: Question[];
}

export interface ScoreBand {
  band: ScoreBandKey;
  minPct: number;
  maxPct: number;
  label: string;
  description: string;
}

export interface QuestionsMeta {
  totalSections: number;
  coreSections: number;
  bonusSections: number;
  totalQuestions: number;
  coreQuestions: number;
  coreMaxScore: number;
  bonusMaxScore: number;
  scoreBands: ScoreBand[];
}

export interface QuestionsResponse {
  sections: Section[];
  meta: QuestionsMeta;
}

export interface SectionScoreResult {
  sectionKey: string;
  label: string;
  score: number;
  maxScore: number;
  sectionPercent: number;
  isBonus: boolean;
}

export interface WeakestSection {
  sectionKey: string;
  label: string;
  sectionPercent: number;
}

export interface ImprovementPlan {
  id: string;
  biggestGap: string | null;
  habitToImprove: string | null;
  patternToReduce: string | null;
  dailyFamilyHabit: string | null;
  targetScore: number | null;
  createdAt: string;
}

export interface AssessmentResult {
  assessmentId: string;
  coreScore: number;
  scorePercentage: number;
  bonusScore: number;
  bonusPercentage: number;
  scoreBand: ScoreBandKey;
  bandLabel: string;
  bandDescription: string;
  sectionScores: SectionScoreResult[];
  weakestSection: WeakestSection | null;
  improvementPlan: ImprovementPlan | null;
  completedAt: string;
}

export interface FamilyProfile {
  city?: string | null;
  state?: string | null;
  age?: number | null;
  maritalStatus?: "MARRIED" | "SINGLE" | null;
  familyMemberCount?: number | null;
  hasChildren?: boolean | null;
  hasElderlyParents?: boolean | null;
  hasHealthCondition?: boolean | null;
  primaryCook?: string | null;
  healthDecisionMaker?: string | null;
}

export interface ActiveAssessment {
  assessmentId: string;
  status: "IN_PROGRESS" | "COMPLETED";
  familyProfileCompleted: boolean;
  answeredSections: string[];
  unansweredCoreSections: string[];
  bonusAnswered: boolean;
  progress: {
    sectionsCompleted: number;
    totalCoreSections: number;
    progressPercent: number;
  };
  createdAt: string;
}

export interface AssessmentHistoryItem {
  assessmentId: string;
  coreScore: number;
  scorePercentage: number;
  scoreBand: ScoreBandKey;
  bandLabel: string;
  completedAt: string;
}

export interface DashboardResponse {
  user: User;
  latestAssessment: AssessmentResult | null;
  assessmentHistory: AssessmentHistoryItem[];
  stats: {
    totalCompletedAssessments: number;
    scoreTrend: number | null;
    hasActiveAssessment: boolean;
    activeAssessmentId: string | null;
  };
}

export interface AdminUserSummary {
  id: string;
  name: string;
  mobile: string;
  role: Role;
  createdAt: string;
  latestAssessment: {
    assessmentId: string;
    scorePercentage: number;
    scoreBand: ScoreBandKey;
    completedAt: string;
  } | null;
}

export interface AdminUserDetail {
  id: string;
  name: string;
  mobile: string;
  role: Role;
  createdAt: string;
  assessments: AssessmentResult[];
}

export interface AdminAssessmentSummary {
  assessmentId: string;
  user: { id: string; name: string; mobile: string };
  status: "IN_PROGRESS" | "COMPLETED";
  coreScore: number;
  scorePercentage: number;
  scoreBand: ScoreBandKey;
  bandLabel: string;
  completedAt: string | null;
  createdAt: string;
}

export interface AdminAssessmentDetail extends AssessmentResult {
  user: { id: string; name: string; mobile: string };
  familyProfile: FamilyProfile | null;
}

export interface PlatformStats {
  totalUsers: number;
  totalAssessments: number;
  completedAssessments: number;
  completionRate: number;
  averageScorePercentage: number;
  bandDistribution: Record<string, number>;
}
