package com.nwb.phone.data.model

import kotlinx.serialization.Serializable

@Serializable
data class ExerciseConstraints(
    val requiresIliopsoas: Boolean,
    val maxHipFlexion: Int,
    val requiresWeightBearing: Boolean,
)

@Serializable
data class VariantSuperset(
    val title: String,
    val sets: String,
    val instruction: String,
    val safety: String,
    val note: String? = null,
)

@Serializable
data class MachineVariant(
    val id: String,
    val label: String,
    val description: String,
    val setupCues: List<String>,
    val superset: VariantSuperset? = null,
)

@Serializable
data class Exercise(
    val id: String,
    val name: String,
    val requires: List<String>,
    val category: String,
    val sets: List<List<String>>,
    val rest: Int,
    val setup: String,
    val execution: String,
    val nwbCues: String,
    val why: String,
    val safety: String,
    val swaps: List<String>,
    val tempo: String? = null,
    val amp: List<String>? = null,
    val phase: Int? = null,
    val tier: Int? = null,
    val cableSuperset: Boolean? = null,
    val constraints: ExerciseConstraints,
    val machineVariants: List<MachineVariant>? = null,
) {
    /** Sets × reps string for a given phase index (0, 1, 2). */
    fun setsForPhase(phaseIndex: Int): Pair<String, String> {
        val clamped = phaseIndex.coerceIn(0, sets.lastIndex)
        val pair = sets[clamped]
        return Pair(pair[0], pair[1])
    }

    /** e.g. "4 × 5-6" */
    fun setsDisplay(phaseIndex: Int): String {
        val (s, r) = setsForPhase(phaseIndex)
        return "$s × $r"
    }

    /** Rest time formatted as "2:00" or "0:45" */
    fun restDisplay(): String {
        val min = rest / 60
        val sec = rest % 60
        return "%d:%02d".format(min, sec)
    }

    /** Whether this exercise is available in the given phase. */
    fun availableInPhase(phaseIndex: Int): Boolean =
        (phase ?: 0) <= phaseIndex
}
