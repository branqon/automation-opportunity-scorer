import { Prisma, PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

const teams: Prisma.TeamCreateManyInput[] = [
  {
    slug: "service-desk",
    name: "Service Desk",
    description:
      "Front-line IT support handling incidents, requests, and user-facing issues.",
  },
  {
    slug: "security-ops",
    name: "Security Ops",
    description: "Identity, access, and threat response operations.",
  },
  {
    slug: "it-ops",
    name: "IT Operations",
    description: "Infrastructure, licensing, and platform management.",
  },
  {
    slug: "people-ops",
    name: "People Operations",
    description:
      "HR workflows including onboarding, offboarding, and employee lifecycle.",
  },
  {
    slug: "procurement",
    name: "Procurement",
    description: "Purchasing, vendor management, and procurement intake.",
  },
  {
    slug: "service-delivery",
    name: "Service Delivery",
    description:
      "SLA management, ticket lifecycle, and delivery coordination.",
  },
  {
    slug: "revops",
    name: "Revenue Operations",
    description: "Quote-to-cash, CRM processes, and revenue lifecycle.",
  },
  {
    slug: "application-support",
    name: "Application Support",
    description:
      "Line-of-business app triage, classification, and issue resolution.",
  },
  {
    slug: "finance-ops",
    name: "Finance Operations",
    description:
      "Approval chains, reconciliation, and financial process automation.",
  },
];

const opportunities = [
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
    summary:
      "A high-volume service desk request with a stable identity-validation path and low exception handling.",
    suggestedApproach:
      "Launch a self-service password reset flow tied to identity verification and directory API actions.",
    implementationConsiderations:
      "Validate enrollment coverage, support fallback routing for non-enrolled users, and preserve audit logging.",
    riskNotes:
      "Users without recovery factors still need an assisted path, and lockout policy changes require coordination with security.",
    recommendedNextStep:
      "Build a self-service password reset form backed by directory API actions and route non-enrolled users to human review.",
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
    summary:
      "Users are blocked from core systems until MFA is reset, but the recovery process is still mostly manual.",
    suggestedApproach:
      "Create a guided reset journey with conditional verification checks and identity-provider actions.",
    implementationConsiderations:
      "Pair step-up verification with enrollment checks and route privileged accounts through an escalated path.",
    riskNotes:
      "Security review is required for privileged users and failed verification attempts must be rate-limited and logged.",
    recommendedNextStep:
      "Implement a self-service MFA recovery workflow with identity verification, privileged-account guardrails, and audit events.",
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
    summary:
      "Onboarding spans HR, identity, device, and application setup, creating a long multi-step handoff sequence.",
    suggestedApproach:
      "Use an approval-gated provisioning flow that fans out account creation, license assignment, and checklist tasks.",
    implementationConsiderations:
      "Model dependencies between HRIS data, manager approvals, hardware availability, and application entitlements.",
    riskNotes:
      "Data quality from source systems can cause provisioning errors, and exceptions for contractors should stay human-reviewed.",
    recommendedNextStep:
      "Build an approval-gated provisioning flow that starts from the HRIS event, creates core accounts through APIs, and pauses only for exception cases.",
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
    summary:
      "Requests often start with incomplete data and then bounce through budget approval, vendor review, and order creation.",
    suggestedApproach:
      "Standardize intake with a structured request form and automate routing once required fields are present.",
    implementationConsiderations:
      "Capture cost center, vendor, urgency, and category data upfront so approvals and downstream records stay clean.",
    riskNotes:
      "Approval bottlenecks remain the main delay, and edge-case purchases still need policy review.",
    recommendedNextStep:
      "Create a self-service procurement intake form that validates required fields and triggers an approval-gated PO workflow.",
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
    summary:
      "Remote-access incidents share common failure patterns, but support still spends time gathering the same diagnostics by hand.",
    suggestedApproach:
      "Use guided triage and scripted checks to collect environment details before routing exceptions to an analyst.",
    implementationConsiderations:
      "Pull device posture, ISP, and client-version checks into a repeatable diagnostic sequence.",
    riskNotes:
      "Network edge cases remain broad, so automated recommendations should stay in a human-reviewed path when confidence is low.",
    recommendedNextStep:
      "Implement AI-assisted categorization with scripted VPN diagnostics and require human review before applying remediation outside the common cases.",
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
    summary:
      "The issue set is repetitive and usually resolved through the same spooler, driver, or queue checks.",
    suggestedApproach:
      "Offer a self-service troubleshooting guide with scripted remediation for the common recovery steps.",
    implementationConsiderations:
      "Separate branch-specific printer mappings from global steps and keep an assisted fallback for hardware faults.",
    riskNotes:
      "Device-specific problems and local network issues can still require onsite intervention.",
    recommendedNextStep:
      "Create a self-service printer diagnostics form with background scripts for spooler restarts, mapping refresh, and queue cleanup.",
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
    summary:
      "Mailbox lockouts, quota issues, and mobile profile resets repeatedly interrupt business-critical communication.",
    suggestedApproach:
      "Automate common mailbox recovery actions behind policy checks and surface a guided self-service path for users.",
    implementationConsiderations:
      "Separate resettable incidents from retention or mailbox-permission changes that still need analyst approval.",
    riskNotes:
      "Shared mailbox and delegation changes can create access risk if the workflow is too permissive.",
    recommendedNextStep:
      "Build an email-access recovery workflow that validates policy rules, executes mailbox API actions, and escalates shared-mailbox exceptions.",
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
    summary:
      "Analysts spend hours each week nudging requesters and owners on tickets that are waiting for updates.",
    suggestedApproach:
      "Schedule inactivity checks that send reminders, update ticket status, and escalate aging requests automatically.",
    implementationConsiderations:
      "Define inactivity windows, customer-friendly reminder language, and exception rules for major incidents.",
    riskNotes:
      "Over-automation can create noisy reminders if suppression logic is weak.",
    recommendedNextStep:
      "Automate inactivity follow-up using scheduled workflow logic that posts reminders, updates status, and escalates tickets that exceed response windows.",
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
    summary:
      "Sales-approved quotes are still re-entered into procurement and finance tools, creating delay and rework.",
    suggestedApproach:
      "Connect quote approval events to downstream purchasing records so teams stop rekeying the same data.",
    implementationConsiderations:
      "Map field ownership clearly across CRM, ERP, and purchasing tools before automating downstream writes.",
    riskNotes:
      "System integration errors can create financial reconciliation issues if validation is incomplete.",
    recommendedNextStep:
      "Build a CRM-to-procurement integration that triggers after quote approval, validates field completeness, and creates the downstream purchasing record automatically.",
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
    summary:
      "The same approval chain repeats across low-risk requests, but analysts still chase sign-off through email and chat.",
    suggestedApproach:
      "Centralize approval requests with conditional rules and only require manual intervention for policy exceptions.",
    implementationConsiderations:
      "Identify rule-based approvals that can be pre-approved and preserve audit-ready approval history.",
    riskNotes:
      "Policy exceptions and delegated approvers can create edge cases that need explicit governance.",
    recommendedNextStep:
      "Add an approval-gated workflow that auto-approves low-risk requests, records evidence, and routes policy exceptions to finance ops.",
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
    summary:
      "Analysts spend time checking role eligibility, applying licenses, and updating internal records for routine requests.",
    suggestedApproach:
      "Automate role-based license fulfillment with a lightweight approval gate for non-standard requests.",
    implementationConsiderations:
      "Tie the workflow to role mappings and available inventory so fulfillment logic stays consistent.",
    riskNotes:
      "Non-standard software bundles and true-up reporting still need exception handling.",
    recommendedNextStep:
      "Build an approval-gated provisioning flow that validates role eligibility, assigns licenses by API, and routes non-standard bundles for review.",
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
    summary:
      "Application incidents contain inconsistent descriptions, so triage quality varies and the wrong queue often gets the work first.",
    suggestedApproach:
      "Use AI-assisted classification to suggest queue, urgency, and knowledge-base matches before an analyst confirms routing.",
    implementationConsiderations:
      "Keep confidence thresholds visible and pair the model with deterministic routing rules for known keywords.",
    riskNotes:
      "Classification drift is a real risk, so analysts need a clear review step and feedback loop.",
    recommendedNextStep:
      "Implement AI-assisted categorization with human review for routing decisions and capture reviewer overrides to refine the prompt and rules.",
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
    summary:
      "Offboarding requires coordinated deprovisioning across multiple systems under tight timing expectations.",
    suggestedApproach:
      "Trigger deprovisioning from the source offboarding event and automate system-level access revocation in sequence.",
    implementationConsiderations:
      "Sequence identity suspension, shared asset checks, and app revocation so data retention rules are preserved.",
    riskNotes:
      "Incorrect sequencing can break legal hold or asset-recovery steps, so a small set of exceptions should stay manual.",
    recommendedNextStep:
      "Build an HR-triggered deprovisioning workflow that revokes core access by API, logs each action, and pauses for legal-hold exceptions.",
  },
];

async function main() {
  await prisma.opportunity.deleteMany();
  await prisma.team.deleteMany();

  await prisma.team.createMany({ data: teams });

  const allTeams = await prisma.team.findMany();
  const teamsBySlug = new Map(allTeams.map((team) => [team.slug, team.id]));

  for (const { teamSlug, ...rest } of opportunities) {
    const teamId = teamsBySlug.get(teamSlug);
    if (!teamId) {
      throw new Error(`Unknown team slug: ${teamSlug}`);
    }
    await prisma.opportunity.create({
      data: {
        ...rest,
        teamId,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Failed to seed opportunity data", error);
    await prisma.$disconnect();
    process.exit(1);
  });
