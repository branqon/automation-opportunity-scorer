# AI-Native Rebuild Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Automation Opportunity Scorer into an AI-native portfolio piece with configurable LLM integration, API layer, testing, CI/CD, deployment config, and polish features.

**Architecture:** Next.js App Router with server-side API routes, Postgres via Prisma, configurable LLM abstraction (Claude + OpenAI), Vitest for testing, GitHub Actions CI, Vercel deployment + Docker.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Prisma 7 (Postgres), Anthropic SDK, OpenAI SDK, Vitest, Tailwind CSS 4, GitHub Actions, Docker

---

## Phase 1: Database Migration

### Task 1: Switch Prisma from SQLite to Postgres

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `src/lib/prisma.ts`
- Modify: `prisma.config.ts`
- Modify: `package.json`
- Create: `.env.example`

**Step 1: Update Prisma schema provider**

In `prisma/schema.prisma`, change the datasource:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Keep the generator block unchanged.

**Step 2: Update Prisma client singleton**

Replace `src/lib/prisma.ts` entirely:

```typescript
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

**Step 3: Update prisma.config.ts**

Remove the dotenv import and sqlite URL fallback:

```typescript
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
```

**Step 4: Remove SQLite adapter dependency, keep prisma**

Run:
```bash
npm uninstall @prisma/adapter-better-sqlite3
```

**Step 5: Create .env.example**

Create `.env.example`:
```
# Database (Neon Postgres or local Postgres)
DATABASE_URL="postgresql://user:password@localhost:5432/automation_scorer?schema=public"
```

**Step 6: Create .env with local Postgres URL**

Create `.env` (gitignored):
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/automation_scorer?schema=public"
```

**Step 7: Regenerate Prisma client and push schema**

Run:
```bash
npx prisma generate && npx prisma db push
```
Expected: Schema pushed to Postgres, client regenerated without adapter.

**Step 8: Commit**

```bash
git add prisma/schema.prisma src/lib/prisma.ts prisma.config.ts package.json package-lock.json .env.example
git commit -m "feat: migrate from SQLite to Postgres"
```

---

### Task 2: Add Team table and refactor Opportunity model

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `prisma/seed.ts`
- Modify: `src/lib/metadata.ts`
- Modify: `src/lib/opportunities.ts`
- Modify: `src/lib/scoring.ts`
- Modify: `src/components/dashboard/filters.tsx`
- Modify: `src/components/dashboard/opportunity-table.tsx`
- Modify: `src/components/dashboard/top-candidates.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/opportunities/[slug]/page.tsx`

**Step 1: Update Prisma schema**

Replace the Team enum and Opportunity model in `prisma/schema.prisma`:

```prisma
generator client {
  provider   = "prisma-client"
  output     = "../src/generated/prisma"
  engineType = "client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Team {
  id            String        @id @default(cuid())
  slug          String        @unique
  name          String
  description   String        @default("")
  opportunities Opportunity[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

enum AutomationType {
  SELF_SERVICE_WORKFLOW
  API_WORKFLOW
  APPROVAL_GATED_PROVISIONING
  AI_ASSISTED_TRIAGE
  SCHEDULED_FOLLOW_UP
  SYSTEM_INTEGRATION
}

enum OpportunitySource {
  SEED
  MANUAL
  AI_ASSISTED
}

model Opportunity {
  id                            String            @id @default(cuid())
  slug                          String            @unique
  name                          String
  team                          Team              @relation(fields: [teamId], references: [id])
  teamId                        String
  monthlyVolume                 Int
  avgHandleTimeMinutes          Int
  repeatabilityScore            Int
  standardizationScore          Int
  approvalComplexityScore       Int
  reworkRateScore               Int
  slaRiskScore                  Int
  customerImpactScore           Int
  implementationDifficultyScore Int
  suggestedAutomationType       AutomationType
  summary                       String
  suggestedApproach             String
  implementationConsiderations  String
  riskNotes                     String
  recommendedNextStep           String
  source                        OpportunitySource @default(SEED)
  aiAnalysis                    String?
  createdAt                     DateTime          @default(now())
  updatedAt                     DateTime          @updatedAt
}
```

**Step 2: Update seed script**

Replace `prisma/seed.ts` to create teams first, then opportunities with FK:

```typescript
import { Prisma, PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

const teams = [
  { slug: "service-desk", name: "Service Desk", description: "Front-line IT support handling incidents, requests, and user-facing issues." },
  { slug: "security-ops", name: "Security Ops", description: "Identity, access, and threat response operations." },
  { slug: "it-ops", name: "IT Operations", description: "Infrastructure, licensing, and platform management." },
  { slug: "people-ops", name: "People Operations", description: "HR workflows including onboarding, offboarding, and employee lifecycle." },
  { slug: "procurement", name: "Procurement", description: "Purchasing, vendor management, and procurement intake." },
  { slug: "service-delivery", name: "Service Delivery", description: "SLA management, ticket lifecycle, and delivery coordination." },
  { slug: "revops", name: "Revenue Operations", description: "Quote-to-cash, CRM processes, and revenue lifecycle." },
  { slug: "application-support", name: "Application Support", description: "Line-of-business app triage, classification, and issue resolution." },
  { slug: "finance-ops", name: "Finance Operations", description: "Approval chains, reconciliation, and financial process automation." },
] satisfies Prisma.TeamCreateManyInput[];

const opportunities: (Omit<Prisma.OpportunityCreateManyInput, "teamId"> & { teamSlug: string })[] = [
  {
    slug: "password-reset",
    name: "Password reset",
    teamSlug: "service-desk",
    monthlyVolume: 780,
    avgHandleTimeMinutes: 9,
    repeatabilityScore: 5,
    standardizationScore: 5,
    approvalComplexityScore: 1,
    reworkRateScore: 2,
    slaRiskScore: 3,
    customerImpactScore: 4,
    implementationDifficultyScore: 2,
    suggestedAutomationType: "SELF_SERVICE_WORKFLOW",
    summary: "A high-volume service desk request with a stable identity-validation path and low exception handling.",
    suggestedApproach: "Launch a self-service password reset flow tied to identity verification and directory API actions.",
    implementationConsiderations: "Validate enrollment coverage, support fallback routing for non-enrolled users, and preserve audit logging.",
    riskNotes: "Users without recovery factors still need an assisted path, and lockout policy changes require coordination with security.",
    recommendedNextStep: "Build a self-service password reset form backed by directory API actions and route non-enrolled users to human review.",
  },
  {
    slug: "mfa-reset",
    name: "MFA reset",
    teamSlug: "security-ops",
    monthlyVolume: 240,
    avgHandleTimeMinutes: 14,
    repeatabilityScore: 5,
    standardizationScore: 4,
    approvalComplexityScore: 2,
    reworkRateScore: 2,
    slaRiskScore: 4,
    customerImpactScore: 5,
    implementationDifficultyScore: 2,
    suggestedAutomationType: "SELF_SERVICE_WORKFLOW",
    summary: "Users are blocked from core systems until MFA is reset, but the recovery process is still mostly manual.",
    suggestedApproach: "Create a guided reset journey with conditional verification checks and identity-provider actions.",
    implementationConsiderations: "Pair step-up verification with enrollment checks and route privileged accounts through an escalated path.",
    riskNotes: "Security review is required for privileged users and failed verification attempts must be rate-limited and logged.",
    recommendedNextStep: "Implement a self-service MFA recovery workflow with identity verification, privileged-account guardrails, and audit events.",
  },
  {
    slug: "new-user-onboarding",
    name: "New user onboarding",
    teamSlug: "people-ops",
    monthlyVolume: 35,
    avgHandleTimeMinutes: 110,
    repeatabilityScore: 4,
    standardizationScore: 4,
    approvalComplexityScore: 3,
    reworkRateScore: 4,
    slaRiskScore: 5,
    customerImpactScore: 5,
    implementationDifficultyScore: 3,
    suggestedAutomationType: "APPROVAL_GATED_PROVISIONING",
    summary: "Onboarding spans HR, identity, device, and application setup, creating a long multi-step handoff sequence.",
    suggestedApproach: "Use an approval-gated provisioning flow that fans out account creation, license assignment, and checklist tasks.",
    implementationConsiderations: "Model dependencies between HRIS data, manager approvals, hardware availability, and application entitlements.",
    riskNotes: "Data quality from source systems can cause provisioning errors, and exceptions for contractors should stay human-reviewed.",
    recommendedNextStep: "Build an approval-gated provisioning flow that starts from the HRIS event, creates core accounts through APIs, and pauses only for exception cases.",
  },
  {
    slug: "procurement-request",
    name: "Procurement request",
    teamSlug: "procurement",
    monthlyVolume: 60,
    avgHandleTimeMinutes: 75,
    repeatabilityScore: 4,
    standardizationScore: 3,
    approvalComplexityScore: 4,
    reworkRateScore: 3,
    slaRiskScore: 3,
    customerImpactScore: 4,
    implementationDifficultyScore: 3,
    suggestedAutomationType: "APPROVAL_GATED_PROVISIONING",
    summary: "Requests often start with incomplete data and then bounce through budget approval, vendor review, and order creation.",
    suggestedApproach: "Standardize intake with a structured request form and automate routing once required fields are present.",
    implementationConsiderations: "Capture cost center, vendor, urgency, and category data upfront so approvals and downstream records stay clean.",
    riskNotes: "Approval bottlenecks remain the main delay, and edge-case purchases still need policy review.",
    recommendedNextStep: "Create a self-service procurement intake form that validates required fields and triggers an approval-gated PO workflow.",
  },
  {
    slug: "vpn-issue",
    name: "VPN issue",
    teamSlug: "service-desk",
    monthlyVolume: 210,
    avgHandleTimeMinutes: 27,
    repeatabilityScore: 3,
    standardizationScore: 3,
    approvalComplexityScore: 1,
    reworkRateScore: 4,
    slaRiskScore: 4,
    customerImpactScore: 5,
    implementationDifficultyScore: 3,
    suggestedAutomationType: "AI_ASSISTED_TRIAGE",
    summary: "Remote-access incidents share common failure patterns, but support still spends time gathering the same diagnostics by hand.",
    suggestedApproach: "Use guided triage and scripted checks to collect environment details before routing exceptions to an analyst.",
    implementationConsiderations: "Pull device posture, ISP, and client-version checks into a repeatable diagnostic sequence.",
    riskNotes: "Network edge cases remain broad, so automated recommendations should stay in a human-reviewed path when confidence is low.",
    recommendedNextStep: "Implement AI-assisted categorization with scripted VPN diagnostics and require human review before applying remediation outside the common cases.",
  },
  {
    slug: "printer-troubleshooting",
    name: "Printer troubleshooting",
    teamSlug: "service-desk",
    monthlyVolume: 150,
    avgHandleTimeMinutes: 22,
    repeatabilityScore: 4,
    standardizationScore: 3,
    approvalComplexityScore: 1,
    reworkRateScore: 4,
    slaRiskScore: 2,
    customerImpactScore: 2,
    implementationDifficultyScore: 2,
    suggestedAutomationType: "SELF_SERVICE_WORKFLOW",
    summary: "The issue set is repetitive and usually resolved through the same spooler, driver, or queue checks.",
    suggestedApproach: "Offer a self-service troubleshooting guide with scripted remediation for the common recovery steps.",
    implementationConsiderations: "Separate branch-specific printer mappings from global steps and keep an assisted fallback for hardware faults.",
    riskNotes: "Device-specific problems and local network issues can still require onsite intervention.",
    recommendedNextStep: "Create a self-service printer diagnostics form with background scripts for spooler restarts, mapping refresh, and queue cleanup.",
  },
  {
    slug: "email-access-issue",
    name: "Email access issue",
    teamSlug: "service-desk",
    monthlyVolume: 190,
    avgHandleTimeMinutes: 19,
    repeatabilityScore: 4,
    standardizationScore: 4,
    approvalComplexityScore: 1,
    reworkRateScore: 3,
    slaRiskScore: 4,
    customerImpactScore: 5,
    implementationDifficultyScore: 2,
    suggestedAutomationType: "API_WORKFLOW",
    summary: "Mailbox lockouts, quota issues, and mobile profile resets repeatedly interrupt business-critical communication.",
    suggestedApproach: "Automate common mailbox recovery actions behind policy checks and surface a guided self-service path for users.",
    implementationConsiderations: "Separate resettable incidents from retention or mailbox-permission changes that still need analyst approval.",
    riskNotes: "Shared mailbox and delegation changes can create access risk if the workflow is too permissive.",
    recommendedNextStep: "Build an email-access recovery workflow that validates policy rules, executes mailbox API actions, and escalates shared-mailbox exceptions.",
  },
  {
    slug: "stale-ticket-follow-up",
    name: "Stale ticket follow-up",
    teamSlug: "service-delivery",
    monthlyVolume: 420,
    avgHandleTimeMinutes: 6,
    repeatabilityScore: 5,
    standardizationScore: 5,
    approvalComplexityScore: 1,
    reworkRateScore: 3,
    slaRiskScore: 3,
    customerImpactScore: 2,
    implementationDifficultyScore: 1,
    suggestedAutomationType: "SCHEDULED_FOLLOW_UP",
    summary: "Analysts spend hours each week nudging requesters and owners on tickets that are waiting for updates.",
    suggestedApproach: "Schedule inactivity checks that send reminders, update ticket status, and escalate aging requests automatically.",
    implementationConsiderations: "Define inactivity windows, customer-friendly reminder language, and exception rules for major incidents.",
    riskNotes: "Over-automation can create noisy reminders if suppression logic is weak.",
    recommendedNextStep: "Automate inactivity follow-up using scheduled workflow logic that posts reminders, updates status, and escalates tickets that exceed response windows.",
  },
  {
    slug: "quote-to-procurement-handoff",
    name: "Quote-to-procurement handoff",
    teamSlug: "revops",
    monthlyVolume: 48,
    avgHandleTimeMinutes: 90,
    repeatabilityScore: 3,
    standardizationScore: 3,
    approvalComplexityScore: 3,
    reworkRateScore: 4,
    slaRiskScore: 4,
    customerImpactScore: 4,
    implementationDifficultyScore: 4,
    suggestedAutomationType: "SYSTEM_INTEGRATION",
    summary: "Sales-approved quotes are still re-entered into procurement and finance tools, creating delay and rework.",
    suggestedApproach: "Connect quote approval events to downstream purchasing records so teams stop rekeying the same data.",
    implementationConsiderations: "Map field ownership clearly across CRM, ERP, and purchasing tools before automating downstream writes.",
    riskNotes: "System integration errors can create financial reconciliation issues if validation is incomplete.",
    recommendedNextStep: "Build a CRM-to-procurement integration that triggers after quote approval, validates field completeness, and creates the downstream purchasing record automatically.",
  },
  {
    slug: "recurring-approval-chain",
    name: "Recurring approval chain",
    teamSlug: "finance-ops",
    monthlyVolume: 95,
    avgHandleTimeMinutes: 32,
    repeatabilityScore: 4,
    standardizationScore: 3,
    approvalComplexityScore: 5,
    reworkRateScore: 4,
    slaRiskScore: 3,
    customerImpactScore: 3,
    implementationDifficultyScore: 4,
    suggestedAutomationType: "APPROVAL_GATED_PROVISIONING",
    summary: "The same approval chain repeats across low-risk requests, but analysts still chase sign-off through email and chat.",
    suggestedApproach: "Centralize approval requests with conditional rules and only require manual intervention for policy exceptions.",
    implementationConsiderations: "Identify rule-based approvals that can be pre-approved and preserve audit-ready approval history.",
    riskNotes: "Policy exceptions and delegated approvers can create edge cases that need explicit governance.",
    recommendedNextStep: "Add an approval-gated workflow that auto-approves low-risk requests, records evidence, and routes policy exceptions to finance ops.",
  },
  {
    slug: "license-assignment",
    name: "License assignment",
    teamSlug: "it-ops",
    monthlyVolume: 180,
    avgHandleTimeMinutes: 18,
    repeatabilityScore: 4,
    standardizationScore: 4,
    approvalComplexityScore: 2,
    reworkRateScore: 3,
    slaRiskScore: 3,
    customerImpactScore: 4,
    implementationDifficultyScore: 2,
    suggestedAutomationType: "APPROVAL_GATED_PROVISIONING",
    summary: "Analysts spend time checking role eligibility, applying licenses, and updating internal records for routine requests.",
    suggestedApproach: "Automate role-based license fulfillment with a lightweight approval gate for non-standard requests.",
    implementationConsiderations: "Tie the workflow to role mappings and available inventory so fulfillment logic stays consistent.",
    riskNotes: "Non-standard software bundles and true-up reporting still need exception handling.",
    recommendedNextStep: "Build an approval-gated provisioning flow that validates role eligibility, assigns licenses by API, and routes non-standard bundles for review.",
  },
  {
    slug: "lob-app-issue-classification",
    name: "Line-of-business app issue classification",
    teamSlug: "application-support",
    monthlyVolume: 130,
    avgHandleTimeMinutes: 34,
    repeatabilityScore: 2,
    standardizationScore: 2,
    approvalComplexityScore: 1,
    reworkRateScore: 4,
    slaRiskScore: 4,
    customerImpactScore: 4,
    implementationDifficultyScore: 4,
    suggestedAutomationType: "AI_ASSISTED_TRIAGE",
    summary: "Application incidents contain inconsistent descriptions, so triage quality varies and the wrong queue often gets the work first.",
    suggestedApproach: "Use AI-assisted classification to suggest queue, urgency, and knowledge-base matches before an analyst confirms routing.",
    implementationConsiderations: "Keep confidence thresholds visible and pair the model with deterministic routing rules for known keywords.",
    riskNotes: "Classification drift is a real risk, so analysts need a clear review step and feedback loop.",
    recommendedNextStep: "Implement AI-assisted categorization with human review for routing decisions and capture reviewer overrides to refine the prompt and rules.",
  },
  {
    slug: "access-revocation-offboarding",
    name: "Access revocation offboarding",
    teamSlug: "security-ops",
    monthlyVolume: 28,
    avgHandleTimeMinutes: 95,
    repeatabilityScore: 4,
    standardizationScore: 4,
    approvalComplexityScore: 2,
    reworkRateScore: 3,
    slaRiskScore: 5,
    customerImpactScore: 5,
    implementationDifficultyScore: 3,
    suggestedAutomationType: "API_WORKFLOW",
    summary: "Offboarding requires coordinated deprovisioning across multiple systems under tight timing expectations.",
    suggestedApproach: "Trigger deprovisioning from the source offboarding event and automate system-level access revocation in sequence.",
    implementationConsiderations: "Sequence identity suspension, shared asset checks, and app revocation so data retention rules are preserved.",
    riskNotes: "Incorrect sequencing can break legal hold or asset-recovery steps, so a small set of exceptions should stay manual.",
    recommendedNextStep: "Build an HR-triggered deprovisioning workflow that revokes core access by API, logs each action, and pauses for legal-hold exceptions.",
  },
];

async function main() {
  // Clear existing data
  await prisma.opportunity.deleteMany();
  await prisma.team.deleteMany();

  // Create teams
  await prisma.team.createMany({ data: teams });
  const allTeams = await prisma.team.findMany();
  const teamsBySlug = new Map(allTeams.map((t) => [t.slug, t.id]));

  // Create opportunities with FK
  for (const { teamSlug, ...data } of opportunities) {
    const teamId = teamsBySlug.get(teamSlug);
    if (!teamId) throw new Error(`Team not found: ${teamSlug}`);
    await prisma.opportunity.create({
      data: { ...data, teamId },
    });
  }

  console.log(`Seeded ${allTeams.length} teams and ${opportunities.length} opportunities`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Failed to seed data", error);
    await prisma.$disconnect();
    process.exit(1);
  });
```

**Step 3: Update metadata.ts to use Team slugs instead of enum**

Replace `src/lib/metadata.ts`:

```typescript
import { AutomationType } from "@/generated/prisma/enums";

export const AUTOMATION_TYPE_LABELS: Record<AutomationType, string> = {
  SELF_SERVICE_WORKFLOW: "Self-service workflow",
  API_WORKFLOW: "API workflow",
  APPROVAL_GATED_PROVISIONING: "Approval-gated provisioning",
  AI_ASSISTED_TRIAGE: "AI-assisted triage",
  SCHEDULED_FOLLOW_UP: "Scheduled follow-up",
  SYSTEM_INTEGRATION: "System integration",
};

export const AUTOMATION_TYPE_DESCRIPTIONS: Record<AutomationType, string> = {
  SELF_SERVICE_WORKFLOW:
    "Best for repetitive requests that can be safely completed through a guided user flow.",
  API_WORKFLOW:
    "Uses direct API actions to complete a standard request after policy checks pass.",
  APPROVAL_GATED_PROVISIONING:
    "Automates fulfillment but preserves explicit approval checkpoints for risk-sensitive steps.",
  AI_ASSISTED_TRIAGE:
    "Reduces analyst handling time by classifying or gathering context before a human confirms the action.",
  SCHEDULED_FOLLOW_UP:
    "Targets recurring chase work through time-based reminders and status transitions.",
  SYSTEM_INTEGRATION:
    "Connects systems to remove duplicate entry and keep data synchronized across teams.",
};

export const FOCUS_OPTIONS = [
  { value: "all", label: "All opportunities" },
  { value: "quick-wins", label: "Quick wins" },
  { value: "strategic-bets", label: "Strategic bets" },
] as const;

export function getAutomationTypeLabel(type: AutomationType) {
  return AUTOMATION_TYPE_LABELS[type];
}
```

**Step 4: Update scoring.ts**

The scoring engine currently imports `Opportunity` type. With the Team relation, the Opportunity type from Prisma will include `teamId` instead of `team` enum. The scoring logic itself doesn't use the team field, so the type change is compatible. Update the import and the `EnrichedOpportunity` type to include the team relation:

In `src/lib/scoring.ts`, change line 1:
```typescript
import type { Opportunity, Team } from "@/generated/prisma/client";
```

Update the `EnrichedOpportunity` type (line 48):
```typescript
export type EnrichedOpportunity = Opportunity & { team: Team } & OpportunityAnalytics;
```

**Step 5: Update opportunities.ts**

The data fetching needs to include the team relation and filters need to use team slug instead of enum. Replace `src/lib/opportunities.ts`:

```typescript
import { AutomationType } from "@/generated/prisma/enums";

import { prisma } from "@/lib/prisma";
import {
  enrichOpportunity,
  type EnrichedOpportunity,
  type RankedOpportunity,
} from "@/lib/scoring";

export type DashboardFocus = "all" | "quick-wins" | "strategic-bets";

export type DashboardFilters = {
  team: string;
  automationType: AutomationType | "all";
  focus: DashboardFocus;
};

type RawSearchParams = Record<string, string | string[] | undefined>;

function readValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseDashboardFilters(searchParams: RawSearchParams): DashboardFilters {
  const requestedTeam = readValue(searchParams.team);
  const requestedAutomationType = readValue(searchParams.automationType);
  const requestedFocus = readValue(searchParams.focus);

  const validAutomationTypes = new Set(Object.values(AutomationType));
  const validFocus = new Set<DashboardFocus>([
    "all",
    "quick-wins",
    "strategic-bets",
  ]);

  return {
    team: requestedTeam ?? "all",
    automationType:
      requestedAutomationType &&
      validAutomationTypes.has(requestedAutomationType as AutomationType)
        ? (requestedAutomationType as AutomationType)
        : "all",
    focus:
      requestedFocus && validFocus.has(requestedFocus as DashboardFocus)
        ? (requestedFocus as DashboardFocus)
        : "all",
  };
}

function rankOpportunities(opportunities: EnrichedOpportunity[]) {
  return opportunities.map((opportunity, index) => ({
    ...opportunity,
    rank: index + 1,
  }));
}

function sortByOpportunityScore(left: EnrichedOpportunity, right: EnrichedOpportunity) {
  if (right.score !== left.score) {
    return right.score - left.score;
  }

  if (right.annualCostSavings !== left.annualCostSavings) {
    return right.annualCostSavings - left.annualCostSavings;
  }

  return left.name.localeCompare(right.name);
}

function applyFilters(
  opportunities: RankedOpportunity[],
  filters: DashboardFilters,
) {
  return opportunities.filter((opportunity) => {
    if (filters.team !== "all" && opportunity.team.slug !== filters.team) {
      return false;
    }

    if (
      filters.automationType !== "all" &&
      opportunity.suggestedAutomationType !== filters.automationType
    ) {
      return false;
    }

    if (filters.focus === "quick-wins" && opportunity.effortTier !== "Quick win") {
      return false;
    }

    if (
      filters.focus === "strategic-bets" &&
      opportunity.effortTier !== "Strategic bet"
    ) {
      return false;
    }

    return true;
  });
}

export async function getDashboardData(filters: DashboardFilters) {
  const rows = await prisma.opportunity.findMany({
    include: { team: true },
    orderBy: { name: "asc" },
  });

  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });

  const rankedAll = rankOpportunities(
    rows
      .map((row) => enrichOpportunity(row))
      .sort(sortByOpportunityScore),
  );

  const opportunities = applyFilters(rankedAll, filters);

  return {
    opportunities,
    topCandidates: opportunities.slice(0, 3),
    filterOptions: {
      teams,
      automationTypes: Object.values(AutomationType),
    },
    stats: {
      totalCategories: rankedAll.length,
      visibleCategories: opportunities.length,
      totalMonthlyHoursSaved: opportunities.reduce(
        (total, opportunity) => total + opportunity.monthlyHoursSaved,
        0,
      ),
      totalAnnualCostSavings: opportunities.reduce(
        (total, opportunity) => total + opportunity.annualCostSavings,
        0,
      ),
      quickWinCount: opportunities.filter(
        (opportunity) => opportunity.effortTier === "Quick win",
      ).length,
      strategicBetCount: opportunities.filter(
        (opportunity) => opportunity.effortTier === "Strategic bet",
      ).length,
      baselineHours: opportunities.reduce(
        (total, opportunity) => total + opportunity.laborHoursPerMonth,
        0,
      ),
      averageScore:
        opportunities.length > 0
          ? opportunities.reduce((total, opportunity) => total + opportunity.score, 0) /
            opportunities.length
          : 0,
    },
    charts: {
      savingsByOpportunity: opportunities
        .slice(0, 6)
        .map((opportunity) => ({
          name: opportunity.name,
          annualCostSavings: opportunity.annualCostSavings,
          monthlyHoursSaved: opportunity.monthlyHoursSaved,
        })),
      valueVsEffort: opportunities.map((opportunity) => ({
        name: opportunity.name,
        slug: opportunity.slug,
        score: opportunity.score,
        implementationDifficulty: opportunity.implementationDifficultyScore,
        monthlyHoursSaved: opportunity.monthlyHoursSaved,
        effortTier: opportunity.effortTier,
      })),
    },
  };
}

export async function getOpportunityDetail(slug: string) {
  const rows = await prisma.opportunity.findMany({
    include: { team: true },
    orderBy: { name: "asc" },
  });

  const rankedAll = rankOpportunities(
    rows
      .map((row) => enrichOpportunity(row))
      .sort(sortByOpportunityScore),
  );

  const opportunity = rankedAll.find((item) => item.slug === slug);

  if (!opportunity) {
    return null;
  }

  return {
    opportunity,
    totalCount: rankedAll.length,
    neighboring: {
      higher:
        rankedAll.find((item) => item.rank === opportunity.rank - 1) ?? null,
      lower:
        rankedAll.find((item) => item.rank === opportunity.rank + 1) ?? null,
    },
  };
}
```

**Step 6: Update all components that reference `opportunity.team` (was enum, now relation)**

Components currently call `getTeamLabel(opportunity.team)` which expects a Team enum. Now `opportunity.team` is a Team object with `.name`. Update all references:

In `src/components/dashboard/filters.tsx`:
- Remove `Team` import from `@/generated/prisma/enums`
- Remove `getTeamLabel` import
- Change the `teams` prop type from `Team[]` to `{ id: string; slug: string; name: string }[]`
- Update team options to use `team.slug` as value and `team.name` as label
- Update filter value to use slug

In `src/components/dashboard/opportunity-table.tsx`:
- Replace `getTeamLabel(opportunity.team)` with `opportunity.team.name`

In `src/components/dashboard/top-candidates.tsx`:
- Replace `getTeamLabel(opportunity.team)` with `opportunity.team.name`

In `src/app/opportunities/[slug]/page.tsx`:
- Replace `getTeamLabel(opportunity.team)` with `opportunity.team.name`
- Remove the `getTeamLabel` import

In `src/app/page.tsx`:
- No direct team label references, but verify the filter data passes correctly

**Step 7: Push schema, regenerate, seed, and verify**

Run:
```bash
npx prisma generate && npx prisma db push --force-reset && npx prisma db seed
```
Expected: Schema pushed, 9 teams and 13 opportunities seeded.

**Step 8: Run dev server and verify**

Run:
```bash
npm run dev
```
Expected: Dashboard loads with all opportunities, filters work, detail pages work.

**Step 9: Commit**

```bash
git add -A
git commit -m "feat: add Team table with FK relation, add source and aiAnalysis fields"
```

---

## Phase 2: Testing Infrastructure

### Task 3: Set up Vitest and write scoring engine tests

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/lib/__tests__/scoring.test.ts`
- Create: `src/lib/__tests__/formatters.test.ts`

**Step 1: Install Vitest**

Run:
```bash
npm install -D vitest @vitejs/plugin-react
```

**Step 2: Create vitest.config.ts**

```typescript
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/__tests__/**/*.test.ts", "src/**/__tests__/**/*.test.tsx"],
  },
});
```

**Step 3: Add test script to package.json**

Add to `scripts`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 4: Write scoring engine unit tests**

Create `src/lib/__tests__/scoring.test.ts`:

```typescript
import { describe, expect, it } from "vitest";

import {
  enrichOpportunity,
  HOURLY_RATE_USD,
  SCORE_WEIGHTS,
} from "@/lib/scoring";

function makeOpportunity(overrides = {}) {
  return {
    id: "test-id",
    slug: "test-opportunity",
    name: "Test Opportunity",
    teamId: "team-id",
    team: { id: "team-id", slug: "service-desk", name: "Service Desk", description: "", createdAt: new Date(), updatedAt: new Date() },
    monthlyVolume: 200,
    avgHandleTimeMinutes: 20,
    repeatabilityScore: 3,
    standardizationScore: 3,
    approvalComplexityScore: 3,
    reworkRateScore: 3,
    slaRiskScore: 3,
    customerImpactScore: 3,
    implementationDifficultyScore: 3,
    suggestedAutomationType: "SELF_SERVICE_WORKFLOW" as const,
    summary: "Test summary",
    suggestedApproach: "Test approach",
    implementationConsiderations: "Test considerations",
    riskNotes: "Test risks",
    recommendedNextStep: "Test next step",
    source: "SEED" as const,
    aiAnalysis: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("SCORE_WEIGHTS", () => {
  it("weights sum to 1.0", () => {
    const total = Object.values(SCORE_WEIGHTS).reduce((sum, w) => sum + w, 0);
    expect(total).toBeCloseTo(1.0, 10);
  });
});

describe("enrichOpportunity", () => {
  it("returns a score between 0 and 100", () => {
    const result = enrichOpportunity(makeOpportunity());
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("calculates annual cost savings from hours and hourly rate", () => {
    const result = enrichOpportunity(makeOpportunity());
    const expectedAnnual = result.monthlyHoursSaved * 12;
    expect(result.annualHoursSaved).toBeCloseTo(expectedAnnual, 1);
    expect(result.annualCostSavings).toBe(
      Math.round(result.annualHoursSaved * HOURLY_RATE_USD),
    );
  });

  it("produces higher score for high-volume high-repeatability", () => {
    const high = enrichOpportunity(
      makeOpportunity({
        monthlyVolume: 800,
        repeatabilityScore: 5,
        standardizationScore: 5,
        implementationDifficultyScore: 1,
      }),
    );
    const low = enrichOpportunity(
      makeOpportunity({
        monthlyVolume: 10,
        repeatabilityScore: 1,
        standardizationScore: 1,
        implementationDifficultyScore: 5,
      }),
    );
    expect(high.score).toBeGreaterThan(low.score);
  });

  it("assigns Quick win for low difficulty and low approval", () => {
    const result = enrichOpportunity(
      makeOpportunity({
        implementationDifficultyScore: 1,
        approvalComplexityScore: 1,
      }),
    );
    expect(result.effortTier).toBe("Quick win");
  });

  it("assigns Strategic bet for high difficulty", () => {
    const result = enrichOpportunity(
      makeOpportunity({
        implementationDifficultyScore: 5,
      }),
    );
    expect(result.effortTier).toBe("Strategic bet");
  });

  it("assigns Automate now for score >= 70", () => {
    const result = enrichOpportunity(
      makeOpportunity({
        monthlyVolume: 800,
        avgHandleTimeMinutes: 60,
        repeatabilityScore: 5,
        standardizationScore: 5,
        reworkRateScore: 5,
        slaRiskScore: 5,
        customerImpactScore: 5,
        implementationDifficultyScore: 1,
        approvalComplexityScore: 1,
      }),
    );
    expect(result.valueBand).toBe("Automate now");
  });

  it("returns 9 score breakdown entries", () => {
    const result = enrichOpportunity(makeOpportunity());
    expect(result.scoreBreakdown).toHaveLength(9);
  });

  it("breakdown contributions sum to the composite score", () => {
    const result = enrichOpportunity(makeOpportunity());
    const summed = result.scoreBreakdown.reduce(
      (total, entry) => total + entry.contribution,
      0,
    );
    expect(summed).toBeCloseTo(result.score, 0);
  });

  it("clamps automation rate between 0.25 and 0.85", () => {
    const result = enrichOpportunity(makeOpportunity());
    expect(result.estimatedAutomationRate).toBeGreaterThanOrEqual(0.25);
    expect(result.estimatedAutomationRate).toBeLessThanOrEqual(0.85);
  });

  it("generates a whyNow narrative string", () => {
    const result = enrichOpportunity(makeOpportunity());
    expect(result.whyNow).toMatch(/^This opportunity ranks well because/);
  });
});
```

**Step 5: Write formatter unit tests**

Create `src/lib/__tests__/formatters.test.ts`:

```typescript
import { describe, expect, it } from "vitest";

import {
  compactCurrencyFormatter,
  currencyFormatter,
  formatHours,
  formatPercent,
  formatScore,
} from "@/lib/formatters";

describe("formatHours", () => {
  it("shows one decimal for hours under 100", () => {
    expect(formatHours(42.5)).toBe("42.5h");
  });

  it("rounds to integer for hours >= 100", () => {
    expect(formatHours(123.7)).toBe("124h");
  });
});

describe("formatPercent", () => {
  it("converts decimal to percentage", () => {
    expect(formatPercent(0.85)).toBe("85%");
  });

  it("rounds to nearest integer", () => {
    expect(formatPercent(0.666)).toBe("67%");
  });
});

describe("formatScore", () => {
  it("shows one decimal place", () => {
    expect(formatScore(78.34)).toBe("78.3");
  });
});

describe("currencyFormatter", () => {
  it("formats as USD with no decimals", () => {
    const result = currencyFormatter.format(1234);
    expect(result).toContain("1,234");
  });
});

describe("compactCurrencyFormatter", () => {
  it("uses compact notation for large values", () => {
    const result = compactCurrencyFormatter.format(45000);
    expect(result).toContain("45");
    expect(result).toContain("K");
  });
});
```

**Step 6: Run tests to verify they pass**

Run:
```bash
npx vitest run
```
Expected: All tests pass.

**Step 7: Commit**

```bash
git add vitest.config.ts src/lib/__tests__ package.json package-lock.json
git commit -m "feat: add Vitest with scoring engine and formatter tests"
```

---

## Phase 3: API Layer

### Task 4: Create opportunity CRUD API routes

**Files:**
- Create: `src/app/api/opportunities/route.ts`
- Create: `src/app/api/opportunities/[slug]/route.ts`

**Step 1: Create GET + POST /api/opportunities**

Create `src/app/api/opportunities/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

import { AutomationType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { enrichOpportunity } from "@/lib/scoring";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const team = searchParams.get("team");
  const automationType = searchParams.get("automationType");

  const where: Record<string, unknown> = {};
  if (team) where.team = { slug: team };
  if (automationType) where.suggestedAutomationType = automationType;

  const rows = await prisma.opportunity.findMany({
    where,
    include: { team: true },
    orderBy: { name: "asc" },
  });

  const enriched = rows
    .map((row) => enrichOpportunity(row))
    .sort((a, b) => b.score - a.score)
    .map((opp, index) => ({ ...opp, rank: index + 1 }));

  return NextResponse.json(enriched);
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const validAutomationTypes = new Set(Object.values(AutomationType));

export async function POST(request: NextRequest) {
  const body = await request.json();

  const required = [
    "name", "teamId", "monthlyVolume", "avgHandleTimeMinutes",
    "repeatabilityScore", "standardizationScore", "approvalComplexityScore",
    "reworkRateScore", "slaRiskScore", "customerImpactScore",
    "implementationDifficultyScore", "suggestedAutomationType",
    "summary", "suggestedApproach", "implementationConsiderations",
    "riskNotes", "recommendedNextStep",
  ];

  const missing = required.filter((field) => body[field] === undefined || body[field] === "");
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 },
    );
  }

  if (!validAutomationTypes.has(body.suggestedAutomationType)) {
    return NextResponse.json(
      { error: `Invalid automation type: ${body.suggestedAutomationType}` },
      { status: 400 },
    );
  }

  const scoreFields = [
    "repeatabilityScore", "standardizationScore", "approvalComplexityScore",
    "reworkRateScore", "slaRiskScore", "customerImpactScore", "implementationDifficultyScore",
  ];
  for (const field of scoreFields) {
    const val = Number(body[field]);
    if (!Number.isInteger(val) || val < 1 || val > 5) {
      return NextResponse.json(
        { error: `${field} must be an integer between 1 and 5` },
        { status: 400 },
      );
    }
  }

  const slug = slugify(body.name);
  const existing = await prisma.opportunity.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: `An opportunity with slug "${slug}" already exists` },
      { status: 409 },
    );
  }

  const opportunity = await prisma.opportunity.create({
    data: {
      slug,
      name: body.name,
      teamId: body.teamId,
      monthlyVolume: Number(body.monthlyVolume),
      avgHandleTimeMinutes: Number(body.avgHandleTimeMinutes),
      repeatabilityScore: Number(body.repeatabilityScore),
      standardizationScore: Number(body.standardizationScore),
      approvalComplexityScore: Number(body.approvalComplexityScore),
      reworkRateScore: Number(body.reworkRateScore),
      slaRiskScore: Number(body.slaRiskScore),
      customerImpactScore: Number(body.customerImpactScore),
      implementationDifficultyScore: Number(body.implementationDifficultyScore),
      suggestedAutomationType: body.suggestedAutomationType,
      summary: body.summary,
      suggestedApproach: body.suggestedApproach,
      implementationConsiderations: body.implementationConsiderations,
      riskNotes: body.riskNotes,
      recommendedNextStep: body.recommendedNextStep,
      source: body.source ?? "MANUAL",
    },
    include: { team: true },
  });

  return NextResponse.json(opportunity, { status: 201 });
}
```

**Step 2: Create GET /api/opportunities/[slug]**

Create `src/app/api/opportunities/[slug]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { enrichOpportunity } from "@/lib/scoring";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;

  const opportunity = await prisma.opportunity.findUnique({
    where: { slug },
    include: { team: true },
  });

  if (!opportunity) {
    return NextResponse.json(
      { error: "Opportunity not found" },
      { status: 404 },
    );
  }

  const enriched = enrichOpportunity(opportunity);
  return NextResponse.json(enriched);
}
```

**Step 3: Verify routes work**

Run:
```bash
npm run dev
```
Then test with curl:
```bash
curl http://localhost:3000/api/opportunities | head -c 200
curl http://localhost:3000/api/opportunities/password-reset | head -c 200
```
Expected: JSON responses with opportunity data.

**Step 4: Commit**

```bash
git add src/app/api/opportunities
git commit -m "feat: add opportunity CRUD API routes"
```

---

## Phase 4: AI Integration

### Task 5: Create LLM abstraction layer

**Files:**
- Modify: `package.json`
- Create: `src/lib/llm.ts`

**Step 1: Install AI SDKs**

Run:
```bash
npm install @anthropic-ai/sdk openai
```

**Step 2: Create LLM abstraction**

Create `src/lib/llm.ts`:

```typescript
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export type LLMProvider = "anthropic" | "openai";

type LLMRequest = {
  provider: LLMProvider;
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
};

type LLMResponse = {
  content: string;
  provider: LLMProvider;
  model: string;
};

async function callAnthropic(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
): Promise<LLMResponse> {
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content in Anthropic response");
  }

  return {
    content: textBlock.text,
    provider: "anthropic",
    model: response.model,
  };
}

async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
): Promise<LLMResponse> {
  const client = new OpenAI({ apiKey });

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content in OpenAI response");
  }

  return {
    content,
    provider: "openai",
    model: response.model,
  };
}

export async function callLLM(request: LLMRequest): Promise<LLMResponse> {
  const maxTokens = request.maxTokens ?? 2048;

  if (request.provider === "anthropic") {
    return callAnthropic(request.apiKey, request.systemPrompt, request.userPrompt, maxTokens);
  }

  return callOpenAI(request.apiKey, request.systemPrompt, request.userPrompt, maxTokens);
}

export function extractApiCredentials(headers: Headers): {
  provider: LLMProvider;
  apiKey: string;
} {
  const apiKey = headers.get("x-api-key");
  const provider = headers.get("x-ai-provider") as LLMProvider | null;

  if (!apiKey) {
    throw new Error("Missing x-api-key header");
  }

  if (!provider || !["anthropic", "openai"].includes(provider)) {
    throw new Error("Missing or invalid x-ai-provider header (must be 'anthropic' or 'openai')");
  }

  return { provider, apiKey };
}
```

**Step 3: Commit**

```bash
git add src/lib/llm.ts package.json package-lock.json
git commit -m "feat: add LLM abstraction layer with Anthropic and OpenAI support"
```

---

### Task 6: Create AI API routes

**Files:**
- Create: `src/lib/ai-prompts.ts`
- Create: `src/app/api/ai/analyze-process/route.ts`
- Create: `src/app/api/ai/implementation-plan/route.ts`
- Create: `src/app/api/ai/portfolio-summary/route.ts`

**Step 1: Create shared AI prompts**

Create `src/lib/ai-prompts.ts`:

```typescript
export const ANALYZE_PROCESS_SYSTEM_PROMPT = `You are an automation opportunity analyst. Given a description of a recurring operational process, extract structured data for scoring.

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "name": "short descriptive name for the process",
  "monthlyVolume": <integer>,
  "avgHandleTimeMinutes": <integer>,
  "repeatabilityScore": <1-5>,
  "standardizationScore": <1-5>,
  "approvalComplexityScore": <1-5>,
  "reworkRateScore": <1-5>,
  "slaRiskScore": <1-5>,
  "customerImpactScore": <1-5>,
  "implementationDifficultyScore": <1-5>,
  "suggestedAutomationType": "<one of: SELF_SERVICE_WORKFLOW, API_WORKFLOW, APPROVAL_GATED_PROVISIONING, AI_ASSISTED_TRIAGE, SCHEDULED_FOLLOW_UP, SYSTEM_INTEGRATION>",
  "summary": "2-3 sentence summary of the process and why it's a good automation candidate",
  "suggestedApproach": "1-2 sentences describing the recommended automation approach",
  "implementationConsiderations": "key things to watch for during implementation",
  "riskNotes": "main risks or edge cases",
  "recommendedNextStep": "concrete next action to take"
}

Scoring guide for 1-5 fields:
- 1 = very low (rarely repeatable, highly variable, very easy to implement, minimal risk)
- 3 = moderate
- 5 = very high (extremely repeatable, fully standardized, very difficult to implement, critical SLA risk)

For volume and time, make reasonable estimates if not explicitly stated. Prefer conservative estimates.`;

export const IMPLEMENTATION_PLAN_SYSTEM_PROMPT = `You are an automation implementation architect. Given an automation opportunity with its scoring data, generate a structured implementation plan.

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "phases": [
    {
      "name": "phase name",
      "duration": "estimated duration (e.g., '1-2 weeks')",
      "tasks": ["task 1", "task 2"],
      "deliverables": ["deliverable 1"]
    }
  ],
  "toolsAndPlatforms": ["tool or platform 1", "tool or platform 2"],
  "estimatedTotalEffort": "total estimated effort (e.g., '4-6 weeks')",
  "risks": [
    {
      "risk": "description of risk",
      "mitigation": "how to mitigate"
    }
  ],
  "successMetrics": ["metric 1", "metric 2"],
  "quickWins": ["immediate improvement 1"]
}

Be specific and practical. Reference concrete tools and platforms where appropriate. Tailor the plan to the automation type and the team's domain.`;

export const PORTFOLIO_SUMMARY_SYSTEM_PROMPT = `You are a strategic automation advisor. Given a portfolio of scored automation opportunities, provide high-level insights and recommendations.

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "topRecommendations": [
    {
      "title": "recommendation title",
      "rationale": "why this matters",
      "opportunities": ["relevant opportunity names"]
    }
  ],
  "patterns": [
    {
      "pattern": "pattern name",
      "description": "what you observed across the portfolio"
    }
  ],
  "suggestedRoadmap": [
    {
      "phase": "Phase 1: Quick Wins",
      "timeframe": "0-4 weeks",
      "items": ["opportunity names to tackle"],
      "rationale": "why this order"
    }
  ],
  "portfolioHealth": {
    "overallReadiness": "High/Medium/Low",
    "summary": "2-3 sentence assessment of the portfolio's automation readiness",
    "biggestGap": "the most important thing missing or needing attention"
  }
}

Be strategic and actionable. Focus on patterns across the portfolio, not individual opportunity details.`;
```

**Step 2: Create analyze-process route**

Create `src/app/api/ai/analyze-process/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

import { ANALYZE_PROCESS_SYSTEM_PROMPT } from "@/lib/ai-prompts";
import { callLLM, extractApiCredentials } from "@/lib/llm";

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey } = extractApiCredentials(request.headers);
    const { description } = await request.json();

    if (!description || typeof description !== "string" || description.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide a process description of at least 20 characters" },
        { status: 400 },
      );
    }

    const response = await callLLM({
      provider,
      apiKey,
      systemPrompt: ANALYZE_PROCESS_SYSTEM_PROMPT,
      userPrompt: description.trim(),
      maxTokens: 1500,
    });

    const parsed = JSON.parse(response.content);

    return NextResponse.json({
      analysis: parsed,
      meta: { provider: response.provider, model: response.model },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI analysis failed";

    if (message.includes("x-api-key") || message.includes("x-ai-provider")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

**Step 3: Create implementation-plan route**

Create `src/app/api/ai/implementation-plan/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { IMPLEMENTATION_PLAN_SYSTEM_PROMPT } from "@/lib/ai-prompts";
import { callLLM, extractApiCredentials } from "@/lib/llm";
import { enrichOpportunity } from "@/lib/scoring";
import { getAutomationTypeLabel } from "@/lib/metadata";

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey } = extractApiCredentials(request.headers);
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const opportunity = await prisma.opportunity.findUnique({
      where: { slug },
      include: { team: true },
    });

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    const enriched = enrichOpportunity(opportunity);

    const userPrompt = `Generate an implementation plan for this automation opportunity:

Name: ${enriched.name}
Team: ${enriched.team.name}
Automation Type: ${getAutomationTypeLabel(enriched.suggestedAutomationType)}
Monthly Volume: ${enriched.monthlyVolume} requests
Average Handle Time: ${enriched.avgHandleTimeMinutes} minutes
Opportunity Score: ${enriched.score}/100
Effort Tier: ${enriched.effortTier}
Estimated Automation Rate: ${Math.round(enriched.estimatedAutomationRate * 100)}%
Annual Cost Savings Potential: $${enriched.annualCostSavings}

Scoring Factors:
- Repeatability: ${enriched.repeatabilityScore}/5
- Standardization: ${enriched.standardizationScore}/5
- Approval Complexity: ${enriched.approvalComplexityScore}/5
- Rework Rate: ${enriched.reworkRateScore}/5
- SLA Risk: ${enriched.slaRiskScore}/5
- Customer Impact: ${enriched.customerImpactScore}/5
- Implementation Difficulty: ${enriched.implementationDifficultyScore}/5

Summary: ${enriched.summary}
Suggested Approach: ${enriched.suggestedApproach}
Implementation Considerations: ${enriched.implementationConsiderations}
Risk Notes: ${enriched.riskNotes}`;

    const response = await callLLM({
      provider,
      apiKey,
      systemPrompt: IMPLEMENTATION_PLAN_SYSTEM_PROMPT,
      userPrompt,
      maxTokens: 2500,
    });

    const parsed = JSON.parse(response.content);

    // Cache the result
    await prisma.opportunity.update({
      where: { slug },
      data: { aiAnalysis: JSON.stringify(parsed) },
    });

    return NextResponse.json({
      plan: parsed,
      meta: { provider: response.provider, model: response.model },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI plan generation failed";

    if (message.includes("x-api-key") || message.includes("x-ai-provider")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

**Step 4: Create portfolio-summary route**

Create `src/app/api/ai/portfolio-summary/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { PORTFOLIO_SUMMARY_SYSTEM_PROMPT } from "@/lib/ai-prompts";
import { callLLM, extractApiCredentials } from "@/lib/llm";
import { enrichOpportunity } from "@/lib/scoring";
import { getAutomationTypeLabel } from "@/lib/metadata";

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey } = extractApiCredentials(request.headers);

    const rows = await prisma.opportunity.findMany({
      include: { team: true },
      orderBy: { name: "asc" },
    });

    const enriched = rows
      .map((row) => enrichOpportunity(row))
      .sort((a, b) => b.score - a.score)
      .map((opp, index) => ({ ...opp, rank: index + 1 }));

    const portfolioSummary = enriched
      .map(
        (opp) =>
          `#${opp.rank} ${opp.name} (${opp.team.name}) - Score: ${opp.score}, Type: ${getAutomationTypeLabel(opp.suggestedAutomationType)}, Effort: ${opp.effortTier}, Annual Savings: $${opp.annualCostSavings}, Monthly Hours: ${opp.monthlyHoursSaved}h`,
      )
      .join("\n");

    const totalSavings = enriched.reduce((sum, opp) => sum + opp.annualCostSavings, 0);
    const totalHours = enriched.reduce((sum, opp) => sum + opp.monthlyHoursSaved, 0);

    const userPrompt = `Analyze this automation opportunity portfolio and provide strategic recommendations:

Portfolio Overview:
- Total opportunities: ${enriched.length}
- Total annual savings potential: $${totalSavings}
- Total monthly hours recoverable: ${totalHours.toFixed(1)}h
- Quick wins: ${enriched.filter((o) => o.effortTier === "Quick win").length}
- Foundation builds: ${enriched.filter((o) => o.effortTier === "Foundation build").length}
- Strategic bets: ${enriched.filter((o) => o.effortTier === "Strategic bet").length}

Ranked Opportunities:
${portfolioSummary}`;

    const response = await callLLM({
      provider,
      apiKey,
      systemPrompt: PORTFOLIO_SUMMARY_SYSTEM_PROMPT,
      userPrompt,
      maxTokens: 3000,
    });

    const parsed = JSON.parse(response.content);

    return NextResponse.json({
      summary: parsed,
      meta: { provider: response.provider, model: response.model },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI summary generation failed";

    if (message.includes("x-api-key") || message.includes("x-ai-provider")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

**Step 5: Commit**

```bash
git add src/lib/ai-prompts.ts src/app/api/ai
git commit -m "feat: add AI API routes for process analysis, implementation plans, and portfolio summary"
```

---

### Task 7: Write API integration tests with mocked LLM

**Files:**
- Create: `src/lib/__tests__/llm.test.ts`
- Create: `src/lib/__tests__/api-helpers.test.ts`

**Step 1: Write LLM abstraction tests**

Create `src/lib/__tests__/llm.test.ts`:

```typescript
import { describe, expect, it } from "vitest";

import { extractApiCredentials } from "@/lib/llm";

describe("extractApiCredentials", () => {
  it("extracts valid anthropic credentials", () => {
    const headers = new Headers({
      "x-api-key": "sk-ant-test",
      "x-ai-provider": "anthropic",
    });
    const result = extractApiCredentials(headers);
    expect(result).toEqual({ provider: "anthropic", apiKey: "sk-ant-test" });
  });

  it("extracts valid openai credentials", () => {
    const headers = new Headers({
      "x-api-key": "sk-openai-test",
      "x-ai-provider": "openai",
    });
    const result = extractApiCredentials(headers);
    expect(result).toEqual({ provider: "openai", apiKey: "sk-openai-test" });
  });

  it("throws when api key is missing", () => {
    const headers = new Headers({ "x-ai-provider": "anthropic" });
    expect(() => extractApiCredentials(headers)).toThrow("x-api-key");
  });

  it("throws when provider is missing", () => {
    const headers = new Headers({ "x-api-key": "sk-test" });
    expect(() => extractApiCredentials(headers)).toThrow("x-ai-provider");
  });

  it("throws when provider is invalid", () => {
    const headers = new Headers({
      "x-api-key": "sk-test",
      "x-ai-provider": "google",
    });
    expect(() => extractApiCredentials(headers)).toThrow("x-ai-provider");
  });
});
```

**Step 2: Run tests**

Run:
```bash
npx vitest run
```
Expected: All tests pass.

**Step 3: Commit**

```bash
git add src/lib/__tests__/llm.test.ts
git commit -m "test: add LLM credential extraction tests"
```

---

## Phase 5: Frontend - AI Features

### Task 8: Create ApiKeyProvider and Settings Modal

**Files:**
- Create: `src/components/providers/api-key-provider.tsx`
- Create: `src/components/ui/settings-modal.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/ui/app-shell.tsx`

**Step 1: Create the API key context provider**

Create `src/components/providers/api-key-provider.tsx`:

```typescript
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { LLMProvider } from "@/lib/llm";

type ApiKeyState = {
  anthropicKey: string;
  openaiKey: string;
  provider: LLMProvider;
  isConfigured: boolean;
  activeKey: string;
  setAnthropicKey: (key: string) => void;
  setOpenaiKey: (key: string) => void;
  setProvider: (provider: LLMProvider) => void;
};

const ApiKeyContext = createContext<ApiKeyState | null>(null);

export function useApiKeys() {
  const context = useContext(ApiKeyContext);
  if (!context) {
    throw new Error("useApiKeys must be used within ApiKeyProvider");
  }
  return context;
}

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [anthropicKey, setAnthropicKeyState] = useState("");
  const [openaiKey, setOpenaiKeyState] = useState("");
  const [provider, setProviderState] = useState<LLMProvider>("anthropic");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setAnthropicKeyState(localStorage.getItem("anthropic-api-key") ?? "");
    setOpenaiKeyState(localStorage.getItem("openai-api-key") ?? "");
    const saved = localStorage.getItem("ai-provider");
    if (saved === "anthropic" || saved === "openai") {
      setProviderState(saved);
    }
    setMounted(true);
  }, []);

  const setAnthropicKey = useCallback((key: string) => {
    setAnthropicKeyState(key);
    localStorage.setItem("anthropic-api-key", key);
  }, []);

  const setOpenaiKey = useCallback((key: string) => {
    setOpenaiKeyState(key);
    localStorage.setItem("openai-api-key", key);
  }, []);

  const setProvider = useCallback((p: LLMProvider) => {
    setProviderState(p);
    localStorage.setItem("ai-provider", p);
  }, []);

  const activeKey = provider === "anthropic" ? anthropicKey : openaiKey;
  const isConfigured = mounted && activeKey.length > 0;

  return (
    <ApiKeyContext value={{
      anthropicKey,
      openaiKey,
      provider,
      isConfigured,
      activeKey,
      setAnthropicKey,
      setOpenaiKey,
      setProvider,
    }}>
      {children}
    </ApiKeyContext>
  );
}
```

**Step 2: Create the Settings Modal**

Create `src/components/ui/settings-modal.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Settings, X, Check, AlertCircle } from "lucide-react";

import { useApiKeys } from "@/components/providers/api-key-provider";
import type { LLMProvider } from "@/lib/llm";

export function SettingsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testError, setTestError] = useState("");
  const keys = useApiKeys();

  async function testConnection() {
    if (!keys.activeKey) return;

    setTestStatus("testing");
    setTestError("");

    try {
      const response = await fetch("/api/ai/analyze-process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": keys.activeKey,
          "x-ai-provider": keys.provider,
        },
        body: JSON.stringify({
          description: "Test connection: simple password reset process, 100 requests per month, 5 minutes each, highly repetitive.",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Connection test failed");
      }

      setTestStatus("success");
    } catch (error) {
      setTestStatus("error");
      setTestError(error instanceof Error ? error.message : "Connection failed");
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-line/70 bg-surface px-3 py-1.5 text-xs text-muted-foreground transition hover:border-accent/30 hover:text-foreground"
      >
        <Settings className="h-3.5 w-3.5" />
        AI Settings
      </button>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-lg rounded-card border border-line/80 bg-surface p-6 shadow-[0_40px_100px_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-foreground">AI Settings</h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 text-muted-foreground transition hover:bg-surface-subtle hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Configure your API keys to enable AI-powered features. Keys are stored in your browser only.
        </p>

        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Provider
            </span>
            <select
              className="mt-2 w-full min-h-11 rounded-2xl border border-line bg-background px-4 py-3 text-sm font-medium text-foreground outline-none transition focus:border-accent"
              value={keys.provider}
              onChange={(e) => keys.setProvider(e.target.value as LLMProvider)}
            >
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="openai">OpenAI (GPT-4o)</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Anthropic API Key
            </span>
            <input
              type="password"
              className="mt-2 w-full min-h-11 rounded-2xl border border-line bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent"
              placeholder="sk-ant-..."
              value={keys.anthropicKey}
              onChange={(e) => keys.setAnthropicKey(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              OpenAI API Key
            </span>
            <input
              type="password"
              className="mt-2 w-full min-h-11 rounded-2xl border border-line bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent"
              placeholder="sk-..."
              value={keys.openaiKey}
              onChange={(e) => keys.setOpenaiKey(e.target.value)}
            />
          </label>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={testConnection}
              disabled={!keys.isConfigured || testStatus === "testing"}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background transition hover:bg-accent-strong disabled:opacity-50"
            >
              {testStatus === "testing" ? "Testing..." : "Test Connection"}
            </button>

            {testStatus === "success" && (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <Check className="h-4 w-4" />
                Connected
              </span>
            )}

            {testStatus === "error" && (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-600">
                <AlertCircle className="h-4 w-4" />
                {testError}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
```

**Step 3: Update layout.tsx to wrap with ApiKeyProvider**

In `src/app/layout.tsx`, wrap children with the provider:

```typescript
import type { Metadata } from "next";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";

import { ApiKeyProvider } from "@/components/providers/api-key-provider";

import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Automation Opportunity Scorer",
    template: "%s | Automation Opportunity Scorer",
  },
  description:
    "AI-powered tool that ranks operational automation opportunities by business value and implementation fit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexSans.variable} ${spaceGrotesk.variable} bg-background font-sans text-foreground antialiased`}
      >
        <ApiKeyProvider>
          {children}
        </ApiKeyProvider>
      </body>
    </html>
  );
}
```

**Step 4: Update AppShell header with Settings button and New Opportunity link**

In `src/components/ui/app-shell.tsx`, add the SettingsModal to the header and make it a client component wrapper:

The AppShell needs to stay server-compatible for the children, but the header needs client interactivity. Create a separate client header component or use the SettingsModal inline. The simplest approach: keep AppShell as-is but replace the static badge area with a client component.

Update `src/components/ui/app-shell.tsx`:

```typescript
import type { ReactNode } from "react";
import Link from "next/link";

import { AppShellHeader } from "@/components/ui/app-shell-header";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <AppShellHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {children}
      </main>

      <footer className="border-t border-line/70 bg-surface/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>
            Built to answer one decision-support question well: what should we
            automate next?
          </p>
          <p>
            AI-powered analysis with transparent deterministic scoring.
          </p>
        </div>
      </footer>
    </div>
  );
}
```

Create `src/components/ui/app-shell-header.tsx`:

```typescript
"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { SettingsModal } from "@/components/ui/settings-modal";

export function AppShellHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-sm font-bold text-background shadow-[0_12px_30px_rgba(19,31,28,0.12)]">
            AO
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Automation opportunity scorer
            </p>
            <p className="font-display text-lg font-semibold text-foreground">
              AI-powered prioritization cockpit
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/opportunities/new"
            className="inline-flex items-center gap-2 rounded-full border border-line/70 bg-surface px-3 py-1.5 text-xs text-muted-foreground transition hover:border-accent/30 hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            New Opportunity
          </Link>
          <SettingsModal />
        </div>
      </div>
    </header>
  );
}
```

**Step 5: Commit**

```bash
git add src/components/providers src/components/ui/settings-modal.tsx src/components/ui/app-shell-header.tsx src/components/ui/app-shell.tsx src/app/layout.tsx
git commit -m "feat: add API key provider, settings modal, and updated header"
```

---

### Task 9: Create the New Opportunity page with AI-assisted intake

**Files:**
- Create: `src/app/opportunities/new/page.tsx`
- Create: `src/components/opportunities/opportunity-form.tsx`
- Create: `src/components/opportunities/ai-intake.tsx`

**Step 1: Create the OpportunityForm component**

This is the shared form component used by both manual entry and AI-prefilled flows. Create `src/components/opportunities/opportunity-form.tsx`. This should be a client component with controlled inputs for all Opportunity fields, team selector (fetched via API or passed as props), automation type selector, score sliders (1-5), and text areas for narrative fields. Submit calls POST /api/opportunities and redirects to the detail page on success.

**Step 2: Create the AI Intake component**

Create `src/components/opportunities/ai-intake.tsx`. This is a client component with a textarea for process description, an "Analyze with AI" button that calls POST /api/ai/analyze-process, and on success pre-fills the form.

**Step 3: Create the New Opportunity page**

Create `src/app/opportunities/new/page.tsx` with two tabs: "AI-Assisted" and "Manual Entry". Both render the same form, AI tab starts with the intake textarea.

**Step 4: Verify the flow**

Run dev server, navigate to /opportunities/new, test manual creation, test AI-assisted flow (requires API key).

**Step 5: Commit**

```bash
git add src/app/opportunities/new src/components/opportunities
git commit -m "feat: add create opportunity page with AI-assisted intake"
```

---

### Task 10: Add AI analysis to detail page and AI insights to dashboard

**Files:**
- Create: `src/components/detail/ai-implementation-plan.tsx`
- Modify: `src/app/opportunities/[slug]/page.tsx`
- Create: `src/components/dashboard/ai-insights-card.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Create AI Implementation Plan component**

Create `src/components/detail/ai-implementation-plan.tsx`. Client component that:
- Shows "Generate AI Analysis" button if no cached plan
- Shows the cached plan rendered as structured cards if `aiAnalysis` exists
- Has a "Regenerate" button
- Calls POST /api/ai/implementation-plan with the opportunity slug
- Uses useApiKeys() for credentials

**Step 2: Add AI plan section to detail page**

In `src/app/opportunities/[slug]/page.tsx`, add the `AiImplementationPlan` component after the score breakdown section. Pass `opportunity.slug` and `opportunity.aiAnalysis` as props.

**Step 3: Create AI Insights Card component**

Create `src/components/dashboard/ai-insights-card.tsx`. Client component that:
- Shows "Generate AI Insights" button (disabled with tooltip if no API key)
- Calls POST /api/ai/portfolio-summary
- Renders the response as a collapsible card with sections for recommendations, patterns, roadmap, and health

**Step 4: Add AI Insights to dashboard**

In `src/app/page.tsx`, add the `AiInsightsCard` component after the filters section.

**Step 5: Add source badge to opportunity table**

In `src/components/dashboard/opportunity-table.tsx`, add a small badge showing the opportunity source (seed/manual/ai-assisted) in each row.

**Step 6: Verify all AI features**

Run dev server, test:
- Dashboard AI insights button
- Detail page AI analysis button
- Source badges in table

**Step 7: Commit**

```bash
git add src/components/detail/ai-implementation-plan.tsx src/components/dashboard/ai-insights-card.tsx src/app/opportunities/[slug]/page.tsx src/app/page.tsx src/components/dashboard/opportunity-table.tsx
git commit -m "feat: add AI implementation plans on detail page and AI insights on dashboard"
```

---

## Phase 6: Polish Features

### Task 11: Add CSV export

**Files:**
- Create: `src/components/dashboard/csv-export-button.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Create CSV export button**

Create `src/components/dashboard/csv-export-button.tsx`. Client component that:
- Takes the opportunities array as a prop
- On click, generates a CSV string with columns: Rank, Name, Team, Score, Effort Tier, Value Band, Monthly Hours Saved, Annual Savings
- Creates a Blob, generates a download URL, and triggers download
- Filename: `automation-opportunities-YYYY-MM-DD.csv`

**Step 2: Add to dashboard**

Add the export button near the filters section in `src/app/page.tsx`.

**Step 3: Commit**

```bash
git add src/components/dashboard/csv-export-button.tsx src/app/page.tsx
git commit -m "feat: add CSV export for opportunity rankings"
```

---

### Task 12: Add dark mode

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/components/ui/theme-toggle.tsx`
- Modify: `src/components/ui/app-shell-header.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Add dark mode CSS variables**

In `src/app/globals.css`, add a `[data-theme="dark"]` block after `:root`:

```css
[data-theme="dark"] {
  --background: #0f1a17;
  --surface: #162220;
  --surface-subtle: #1c2e29;
  --foreground: #e4ebe8;
  --muted-foreground: #8fa39c;
  --line: #2a3f38;
  --accent: #2dd4a8;
  --accent-soft: #1a3d34;
  --accent-strong: #5eead4;
  --shadow-card-soft: 0 24px 56px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] body {
  background:
    radial-gradient(circle at top left, rgba(45, 212, 168, 0.08), transparent 24%),
    radial-gradient(circle at top right, rgba(94, 234, 212, 0.05), transparent 22%),
    linear-gradient(180deg, #0f1a17 0%, #111f1b 100%);
}
```

**Step 2: Create theme toggle component**

Create `src/components/ui/theme-toggle.tsx`. Client component with sun/moon icon toggle that:
- Reads initial theme from localStorage or system preference
- Sets `data-theme` attribute on `<html>` element
- Saves preference to localStorage

**Step 3: Add toggle to header**

In `src/components/ui/app-shell-header.tsx`, add the ThemeToggle next to the settings button.

**Step 4: Update layout.tsx for theme script**

Add an inline script in layout.tsx that sets the initial theme before paint to prevent flash.

**Step 5: Verify both themes**

Test all pages in both light and dark mode, check chart colors, badges, cards.

**Step 6: Commit**

```bash
git add src/app/globals.css src/components/ui/theme-toggle.tsx src/components/ui/app-shell-header.tsx src/app/layout.tsx
git commit -m "feat: add dark mode with system preference detection"
```

---

### Task 13: Add comparison view

**Files:**
- Create: `src/components/dashboard/comparison-view.tsx`
- Modify: `src/components/dashboard/opportunity-table.tsx`

**Step 1: Add selection state to opportunity table**

In `src/components/dashboard/opportunity-table.tsx`, the table is currently a server component. Convert to client component (add "use client"). Add checkbox column for selecting opportunities (max 3). Track selection state. Show "Compare (N)" button when 2+ are selected.

**Step 2: Create comparison view component**

Create `src/components/dashboard/comparison-view.tsx`. Client component that:
- Receives selected opportunities as props
- Shows side-by-side cards with all 9 scoring factors as parallel horizontal bars
- Stats comparison row: volume, hours saved, savings, effort tier, value band
- Close button to dismiss

**Step 3: Verify comparison flow**

Select 2-3 opportunities, click compare, verify the view shows correct data.

**Step 4: Commit**

```bash
git add src/components/dashboard/comparison-view.tsx src/components/dashboard/opportunity-table.tsx
git commit -m "feat: add side-by-side opportunity comparison view"
```

---

## Phase 7: DevOps

### Task 14: Add Dockerfile and docker-compose

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `.dockerignore`

**Step 1: Create .dockerignore**

```
node_modules
.next
.git
*.db
.env
docs
```

**Step 2: Create Dockerfile**

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/src/generated ./src/generated
EXPOSE 3000
CMD ["node", "server.js"]
```

**Step 3: Update next.config.ts for standalone output**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

**Step 4: Create docker-compose.yml**

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: automation_scorer
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/automation_scorer
    depends_on:
      - db

volumes:
  pgdata:
```

**Step 5: Commit**

```bash
git add Dockerfile docker-compose.yml .dockerignore next.config.ts
git commit -m "feat: add Dockerfile and docker-compose for self-hosted deployment"
```

---

### Task 15: Add GitHub Actions CI pipeline

**Files:**
- Create: `.github/workflows/ci.yml`

**Step 1: Create CI workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: automation_scorer_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    env:
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/automation_scorer_test

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Generate Prisma client
        run: npx prisma generate

      - name: Push schema to test database
        run: npx prisma db push

      - name: Lint
        run: npm run lint

      - name: Typecheck
        run: npx tsc --noEmit

      - name: Test
        run: npm test
```

**Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "feat: add GitHub Actions CI pipeline with lint, typecheck, and tests"
```

---

### Task 16: Update .env.example and .gitignore

**Files:**
- Modify: `.env.example`
- Modify: `.gitignore`

**Step 1: Update .env.example with all env vars**

```
# Database (required)
DATABASE_URL="postgresql://user:password@localhost:5432/automation_scorer?schema=public"

# AI API keys are NOT stored server-side.
# Users configure them in the browser via the Settings modal.
# No server-side AI env vars needed.
```

**Step 2: Verify .gitignore includes .env and database files**

Ensure `.gitignore` has:
```
.env
.env.local
*.db
```

**Step 3: Commit**

```bash
git add .env.example .gitignore
git commit -m "chore: update env example and gitignore"
```

---

## Phase 8: README and Final Polish

### Task 17: Overhaul README

**Files:**
- Modify: `README.md`

**Step 1: Rewrite README**

Replace the entire README with:
- Project title and one-line description
- Screenshot placeholders (to be filled after deployment)
- Tech stack badges
- Features list (scoring engine, AI intake, implementation plans, portfolio insights)
- Architecture section with Mermaid diagram
- Setup instructions (local dev with Postgres, Docker, Vercel)
- How the scoring model works (brief)
- AI features section explaining BYOK pattern
- Link to live demo (placeholder)

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: overhaul README with architecture, setup, and feature documentation"
```

---

### Task 18: Final verification

**Step 1: Run full test suite**

```bash
npx vitest run
```
Expected: All tests pass.

**Step 2: Run lint and typecheck**

```bash
npm run lint && npx tsc --noEmit
```
Expected: No errors.

**Step 3: Run dev server and smoke test**

```bash
npm run dev
```
Test:
- Dashboard loads with all opportunities
- Filters work (team, automation type, focus)
- Detail pages load with score breakdown
- /opportunities/new page loads
- Settings modal opens and saves keys
- Dark mode toggles correctly
- CSV export downloads a file
- Comparison view works with 2-3 selected
- Source badges show on table rows

**Step 4: Build production**

```bash
npm run build
```
Expected: Build completes without errors.

**Step 5: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address issues found during final verification"
```
