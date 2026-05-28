# NSI Family Health Scorecard — Frontend Build Prompt for Claude Code

---

⚠️ SCOPE CONTROL: Build only what is described here. If any requirement is ambiguous, implement the most logical interpretation and note it. Do not add features not listed.

---

## 1. What You Are Building

A complete frontend web application for the NSI Family Health Scorecard system. The app has two distinct user roles:

- **USER**: Registers → fills a 31-question health scorecard across 9 sections → receives a score out of 100% → writes an improvement plan → views a personal dashboard
- **ADMIN**: Logs in → sees platform-wide statistics → manages all users and their assessments

The backend is already running at `http://localhost:3001/api/v1`. Every page must wire to real API endpoints — no mock data.

---

## 2. Tech Stack

```
Framework:        React 18 + TypeScript (strict)
Routing:          React Router v6
HTTP Client:      Axios (with interceptors for auth)
Server State:     React Query (@tanstack/react-query v5)
Local State:      React Context + useReducer
Forms:            React Hook Form + Zod validation
Build Tool:       Vite
```

---

## 3. Project Structure

```
src/
  api/
    client.ts              ← Axios instance + interceptors
    auth.api.ts
    assessment.api.ts
    improvement-plan.api.ts
    dashboard.api.ts
    admin.api.ts

  context/
    AuthContext.tsx         ← global auth state
    AssessmentContext.tsx   ← assessment flow state

  hooks/
    useAuth.ts
    useAssessment.ts

  pages/
    auth/
      RegisterPage.tsx
      LoginPage.tsx
    onboarding/
      WelcomePage.tsx
      InstructionsPage.tsx
      FamilyProfilePage.tsx
    assessment/
      SectionPage.tsx        ← reused for all 9 sections
      ResultPage.tsx
    improvement/
      ImprovementPlanPage.tsx
    dashboard/
      DashboardPage.tsx
    admin/
      AdminDashboardPage.tsx
      AdminUsersPage.tsx
      AdminUserDetailPage.tsx
      AdminAssessmentsPage.tsx
      AdminAssessmentDetailPage.tsx

  components/
    (shared UI components)

  routes/
    AppRouter.tsx
    ProtectedRoute.tsx
    AdminRoute.tsx

  types/
    api.types.ts            ← all API response types
    assessment.types.ts

  utils/
    token.ts                ← token storage helpers
    score.ts                ← score band helpers
```

---

## 4. API Configuration

### Base Setup — `src/api/client.ts`

```
Base URL:    http://localhost:3001/api/v1
Credentials: true  (for HttpOnly refresh token cookie)
```

All API responses follow this envelope:
```json
{
  "success": true,
  "statusCode": 200,
  "data": { "...payload..." },
  "message": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Error responses:
```json
{
  "success": false,
  "statusCode": 401,
  "error": "Invalid mobile or password",
  "data": null,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/auth/login"
}
```

### Axios Interceptor Logic

**Request interceptor:** Attach `Authorization: Bearer {accessToken}` to every request. Read token from localStorage key `nsi_access_token`.

**Response interceptor (401 handling):**
1. If any request returns 401
2. Call `POST /auth/refresh` (cookie is sent automatically)
3. If refresh succeeds → save new accessToken → retry original request
4. If refresh fails → clear token → redirect to `/login`

---

## 5. Authentication System

### Token Storage
- `accessToken` → localStorage key: `nsi_access_token`
- `refreshToken` → HttpOnly cookie (browser handles automatically, never touch it in JS)
- `user` object → localStorage key: `nsi_user` (JSON stringified)

### AuthContext State Shape
```typescript
interface AuthState {
  user: {
    id: string;
    name: string;
    mobile: string;
    role: 'USER' | 'ADMIN';
    createdAt: string;
  } | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

### AuthContext Actions
- `login(user, accessToken)` → save to state + localStorage
- `logout()` → clear state + localStorage + call logout API
- `updateToken(accessToken)` → update token after refresh

### App Startup Logic
On app mount, read `nsi_access_token` and `nsi_user` from localStorage. If both exist, set `isAuthenticated = true` and hydrate state. If token is expired (check with decode), attempt refresh. If refresh fails, clear and show login.

---

## 6. Route Map

```
/                         → redirect to /dashboard if authenticated, else /login
/register                 → RegisterPage (public only)
/login                    → LoginPage (public only)
/welcome                  → WelcomePage (USER only, after first register)
/instructions             → InstructionsPage (USER only)
/onboarding/profile       → FamilyProfilePage (USER only)
/assessment/section/:key  → SectionPage (USER only)
/assessment/result        → ResultPage (USER only)
/improvement-plan         → ImprovementPlanPage (USER only)
/dashboard                → DashboardPage (USER only)
/admin                    → AdminDashboardPage (ADMIN only)
/admin/users              → AdminUsersPage (ADMIN only)
/admin/users/:id          → AdminUserDetailPage (ADMIN only)
/admin/assessments        → AdminAssessmentsPage (ADMIN only)
/admin/assessments/:id    → AdminAssessmentDetailPage (ADMIN only)
```

**ProtectedRoute**: if not authenticated → redirect to `/login`
**AdminRoute**: if not authenticated → `/login`, if authenticated but not ADMIN → `/dashboard`
**Public-only routes** (register, login): if already authenticated → redirect to `/dashboard` or `/admin`

---

## 7. Assessment Flow State

The assessment flow has multiple steps. Store in `AssessmentContext`:

```typescript
interface AssessmentFlowState {
  assessmentId: string | null;
  currentSectionIndex: number;   // 0-8
  answers: Record<string, Record<string, number>>;
  // answers[sectionKey][questionKey] = score (1-5)
  sectionScores: SectionScoreResult[];
  isComplete: boolean;
  result: AssessmentResult | null;
}
```

On app load, call `GET /assessment/active` to check if an IN_PROGRESS assessment exists. If yes, pre-load its state and resume.

---

## 8. Page Specifications

---

### 8.1 RegisterPage — `/register`

**Purpose:** New user signs up and is automatically logged in.

**Form fields:**
- Full Name — text, required, min 2 chars, max 100
- Mobile Number — text, required, must be 10-digit Indian number (starts with 6-9)
- Password — password, required, min 8 chars

**On submit:**

```
POST /auth/register
Body: { name: string, mobile: string, password: string }

Success 201:
{
  "data": {
    "user": { "id": "uuid", "name": "Rahul", "mobile": "9876543210", "role": "USER", "createdAt": "..." },
    "accessToken": "eyJ..."
  }
}
→ Save user + accessToken
→ Navigate to /welcome
```

**Errors:**
- `409` → "Mobile number is already registered" → show inline error under mobile field
- `422` → validation errors → show under respective fields
- Network error → show generic error

**Navigation:** Has link to `/login` at bottom.

---

### 8.2 LoginPage — `/login`

**Purpose:** Existing user logs in.

**Form fields:**
- Mobile Number — text, required
- Password — password, required

**On submit:**

```
POST /auth/login
Body: { mobile: string, password: string }

Success 200:
{
  "data": {
    "user": { "id": "uuid", "name": "Rahul", "mobile": "9876543210", "role": "USER" | "ADMIN", "createdAt": "..." },
    "accessToken": "eyJ..."
  }
}
→ Save user + accessToken
→ if role === 'ADMIN' → navigate to /admin
→ if role === 'USER' → check for active assessment:
    call GET /assessment/active
    if activeAssessment exists → resume from correct section
    if null → navigate to /dashboard (if they have completed assessments)
           OR navigate to /welcome (if first time)
```

**Check for "first time":** After login, call `GET /dashboard`. If `latestAssessment === null` and `stats.hasActiveAssessment === false` → go to `/welcome`. Else go to `/dashboard`.

**Errors:**
- `401` → "Invalid mobile or password" → show under password field
- Rate limit `429` → "Too many attempts. Please wait 1 minute."

**Navigation:** Has link to `/register` at bottom.

---

### 8.3 WelcomePage — `/welcome`

**Purpose:** Introduction screen explaining why the scorecard matters.

**Content (hardcoded — no API call):**
Display 4 reason cards:
1. "Awareness Before Advice" — Know your family's real health reality before seeking guidance
2. "Prevention Before Problem" — Spot lifestyle risks early and take action before illness sets in
3. "Lifestyle Shapes Family Future" — The daily habits of today become the health outcomes of tomorrow
4. "Health is the First Wealth" — No success, money, or career replaces a strong, healthy family culture

**Action:** Single button "Begin Assessment" → navigate to `/instructions`

**No API calls on this page.**

---

### 8.4 InstructionsPage — `/instructions`

**Purpose:** Explain how to score. Show the 1-5 legend.

**Content (hardcoded — no API call):**

Display 5 rules:
1. Every question is scored from 1 to 5
2. Be completely honest — this is only for YOUR awareness
3. Score based on your family's CURRENT reality, not your ideal wish
4. This is an awareness lifestyle tool — NOT a medical diagnosis
5. Try completing this together as a family

Display score legend:
| Score | Label | Meaning |
|-------|-------|---------|
| 5 | EXCELLENT | Consistently great habit |
| 4 | GOOD | Usually follow this well |
| 3 | AVERAGE | Sometimes, not regular |
| 2 | WEAK | Rarely done, mostly poor |
| 1 | POOR | Not followed at all |

**Action:** Single button "I'm Ready — Start" →

```
POST /assessment
Header: Authorization: Bearer {token}
Body: (empty)

Success 201:
{
  "data": { "assessmentId": "uuid", "status": "IN_PROGRESS", "createdAt": "..." }
}
→ Save assessmentId in AssessmentContext
→ Navigate to /onboarding/profile

Error 409 (assessment already exists):
{
  "success": false,
  "data": { "assessmentId": "existing-uuid" }
}
→ Load that existing assessmentId into context
→ Navigate to /onboarding/profile (or resume section)
```

---

### 8.5 FamilyProfilePage — `/onboarding/profile`

**Purpose:** Collect non-scoring family background information.

**First, fetch questions metadata:**
```
GET /assessment/questions
(no auth required)

Response 200:
{
  "data": {
    "sections": [
      {
        "sectionKey": "SLEEP",
        "label": "Sleep Health",
        "order": 1,
        "maxScore": 15,
        "isBonus": false,
        "questions": [
          { "questionKey": "SLEEP_Q1", "text": "How many hours...", "hint": "Raat mein..." },
          ...
        ]
      },
      ...9 sections total
    ],
    "meta": {
      "totalSections": 9,
      "coreSections": 8,
      "bonusSections": 1,
      "totalQuestions": 31,
      "coreQuestions": 27,
      "coreMaxScore": 135,
      "bonusMaxScore": 20,
      "scoreBands": [
        { "band": "VERY_STRONG", "minPct": 81, "maxPct": 100, "label": "Very Strong", "description": "Excellent Family Health Culture..." },
        { "band": "GOOD",        "minPct": 61, "maxPct": 80,  "label": "Good",         "description": "Good habits in place..." },
        { "band": "MODERATE",    "minPct": 41, "maxPct": 60,  "label": "Moderate",     "description": "Improvement needed..." },
        { "band": "WEAK",        "minPct": 21, "maxPct": 40,  "label": "Weak",         "description": "Weak health discipline..." },
        { "band": "HIGH_RISK",   "minPct": 0,  "maxPct": 20,  "label": "High Risk",    "description": "High lifestyle-risk zone..." }
      ]
    }
  }
}
→ Store sections in AssessmentContext for use across all section pages
```

**Form fields (all optional):**
- City — text
- State — text
- Age — number (1-120)
- Marital Status — select: Married / Single
- Number of Family Members — number (1-30)
- Children at home? — Yes / No toggle
- Elderly parents at home? — Yes / No toggle
- Any ongoing health condition? — Yes / No toggle
- Who cooks most meals? — text
- Who takes health decisions? — text

**Note shown to user:** "This information helps understand your family context. It is not scored."

**On submit:**
```
POST /assessment/{assessmentId}/family-profile
Header: Authorization: Bearer {token}
Body: {
  city?: string,
  state?: string,
  age?: number,
  maritalStatus?: "MARRIED" | "SINGLE",
  familyMemberCount?: number,
  hasChildren?: boolean,
  hasElderlyParents?: boolean,
  hasHealthCondition?: boolean,
  primaryCook?: string,
  healthDecisionMaker?: string
}

Success 200:
{
  "data": { "familyProfileId": "uuid", "assessmentId": "uuid" }
}
→ Navigate to /assessment/section/SLEEP
```

**Also show a "Skip for now" button** that navigates directly to `/assessment/section/SLEEP` without saving.

---

### 8.6 SectionPage — `/assessment/section/:sectionKey`

**Purpose:** The core assessment screen. Reused for all 9 sections. `sectionKey` param determines which section to show.

**Valid sectionKey values in order:** SLEEP → ENERGY → HYDRATION → FOOD → ACTIVITY → STRESS → RISK → PREVENTIVE → CULTURE

**Page header shows:**
- Section name (e.g., "Sleep Health")
- Progress: "Section 2 of 9" (use section.order)
- A progress bar showing how many sections are completed out of 9

**Questions display:**
For each question in the section (from the cached questions metadata):
- Question text (large, readable)
- Hindi hint text below in smaller text (if hint is not null)
- Score selector: 5 buttons labeled 1=Poor, 2=Weak, 3=Average, 4=Good, 5=Excellent
- Selected score highlighted
- User must answer ALL questions before proceeding

**Section label mapping:**
```
SLEEP     → "Sleep Health (Neend / Aaram)"
ENERGY    → "Daily Energy & Vitality (Shakti / Urja)"
HYDRATION → "Hydration & Water Habits (Paani / Hydration)"
FOOD      → "Food Quality & Eating Habits (Khaana / Poshan)"
ACTIVITY  → "Physical Activity & Movement (Vyayam / Exercise)"
STRESS    → "Stress & Emotional Wellness (Maan / Bhavna)"
RISK      → "Risk Habits & Harmful Patterns (Kharab Aadatein)"
PREVENTIVE→ "Preventive Health Awareness (Roktham / Jagrukta)"
CULTURE   → "Family Health Culture — Bonus (Parivar Ki Sanskriti)"
```

**CULTURE section:** Show a badge/label: "Bonus Section — Does not affect your main score"

**On "Next Section" button click (all questions answered):**
```
POST /assessment/{assessmentId}/section
Header: Authorization: Bearer {token}
Body: {
  "sectionKey": "SLEEP",
  "answers": [
    { "questionKey": "SLEEP_Q1", "score": 4 },
    { "questionKey": "SLEEP_Q2", "score": 3 },
    { "questionKey": "SLEEP_Q3", "score": 5 }
  ]
}

Success 200:
{
  "data": {
    "sectionScore": {
      "sectionKey": "SLEEP",
      "label": "Sleep Health",
      "score": 12,
      "maxScore": 15,
      "sectionPercent": 80,
      "isBonus": false
    },
    "progress": {
      "coreRawScore": 12,
      "coreScorePercentage": 9,
      "sectionsCompleted": 1,
      "totalCoreSections": 8,
      "progressPercent": 13
    },
    "nextSection": "ENERGY"   ← null if this was the last section
  }
}
→ Save sectionScore in AssessmentContext.sectionScores
→ if nextSection !== null → navigate to /assessment/section/{nextSection}
→ if nextSection === null (CULTURE done, or user skips bonus):
    call complete endpoint (see below)
```

**After PREVENTIVE section (last core section):**
`nextSection` will be `"CULTURE"`. Show the user:
- Current core score so far
- "Continue to Bonus Section" button → goes to CULTURE
- "Skip Bonus & Complete" button → skips CULTURE, calls complete directly

**After CULTURE section:**
`nextSection` will be `null`. Automatically call complete:

```
POST /assessment/{assessmentId}/complete
Header: Authorization: Bearer {token}
Body: (empty)

Success 200:
{
  "data": {
    "assessmentId": "uuid",
    "coreScore": 98,
    "scorePercentage": 73,
    "bonusScore": 16,
    "bonusPercentage": 80,
    "scoreBand": "GOOD",
    "bandLabel": "Good",
    "bandDescription": "Good habits in place, but some gaps to fill",
    "sectionScores": [
      { "sectionKey": "SLEEP",      "label": "Sleep Health",              "score": 12, "maxScore": 15, "sectionPercent": 80, "isBonus": false },
      { "sectionKey": "ENERGY",     "label": "Daily Energy & Vitality",   "score": 10, "maxScore": 15, "sectionPercent": 67, "isBonus": false },
      { "sectionKey": "HYDRATION",  "label": "Hydration & Water Habits",  "score": 13, "maxScore": 15, "sectionPercent": 87, "isBonus": false },
      { "sectionKey": "FOOD",       "label": "Food Quality & Eating",     "score": 14, "maxScore": 20, "sectionPercent": 70, "isBonus": false },
      { "sectionKey": "ACTIVITY",   "label": "Physical Activity",         "score": 11, "maxScore": 15, "sectionPercent": 73, "isBonus": false },
      { "sectionKey": "STRESS",     "label": "Stress & Emotional Health", "score": 13, "maxScore": 20, "sectionPercent": 65, "isBonus": false },
      { "sectionKey": "RISK",       "label": "Risk Habits",               "score": 14, "maxScore": 15, "sectionPercent": 93, "isBonus": false },
      { "sectionKey": "PREVENTIVE", "label": "Preventive Health",         "score": 11, "maxScore": 20, "sectionPercent": 55, "isBonus": false },
      { "sectionKey": "CULTURE",    "label": "Family Health Culture",     "score": 16, "maxScore": 20, "sectionPercent": 80, "isBonus": true  }
    ],
    "weakestSection": { "sectionKey": "PREVENTIVE", "label": "Preventive Health", "sectionPercent": 55 },
    "completedAt": "2024-01-01T00:00:00.000Z"
  }
}
→ Save result in AssessmentContext
→ Navigate to /assessment/result
```

**Error 400 (missing sections):**
```json
{ "error": "Cannot complete — missing sections: STRESS, RISK" }
```
→ Navigate back to the first missing section

---

### 8.7 ResultPage — `/assessment/result`

**Purpose:** Show the completed assessment score with section breakdown.

**Data source:** Use result stored in AssessmentContext from the complete call. If context is empty (user navigated directly), call:
```
GET /assessment/{assessmentId}/result
Header: Authorization: Bearer {token}

Success 200:
{
  "data": {
    "assessmentId": "uuid",
    "coreScore": 98,
    "scorePercentage": 73,
    "bonusScore": 16,
    "bonusPercentage": 80,
    "scoreBand": "GOOD",
    "bandLabel": "Good",
    "bandDescription": "Good habits in place, but some gaps to fill",
    "sectionScores": [ ...array of 9 sections... ],
    "weakestSection": { "sectionKey": "PREVENTIVE", "label": "Preventive Health", "sectionPercent": 55 },
    "improvementPlan": null,
    "completedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Display elements:**
1. Main score: large number showing `scorePercentage` (e.g., "73%") out of 100%
2. Score band label: e.g., "GOOD"
3. Band description: e.g., "Good habits in place, but some gaps to fill"
4. Bonus score: "Bonus: 80%" (shown separately, smaller)
5. Section breakdown: list all 9 sections showing:
   - Section name
   - Score percentage (e.g., 80%)
   - Bonus badge for CULTURE section
6. Weakest section highlighted with a callout: "Your weakest area: Preventive Health (55%)"

**Score band color reference (for the band label display):**
```
VERY_STRONG → green tone
GOOD        → blue tone
MODERATE    → yellow tone
WEAK        → orange tone
HIGH_RISK   → red tone
```

**Button:** "Create My Improvement Plan" → navigate to `/improvement-plan`

**Secondary link:** "Go to Dashboard" → navigate to `/dashboard`

---

### 8.8 ImprovementPlanPage — `/improvement-plan`

**Purpose:** User fills in 5 free-text reflection fields based on their results.

**Context shown at top:**
- Their score: "Your Score: 73%" — GOOD
- Weakest section: "Focus Area: Preventive Health (55%)"

**Form fields (all optional):**
1. "Our Biggest Health Gap Is" — textarea, max 1000 chars
   - Placeholder: "Write the section where your family scored lowest..."
2. "The One Habit We Must Improve First" — textarea, max 1000 chars
   - Placeholder: "The single most impactful habit to start immediately..."
3. "The Harmful Pattern We Must Reduce" — textarea, max 1000 chars
   - Placeholder: "Name one risk habit or pattern to eliminate..."
4. "One Health Habit We Will Do Together Daily" — textarea, max 1000 chars
   - Placeholder: "Our daily family wellness commitment..."
5. "Our Target Score After 21 Days" — number input (1-100)
   - Placeholder: "Enter your target percentage (e.g., 85)"
   - Label: "Target: ___% (Current: 73%)"

**On submit:**
```
POST /assessment/{assessmentId}/improvement-plan
Header: Authorization: Bearer {token}
Body: {
  "biggestGap": "Sleep and preventive health",
  "habitToImprove": "Sleep by 10:30 PM every night",
  "patternToReduce": "Late night phone use",
  "dailyFamilyHabit": "Morning walk together for 30 minutes",
  "targetScore": 85
}

Success 201:
{
  "data": {
    "id": "uuid",
    "assessmentId": "uuid",
    "biggestGap": "Sleep and preventive health",
    "habitToImprove": "Sleep by 10:30 PM every night",
    "patternToReduce": "Late night phone use",
    "dailyFamilyHabit": "Morning walk together for 30 minutes",
    "targetScore": 85,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
→ Navigate to /dashboard
```

**Button:** "Complete & Go to Dashboard"
**Skip link:** "Skip for now" → navigate to `/dashboard` without saving

---

### 8.9 DashboardPage — `/dashboard`

**Purpose:** User's home screen after completing assessment. Shows their score summary and history.

**API call on mount:**
```
GET /dashboard
Header: Authorization: Bearer {token}

Success 200:
{
  "data": {
    "user": {
      "id": "uuid",
      "name": "Rahul",
      "mobile": "9876543210",
      "role": "USER",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "latestAssessment": {
      "assessmentId": "uuid",
      "coreScore": 98,
      "scorePercentage": 73,
      "bonusScore": 16,
      "bonusPercentage": 80,
      "scoreBand": "GOOD",
      "bandLabel": "Good",
      "bandDescription": "Good habits in place, but some gaps to fill",
      "sectionScores": [ ...9 sections... ],
      "weakestSection": { "sectionKey": "PREVENTIVE", "label": "Preventive Health", "sectionPercent": 55 },
      "improvementPlan": {
        "id": "uuid",
        "biggestGap": "Preventive health",
        "habitToImprove": "Annual checkup",
        "patternToReduce": "Skipping doctor visits",
        "dailyFamilyHabit": "Morning walk",
        "targetScore": 85,
        "createdAt": "..."
      },
      "completedAt": "2024-01-01T00:00:00.000Z"
    },
    "assessmentHistory": [
      {
        "assessmentId": "uuid",
        "coreScore": 98,
        "scorePercentage": 73,
        "scoreBand": "GOOD",
        "bandLabel": "Good",
        "completedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "stats": {
      "totalCompletedAssessments": 1,
      "scoreTrend": null,
      "hasActiveAssessment": false,
      "activeAssessmentId": null
    }
  }
}
```

**Display elements:**

**If `latestAssessment === null`** (user hasn't completed any assessment):
- Welcome message with user's name
- "Start Your Health Assessment" button → navigate to `/welcome`

**If `latestAssessment !== null`:**

1. **Header card:** "Hello, {user.name}" + "Your Family Health Score"

2. **Score card (main):**
   - Large: `{scorePercentage}%`
   - Band label: e.g., "GOOD"
   - Band description
   - Completed date
   - Bonus score: "Bonus Score: {bonusPercentage}%"

3. **Section scores breakdown:**
   - List all 9 sections
   - Each shows: section name + percentage
   - Weakest section highlighted

4. **Improvement Plan card** (if `improvementPlan !== null`):
   - Show all 5 fields if filled
   - Target score prominently: "Target: {targetScore}%"

5. **Assessment History** (if `assessmentHistory.length > 1`):
   - Show list of past assessments with date and score
   - Score trend: if `scoreTrend > 0` → "↑ Improved by {scoreTrend}%", if negative → "↓ Declined by {Math.abs(scoreTrend)}%"

6. **Stats row:**
   - "Total Assessments: {totalCompletedAssessments}"
   - "Score Trend: {scoreTrend}%" or "First Assessment"

7. **Action buttons:**
   - If `hasActiveAssessment === true` → "Resume Assessment" → navigate to section resume flow
   - "Take New Assessment" → calls `POST /assessment` then navigates to `/welcome`
   - If no improvement plan → "Add Improvement Plan" → navigate to `/improvement-plan`

**Resume logic:**
```
GET /assessment/active
Response:
{
  "data": {
    "activeAssessment": {
      "assessmentId": "uuid",
      "status": "IN_PROGRESS",
      "familyProfileCompleted": true,
      "answeredSections": ["SLEEP", "ENERGY"],
      "unansweredCoreSections": ["HYDRATION","FOOD","ACTIVITY","STRESS","RISK","PREVENTIVE"],
      "bonusAnswered": false,
      "progress": { "sectionsCompleted": 2, "totalCoreSections": 8, "progressPercent": 25 },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
→ Navigate to /assessment/section/{unansweredCoreSections[0]}
```

8. **Logout button** → calls:
```
POST /auth/logout
Header: Authorization: Bearer {token}

Success 200: { "data": { "loggedOut": true } }
→ Clear localStorage → redirect to /login
```

---

## 9. Admin Pages

All admin pages require `role === 'ADMIN'`. Use `AdminRoute` wrapper.

---

### 9.1 AdminDashboardPage — `/admin`

**Purpose:** Platform overview for NSI admin.

**API call on mount:**
```
GET /admin/stats
Header: Authorization: Bearer {token}

Success 200:
{
  "data": {
    "totalUsers": 150,
    "totalAssessments": 89,
    "completedAssessments": 67,
    "completionRate": 75,
    "averageScorePercentage": 61,
    "bandDistribution": {
      "VERY_STRONG": 5,
      "GOOD": 22,
      "MODERATE": 28,
      "WEAK": 10,
      "HIGH_RISK": 2
    }
  }
}
```

**Display elements:**
1. Stat cards:
   - Total Users: `{totalUsers}`
   - Total Assessments: `{totalAssessments}`
   - Completed: `{completedAssessments}` ({completionRate}%)
   - Average Score: `{averageScorePercentage}%`

2. Band distribution — show as 5 items with count and percentage of completed:
   - Very Strong: {VERY_STRONG} users
   - Good: {GOOD} users
   - Moderate: {MODERATE} users
   - Weak: {WEAK} users
   - High Risk: {HIGH_RISK} users

3. Navigation links: "View All Users" → `/admin/users`, "View All Assessments" → `/admin/assessments`

4. Logout button (same as user logout)

---

### 9.2 AdminUsersPage — `/admin/users`

**Purpose:** List all users with search, pagination.

**API call on mount + on filter change:**
```
GET /admin/users?page=1&limit=20&search=
Header: Authorization: Bearer {token}

Query params:
- page: number (default 1)
- limit: number (default 20)
- search: string (search by name or mobile, optional)

Success 200:
{
  "data": {
    "users": [
      {
        "id": "uuid",
        "name": "Rahul Sharma",
        "mobile": "9876543210",
        "role": "USER",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "latestAssessment": {
          "assessmentId": "uuid",
          "scorePercentage": 73,
          "scoreBand": "GOOD",
          "completedAt": "2024-01-01T00:00:00.000Z"
        }
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "totalPages": 8
    }
  }
}
```

**Display elements:**
1. Search input — debounced (300ms) → updates `search` query param
2. Table/list showing each user:
   - Name
   - Mobile
   - Role badge (USER / ADMIN)
   - Latest score: `{scorePercentage}%` or "No assessment"
   - Score band label
   - Registered date
   - Actions: "View" → `/admin/users/{id}`, "Delete"
3. Pagination controls: Previous / Next / page numbers
4. `latestAssessment` is `null` for users with no completed assessment → show "Not taken"

**Delete user:**
On delete click → show confirmation modal → on confirm:
```
DELETE /admin/users/{id}
Header: Authorization: Bearer {token}

Success 200:
{ "data": { "deleted": true, "userId": "uuid" } }
→ Remove user from list
→ Show success message

Error 400: "Admins cannot delete their own account"
→ Show error toast
```

---

### 9.3 AdminUserDetailPage — `/admin/users/:id`

**Purpose:** Full user profile with complete assessment history.

**API call on mount:**
```
GET /admin/users/{id}
Header: Authorization: Bearer {token}

Success 200:
{
  "data": {
    "id": "uuid",
    "name": "Rahul Sharma",
    "mobile": "9876543210",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "assessments": [
      {
        "assessmentId": "uuid",
        "coreScore": 98,
        "scorePercentage": 73,
        "bonusScore": 16,
        "bonusPercentage": 80,
        "scoreBand": "GOOD",
        "bandLabel": "Good",
        "bandDescription": "...",
        "sectionScores": [ ...9 sections... ],
        "weakestSection": { "sectionKey": "PREVENTIVE", "label": "Preventive Health", "sectionPercent": 55 },
        "improvementPlan": { ... } | null,
        "completedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Display elements:**
1. User info card: name, mobile, role, registered date
2. Edit form (inline):
   - Name (editable)
   - Mobile (editable)
   - Role (select: USER / ADMIN)
   - "Save Changes" button

   **On save:**
   ```
   PATCH /admin/users/{id}
   Header: Authorization: Bearer {token}
   Body: { name?: string, mobile?: string, role?: "USER" | "ADMIN" }

   Success 200:
   { "data": { "id", "name", "mobile", "role", "updatedAt" } }
   → Update local state
   → Show success message

   Error 409: "Mobile already in use"
   → Show error under mobile field
   ```

3. Assessment history list:
   - Each assessment shows: date, score %, band, weakest section
   - Expandable to show all 9 section scores
   - Shows improvement plan if it exists

---

### 9.4 AdminAssessmentsPage — `/admin/assessments`

**Purpose:** List all assessments across all users with filters.

**API call on mount + on filter change:**
```
GET /admin/assessments?page=1&limit=20&scoreBand=&status=
Header: Authorization: Bearer {token}

Query params:
- page: number (default 1)
- limit: number (default 20)
- scoreBand: "VERY_STRONG" | "GOOD" | "MODERATE" | "WEAK" | "HIGH_RISK" (optional)
- status: "IN_PROGRESS" | "COMPLETED" (optional)

Success 200:
{
  "data": {
    "assessments": [
      {
        "assessmentId": "uuid",
        "user": { "id": "uuid", "name": "Rahul", "mobile": "9876543210" },
        "status": "COMPLETED",
        "coreScore": 98,
        "scorePercentage": 73,
        "scoreBand": "GOOD",
        "bandLabel": "Good",
        "completedAt": "2024-01-01T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 89,
      "page": 1,
      "limit": 20,
      "totalPages": 5
    }
  }
}
```

**Display elements:**
1. Filter row:
   - Score band dropdown: All / Very Strong / Good / Moderate / Weak / High Risk
   - Status dropdown: All / In Progress / Completed
2. Table showing each assessment:
   - User name + mobile (clickable → `/admin/users/{userId}`)
   - Status badge
   - Score percentage (for COMPLETED)
   - Band label
   - Completed date or "In Progress"
   - Actions: "View" → `/admin/assessments/{id}`, "Delete"
3. Pagination

**Delete assessment:**
```
DELETE /admin/assessments/{id}
Header: Authorization: Bearer {token}

Success 200:
{ "data": { "deleted": true, "assessmentId": "uuid" } }
→ Remove from list
```

---

### 9.5 AdminAssessmentDetailPage — `/admin/assessments/:id`

**Purpose:** Full detail view of a single assessment.

**API call on mount:**
```
GET /admin/assessments/{id}
Header: Authorization: Bearer {token}

Success 200:
{
  "data": {
    "assessmentId": "uuid",
    "coreScore": 98,
    "scorePercentage": 73,
    "bonusScore": 16,
    "bonusPercentage": 80,
    "scoreBand": "GOOD",
    "bandLabel": "Good",
    "bandDescription": "Good habits in place, but some gaps to fill",
    "sectionScores": [
      { "sectionKey": "SLEEP",     "label": "Sleep Health",    "score": 12, "maxScore": 15, "sectionPercent": 80, "isBonus": false },
      { "sectionKey": "ENERGY",    "label": "Daily Energy",    "score": 10, "maxScore": 15, "sectionPercent": 67, "isBonus": false },
      ...all 9 sections
    ],
    "weakestSection": { "sectionKey": "PREVENTIVE", "label": "Preventive Health", "sectionPercent": 55 },
    "improvementPlan": {
      "id": "uuid",
      "biggestGap": "...",
      "habitToImprove": "...",
      "patternToReduce": "...",
      "dailyFamilyHabit": "...",
      "targetScore": 85,
      "createdAt": "..."
    },
    "user": { "id": "uuid", "name": "Rahul", "mobile": "9876543210" },
    "familyProfile": {
      "city": "Mumbai",
      "state": "Maharashtra",
      "age": 35,
      "maritalStatus": "MARRIED",
      "familyMemberCount": 4,
      "hasChildren": true,
      "hasElderlyParents": false,
      "hasHealthCondition": false,
      "primaryCook": "Wife",
      "healthDecisionMaker": "Self"
    },
    "completedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Display elements:**
1. User info: name, mobile (link to `/admin/users/{userId}`)
2. Family profile card (all 10 fields)
3. Score summary: total %, band, completed date
4. All 9 section scores
5. Weakest section callout
6. Improvement plan (all 5 fields, if present)
7. "Delete Assessment" button → confirmation → delete → back to `/admin/assessments`

---

## 10. Global State & Data Flow

### Assessment Context — what to persist
Store in `AssessmentContext` (and also `sessionStorage` to survive page refresh):
```typescript
{
  assessmentId: string | null,
  sectionScores: SectionScoreResult[],
  result: AssessmentResult | null,
  questions: QuestionsResponse | null,  // from GET /assessment/questions
}
```

### Questions data — fetch once, cache everywhere
`GET /assessment/questions` is public and never changes. Fetch it once on app start (or on first visit to FamilyProfilePage) and store in AssessmentContext. Every SectionPage reads from this cache — never re-fetches.

### React Query cache keys
```
['questions']                          → GET /assessment/questions
['assessment', 'active']              → GET /assessment/active
['assessment', id]                    → GET /assessment/{id}
['assessment', id, 'result']          → GET /assessment/{id}/result
['dashboard']                         → GET /dashboard
['admin', 'stats']                    → GET /admin/stats
['admin', 'users', { page, search }] → GET /admin/users
['admin', 'users', id]               → GET /admin/users/{id}
['admin', 'assessments', { page, scoreBand, status }] → GET /admin/assessments
['admin', 'assessments', id]         → GET /admin/assessments/{id}
```

---

## 11. Error Handling

### Global error states
- **Network error / server down:** Show "Unable to connect. Check your connection."
- **401 Unauthorized:** Trigger token refresh (see interceptor). If refresh fails → logout → `/login`
- **403 Forbidden:** Show "You don't have permission to view this page."
- **404 Not Found:** Show "Resource not found."
- **422 Validation error:** Show field-level errors from the response
- **429 Too Many Requests:** Show "Too many attempts. Please wait a minute."
- **500 Server Error:** Show "Something went wrong. Please try again."

### Toast notifications
Show success/error toasts for:
- Profile saved ✓
- Section saved ✓
- Assessment completed ✓
- Plan saved ✓
- User deleted ✓
- Assessment deleted ✓
- Any API error

---

## 12. Navigation Guards Logic

```typescript
// ProtectedRoute: any authenticated user
if (!isAuthenticated) → redirect to /login

// AdminRoute: only ADMIN role
if (!isAuthenticated) → redirect to /login
if (user.role !== 'ADMIN') → redirect to /dashboard

// PublicOnlyRoute: only unauthenticated
if (isAuthenticated && user.role === 'USER') → redirect to /dashboard
if (isAuthenticated && user.role === 'ADMIN') → redirect to /admin
```

---

## 13. TypeScript Types Reference

```typescript
// API envelope
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message: string;
  timestamp: string;
}

interface ApiError {
  success: false;
  statusCode: number;
  error: string;
  data: null | Record<string, unknown>;
  timestamp: string;
  path: string;
}

// Auth
interface User {
  id: string;
  name: string;
  mobile: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

// Questions
interface Question {
  questionKey: string;
  text: string;
  hint: string | null;
}

interface Section {
  sectionKey: string;
  label: string;
  order: number;
  maxScore: number;
  isBonus: boolean;
  questions: Question[];
}

interface ScoreBand {
  band: 'VERY_STRONG' | 'GOOD' | 'MODERATE' | 'WEAK' | 'HIGH_RISK';
  minPct: number;
  maxPct: number;
  label: string;
  description: string;
}

interface QuestionsResponse {
  sections: Section[];
  meta: {
    totalSections: number;
    coreSections: number;
    bonusSections: number;
    totalQuestions: number;
    coreQuestions: number;
    coreMaxScore: number;
    bonusMaxScore: number;
    scoreBands: ScoreBand[];
  };
}

// Assessment
interface SectionScoreResult {
  sectionKey: string;
  label: string;
  score: number;
  maxScore: number;
  sectionPercent: number;
  isBonus: boolean;
}

interface WeakestSection {
  sectionKey: string;
  label: string;
  sectionPercent: number;
}

interface ImprovementPlan {
  id: string;
  biggestGap: string | null;
  habitToImprove: string | null;
  patternToReduce: string | null;
  dailyFamilyHabit: string | null;
  targetScore: number | null;
  createdAt: string;
}

interface AssessmentResult {
  assessmentId: string;
  coreScore: number;
  scorePercentage: number;
  bonusScore: number;
  bonusPercentage: number;
  scoreBand: 'VERY_STRONG' | 'GOOD' | 'MODERATE' | 'WEAK' | 'HIGH_RISK';
  bandLabel: string;
  bandDescription: string;
  sectionScores: SectionScoreResult[];
  weakestSection: WeakestSection | null;
  improvementPlan: ImprovementPlan | null;
  completedAt: string;
}

// Dashboard
interface DashboardResponse {
  user: User;
  latestAssessment: AssessmentResult | null;
  assessmentHistory: {
    assessmentId: string;
    coreScore: number;
    scorePercentage: number;
    scoreBand: string;
    bandLabel: string;
    completedAt: string;
  }[];
  stats: {
    totalCompletedAssessments: number;
    scoreTrend: number | null;
    hasActiveAssessment: boolean;
    activeAssessmentId: string | null;
  };
}

// Admin
interface AdminUserSummary {
  id: string;
  name: string;
  mobile: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  latestAssessment: {
    assessmentId: string;
    scorePercentage: number;
    scoreBand: string;
    completedAt: string;
  } | null;
}

interface PlatformStats {
  totalUsers: number;
  totalAssessments: number;
  completedAssessments: number;
  completionRate: number;
  averageScorePercentage: number;
  bandDistribution: Record<string, number>;
}
```

---

## 14. Section Key Order (hardcoded constant)

```typescript
export const SECTION_ORDER = [
  'SLEEP', 'ENERGY', 'HYDRATION', 'FOOD',
  'ACTIVITY', 'STRESS', 'RISK', 'PREVENTIVE', 'CULTURE'
] as const;

export const CORE_SECTIONS = [
  'SLEEP', 'ENERGY', 'HYDRATION', 'FOOD',
  'ACTIVITY', 'STRESS', 'RISK', 'PREVENTIVE'
] as const;
```

---

## 15. After Implementation — Verify These

```
□ Register → auto-login → Welcome page
□ Login as USER → check active assessment → correct redirect
□ Login as ADMIN → lands on /admin, cannot access /dashboard
□ USER cannot access /admin/* routes
□ All 9 sections navigate in order: SLEEP → ENERGY → ... → CULTURE
□ Skipping CULTURE works (goes straight to complete)
□ Score result shows correct percentage and band
□ Dashboard shows history + trend for users with 2+ assessments
□ Admin search filters users by name/mobile
□ Admin score band filter works
□ Admin can edit user name/mobile/role
□ Admin cannot delete their own account
□ Token refresh works silently (token expires → refresh → retry)
□ Logout clears state and redirects to /login
□ Refreshing any page maintains auth state
□ 401 on refresh token expiry → redirects to login
```

---

## 16. Important Notes for Implementation

1. **The backend uses HttpOnly cookies for refresh tokens.** Set `withCredentials: true` on the Axios instance. Never read or write the refresh token in JavaScript.

2. **CORS is configured.** The backend allows `http://localhost:3001` and `http://localhost:8081`. Run the frontend on port `5173` (Vite default) — add this to CORS if needed, or proxy via Vite config.

3. **All API responses are wrapped** in the standard envelope. Always read `.data.data` for the actual payload (outer `.data` is Axios, inner `.data` is the envelope's data field).

4. **The questions endpoint is public** — call it without auth header. Cache it. Don't call it on every section page.

5. **Score percentage is always 0-100** (integer). Never show the raw 0-135 score to the user. Use `scorePercentage` from the API.

6. **The CULTURE section is bonus** — visually distinguish it. Its score does NOT affect the main band. Show it separately.

7. **Section order is fixed** — always SLEEP first, CULTURE last. The API returns them in the correct order via `SECTION_ORDER`.

8. **`nextSection` in the saveSection response** — when this is `null`, all sections after the current one are done. Trigger the complete flow.