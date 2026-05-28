export const SECTION_ORDER = [
  "SLEEP",
  "ENERGY",
  "HYDRATION",
  "FOOD",
  "ACTIVITY",
  "STRESS",
  "RISK",
  "PREVENTIVE",
  "CULTURE",
] as const;

export const CORE_SECTIONS = [
  "SLEEP",
  "ENERGY",
  "HYDRATION",
  "FOOD",
  "ACTIVITY",
  "STRESS",
  "RISK",
  "PREVENTIVE",
] as const;

export type SectionKey = (typeof SECTION_ORDER)[number];

export const SECTION_LABELS: Record<SectionKey, string> = {
  SLEEP: "Sleep Health (Neend / Aaram)",
  ENERGY: "Daily Energy & Vitality (Shakti / Urja)",
  HYDRATION: "Hydration & Water Habits (Paani / Hydration)",
  FOOD: "Food Quality & Eating Habits (Khaana / Poshan)",
  ACTIVITY: "Physical Activity & Movement (Vyayam / Exercise)",
  STRESS: "Stress & Emotional Wellness (Maan / Bhavna)",
  RISK: "Risk Habits & Harmful Patterns (Kharab Aadatein)",
  PREVENTIVE: "Preventive Health Awareness (Roktham / Jagrukta)",
  CULTURE: "Family Health Culture — Bonus (Parivar Ki Sanskriti)",
};

export const BONUS_SECTION: SectionKey = "CULTURE";

export const SCORE_LEGEND = [
  { score: 5, label: "Excellent", meaning: "Consistently great habit" },
  { score: 4, label: "Good", meaning: "Usually follow this well" },
  { score: 3, label: "Average", meaning: "Sometimes, not regular" },
  { score: 2, label: "Weak", meaning: "Rarely done, mostly poor" },
  { score: 1, label: "Poor", meaning: "Not followed at all" },
] as const;

export const SCORE_OPTIONS = [
  { value: 1, label: "Poor" },
  { value: 2, label: "Weak" },
  { value: 3, label: "Average" },
  { value: 4, label: "Good" },
  { value: 5, label: "Excellent" },
] as const;

export type ScoreBandKey =
  | "VERY_STRONG"
  | "GOOD"
  | "MODERATE"
  | "WEAK"
  | "HIGH_RISK";

export const BAND_META: Record<
  ScoreBandKey,
  { label: string; token: string; softToken: string; description: string }
> = {
  VERY_STRONG: {
    label: "Very Strong",
    token: "var(--success)",
    softToken: "var(--success-soft)",
    description: "Excellent family health culture",
  },
  GOOD: {
    label: "Good",
    token: "var(--primary)",
    softToken: "var(--primary-soft)",
    description: "Good habits in place, but some gaps to fill",
  },
  MODERATE: {
    label: "Moderate",
    token: "var(--warning)",
    softToken: "var(--warning-soft)",
    description: "Improvement needed across key areas",
  },
  WEAK: {
    label: "Weak",
    token: "var(--cat-amber)",
    softToken: "var(--cat-amber-soft)",
    description: "Weak health discipline — act now",
  },
  HIGH_RISK: {
    label: "High Risk",
    token: "var(--error)",
    softToken: "var(--error-soft)",
    description: "High lifestyle-risk zone",
  },
};

export const STORAGE_KEYS = {
  accessToken: "nsi_access_token",
  user: "nsi_user",
  assessmentFlow: "nsi_assessment_flow",
} as const;

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  welcome: "/welcome",
  instructions: "/instructions",
  onboardingProfile: "/onboarding/profile",
  assessmentSection: (key: string) => `/assessment/section/${key}`,
  assessmentResult: "/assessment/result",
  improvementPlan: "/improvement-plan",
  dashboard: "/dashboard",
  admin: "/admin",
  adminUsers: "/admin/users",
  adminUser: (id: string) => `/admin/users/${id}`,
  adminAssessments: "/admin/assessments",
  adminAssessment: (id: string) => `/admin/assessments/${id}`,
} as const;

export const QUERY_KEYS = {
  questions: ["questions"] as const,
  activeAssessment: ["assessment", "active"] as const,
  assessment: (id: string) => ["assessment", id] as const,
  assessmentResult: (id: string) => ["assessment", id, "result"] as const,
  dashboard: ["dashboard"] as const,
  adminStats: ["admin", "stats"] as const,
  adminUsers: (params: Record<string, unknown>) =>
    ["admin", "users", params] as const,
  adminUser: (id: string) => ["admin", "users", id] as const,
  adminAssessments: (params: Record<string, unknown>) =>
    ["admin", "assessments", params] as const,
  adminAssessment: (id: string) => ["admin", "assessments", id] as const,
};
