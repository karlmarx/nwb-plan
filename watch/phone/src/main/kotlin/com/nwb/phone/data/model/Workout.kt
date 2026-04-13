package com.nwb.phone.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Workout(
    val title: String,
    val icon: String,
    val color: String,
    val hevy: String? = null,
    val exercises: List<String>,
    val removed: List<RemovedExercise>,
)

@Serializable
data class RemovedExercise(
    val name: String,
    val reason: String,
)

@Serializable
data class ScheduleDay(
    val d: String, // "Mon", "Tue", etc.
    val t: String, // "Push A", "Pull A", etc.
    val i: String, // icon
    val c: String, // color hex
)

@Serializable
data class Phase(
    val weeks: String,
    val name: String,
    val color: String,
    val desc: String,
)

/**
 * Top-level structure of workouts.json.
 */
@Serializable
data class WorkoutsData(
    val schedule: List<ScheduleDay>,
    val phases: List<Phase>,
    val workouts: Map<String, Workout>,
)
