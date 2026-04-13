package com.nwb.phone.data.model

import kotlinx.serialization.Serializable

@Serializable
data class LeftLegData(
    val base: List<String>,
    val legsExtra: List<String>,
)

@Serializable
data class CoreSupplementExercise(
    val name: String,
    val region: String, // "Upper Abs", "Lower Abs", "Obliques"
)

@Serializable
data class CoreSupplementDay(
    val subtitle: String,
    val exercises: List<CoreSupplementExercise>,
)

@Serializable
data class SupplementExData(
    val sets: List<List<String>>,
    val setup: String,
    val execution: String,
    val nwbCues: String,
    val rest: Int,
)

@Serializable
data class NearbySuperset(
    val nearbyId: String,
    val title: String,
    val sets: String,
    val instruction: String,
    val safety: String,
)

@Serializable
data class MobilitySupplement(
    val id: String,
    val name: String,
    val kind: String, // "mobility", "stretch", "breathing"
    val sets: String,
    val instruction: String,
    val safety: String,
    val appliesTo: List<String>,
)

@Serializable
data class CableSuperset(
    val title: String,
    val sets: String,
    val instruction: String,
    val safety: String,
)

/**
 * Top-level structure of supplements.json.
 */
@Serializable
data class SupplementsData(
    val leftLeg: LeftLegData,
    val core: Map<String, CoreSupplementDay>,
    val supplementExercises: Map<String, SupplementExData>,
    val nearbySupersets: List<NearbySuperset>,
    val mobilitySupplement: List<MobilitySupplement>,
    val cableSuperset: CableSuperset,
    val genericSeatedSuperset: CableSuperset,
)
