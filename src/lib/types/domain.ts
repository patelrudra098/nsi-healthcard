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

export interface QuestionExample {
  level: 1 | 2 | 3 | 4 | 5;
  label: "Poor" | "Weak" | "Average" | "Good" | "Excellent";
  description: string;
}

export interface Question {
  questionKey: string;
  text: string;
  hint: string | null;
  examples: QuestionExample[];
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
  preferredLanguage?: string | null;
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

/** Full entry from GET /assessment/history (richer than the dashboard summary). */
export interface AssessmentHistoryEntry {
  id: string;
  scorePercentage: number;
  coreScore: number;
  bandLabel: string;
  bandDescription: string;
  scoreBand?: ScoreBandKey;
  completedAt: string;
  sectionScores: SectionScoreResult[];
}

export interface QuestionAnswer {
  questionKey: string;
  answer: number;
}

/** Lean family-profile shape returned alongside a past assessment's answers. */
export interface AssessmentAnswerProfile {
  city?: string | null;
  state?: string | null;
  age?: number | null;
  familySize?: number | null;
}

/** Response from GET /assessment/:id/answers. */
export interface AssessmentAnswers {
  id: string;
  scorePercentage: number;
  coreScore: number;
  bandLabel: string;
  bandDescription?: string;
  scoreBand?: ScoreBandKey;
  completedAt: string;
  familyProfile: AssessmentAnswerProfile | null;
  sectionScores: SectionScoreResult[];
  questionAnswers: QuestionAnswer[];
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

/* ─────────────────────────────────────────────────────────────────────────
 * 21-day habit challenge
 *
 * One focused habit per 21-day round. When the round completes the plan is
 * marked COMPLETED, `shouldReassess` flips true, and `nextWeakSections`
 * previews the rounds that the next assessment will unlock.
 * ──────────────────────────────────────────────────────────────────────── */

export type HabitDifficulty = "EASY" | "MEDIUM" | "HARD";
export type HabitPlanStatus = "ACTIVE" | "COMPLETED" | "ABANDONED";
/** 1 = Not at all, 2 = Some days, 3 = Most days, 4 = Every day. */
export type HabitRating = 1 | 2 | 3 | 4;

export interface HabitTemplate {
  title: string;
  description: string;
  whyItHelps: string;
  difficulty: HabitDifficulty;
}

export interface PlannedHabit {
  id: string;
  month: 1 | 2 | 3;
  isActive: boolean;
  sectionKey: string;
  title: string;
  description: string;
  whyItHelps: string;
  difficulty: HabitDifficulty;
  currentStreak: number;
  avgRating: number;
  totalWeeksLogged: number;
  lastWeekRating: number | null;
  /** Only present when isActive = false. */
  unlocksInDays?: number;
}

export interface WeeklyCheckIn {
  weekNumber: number;
  habit1Rating: number;
  habit2Rating: number | null;
  habit3Rating: number | null;
  overallRating: number;
  createdAt: string;
}

/** Preview of a round the next assessment will unlock. */
export interface NextWeakSection {
  sectionKey: string;
  sectionLabel: string;
  sectionPercent: number;
  previewHabit: string;
}

export interface HabitPlan {
  id: string;
  status: HabitPlanStatus;
  startDate: string;
  targetDate: string;
  daysSinceStart: number;
  /** Legacy 90-day grouping; for a 21-day round this is always 1. */
  currentMonth: 1 | 2 | 3;
  /** 1 → 2 → 3 across the 21-day round. */
  currentWeek: number;
  daysRemaining: number;
  progressPercent: number;
  habits: PlannedHabit[];
  checkIns: WeeklyCheckIn[];
  encouragementMessage: string | null;
  /** True once the 21-day round is complete and the user should reassess. */
  shouldReassess: boolean;
  /** What the next 21-day rounds will focus on (preview only). */
  nextWeakSections: NextWeakSection[];
  /** Optional server-computed flag; falls back to a client derivation. */
  hasCheckInDueThisWeek?: boolean;
}

export interface ScoreHistoryEntry {
  completedAt: string;
  scorePercentage: number;
  bandLabel: string;
  scoreBand?: ScoreBandKey;
}

export interface CheckInPayload {
  habitPlanId: string;
  habit1Rating: HabitRating;
  habit2Rating?: HabitRating;
  habit3Rating?: HabitRating;
  overallRating: HabitRating;
}

/** Response from POST /habit-plan/check-in. */
export interface CheckInResult {
  encouragementMessage: string | null;
  habitPlan?: HabitPlan;
  /** True after the week-3 check-in completes the 21-day round. */
  shouldReassess: boolean;
}

export interface AdminHabitPlanSummary {
  id: string;
  status: HabitPlanStatus;
  startDate: string;
  progressPercent: number;
  currentMonth: 1 | 2 | 3;
  sectionKeys: string[];
  checkInsCompleted: number;
  totalWeeks: number;
  lastActiveAt: string | null;
  user: { id: string; name: string; mobile: string };
}

export interface AdminHabitPlanDetail extends HabitPlan {
  user: { id: string; name: string; mobile: string };
  scoreHistory: ScoreHistoryEntry[];
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
