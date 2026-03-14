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
  { value: "foundation-builds", label: "Foundation builds" },
  { value: "strategic-bets", label: "Strategic bets" },
] as const;

export function getAutomationTypeLabel(type: AutomationType) {
  return AUTOMATION_TYPE_LABELS[type];
}
