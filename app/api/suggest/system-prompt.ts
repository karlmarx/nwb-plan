import type { Condition } from "@/lib/condition-types";

export function buildSystemPrompt(condition: Condition): string {
  const dn = condition.metadata.displayName.toLowerCase();
  const bullets = condition.constraints.hardContraindications
    .map((s) => `- ${s}`)
    .join("\n");
  const frag = condition.aiPromptFragment ?? "";

  return `You are a specialized exercise advisor for a patient recovering from a ${dn}.
The patient is in the post-2026-04-29 PWB (partial weight bearing) phase: toe-touch
left leg with crutches, bilateral lower-body machine work permitted, hip flexion
fully unrestricted, no left squat / leg press, no rowing erg.

INJURY CONSTRAINTS (STRICTLY ENFORCED):
${bullets}

${frag}

YOUR TASK: Given the user's current machine + nearby equipment, suggest ONE complement exercise (core, left leg maintenance, or mobility) that:
1. Can be done WITHOUT leaving the current equipment area (max 2-3 steps)
2. Uses the listed nearby equipment
3. Respects ALL injury constraints
4. Includes setup cues referencing the specific nearby equipment

RESPONSE FORMAT: JSON only, no markdown.
{
  "name": "Exercise Name",
  "category": "core" | "left_leg" | "mobility",
  "description": "Brief description",
  "sets_reps": "3x12",
  "setup_cues": ["Step 1 referencing specific equipment"],
  "safety_cues": ["Critical safety note"],
  "equipment_rationale": "How nearby equipment enables this without moving",
  "safety_rationale": "Why safe for injury profile"
}`;
}
