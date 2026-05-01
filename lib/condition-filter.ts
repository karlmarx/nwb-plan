// =============================================================================
// CONDITION FILTER
// =============================================================================
//
// Predicate for "is this exercise allowed for this condition in this phase."
// Untagged exercises default to allowed so behavior is unchanged during the
// MovementTag migration. Once exercises are tagged, the predicate becomes
// the single safety gate; today it's a forward-compatible no-op for the
// untagged majority.
// =============================================================================

import type { Condition, MovementTag } from "./condition-types";
import type { Exercise } from "./exercises";

export interface ConditionFilterResult {
  allowed: boolean;
  level: "safe" | "caution" | "danger";
  /** When `allowed: false`, the first forbidden tag that tripped the filter. */
  blockedBy?: MovementTag;
  /** Human-readable explanation. */
  rationale: string;
}

/**
 * Resolve effective tag sets for a phase by composing condition-level
 * forbidden/caution lists with phase-level unlock/restrict overrides.
 */
function resolvePhaseTags(
  condition: Condition,
  currentPhaseId: string,
): {
  forbidden: Set<MovementTag>;
  caution: Set<MovementTag>;
} {
  const phase = condition.program.phases.find((p) => p.id === currentPhaseId);
  const unlocked = new Set<MovementTag>(phase?.unlockTags ?? []);
  const restricted = new Set<MovementTag>(phase?.restrictTags ?? []);

  const forbidden = new Set<MovementTag>(
    condition.constraints.forbiddenTags.filter((t) => !unlocked.has(t)),
  );
  for (const t of restricted) forbidden.add(t);

  const caution = new Set<MovementTag>(
    condition.constraints.cautionTags.filter(
      (t) => !unlocked.has(t) && !forbidden.has(t),
    ),
  );

  return { forbidden, caution };
}

/**
 * Core predicate. Operates on a tag list so it can be reused for both
 * `Exercise.movementTags` and ad-hoc tag lists (e.g. AI-suggested exercises
 * that aren't in the global `EX` table yet).
 *
 * Untagged inputs (`exerciseTags.length === 0`) return allowed=safe with a
 * rationale that names the missing-tag default so callers can decide whether
 * to log a warning during the migration window.
 */
export function isAllowedByTags(args: {
  exerciseTags: MovementTag[];
  condition: Condition;
  currentPhaseId: string;
}): ConditionFilterResult {
  const { exerciseTags, condition, currentPhaseId } = args;

  if (exerciseTags.length === 0) {
    return {
      allowed: true,
      level: "safe",
      rationale: "exercise has no movementTags — default-allow during migration",
    };
  }

  const { forbidden, caution } = resolvePhaseTags(condition, currentPhaseId);

  for (const tag of exerciseTags) {
    if (forbidden.has(tag)) {
      return {
        allowed: false,
        level: "danger",
        blockedBy: tag,
        rationale: `Exercise demands ${tag}, which is forbidden for ${condition.metadata.displayName} in this phase.`,
      };
    }
  }

  for (const tag of exerciseTags) {
    if (caution.has(tag)) {
      return {
        allowed: true,
        level: "caution",
        rationale: `Exercise demands ${tag}, which is provisionally allowed for ${condition.metadata.displayName} but warrants caution.`,
      };
    }
  }

  return {
    allowed: true,
    level: "safe",
    rationale: "All movement tags clear for this condition + phase.",
  };
}

/**
 * Convenience wrapper that pulls tags off an `Exercise`. Equivalent to
 * `isAllowedByTags({ exerciseTags: ex.movementTags ?? [], ... })`.
 */
export function isAllowedForCondition(
  exercise: Exercise,
  condition: Condition,
  currentPhaseId: string,
): ConditionFilterResult {
  return isAllowedByTags({
    exerciseTags: exercise.movementTags ?? [],
    condition,
    currentPhaseId,
  });
}
