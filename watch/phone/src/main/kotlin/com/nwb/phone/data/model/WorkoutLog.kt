package com.nwb.phone.data.model

import kotlinx.serialization.Serializable

/**
 * A single logged set within an exercise.
 * Mirrors Hevy's set structure for seamless sync.
 */
@Serializable
data class SetLog(
    val index: Int,
    val type: String = "weight_reps", // "weight_reps" | "duration" | "bodyweight"
    val weightKg: Float? = null,
    val reps: Int? = null,
    val durationSeconds: Int? = null,
    val completed: Boolean = false,
    val isPersonalRecord: Boolean = false,
    val timestamp: Long = System.currentTimeMillis(),
)

/**
 * A logged exercise within a workout session.
 */
@Serializable
data class ExerciseLog(
    val exerciseId: String,
    val exerciseName: String,
    val sets: List<SetLog>,
    val notes: String = "",
    val hevyTemplateId: String? = null,
)

/**
 * A complete workout session log.
 * Stored locally and synced between watch <-> phone <-> Hevy.
 */
@Serializable
data class WorkoutLog(
    val id: String = generateLogId(),
    val workoutKey: String,        // "Push A", "Pull B", etc.
    val workoutTitle: String,
    val phaseIndex: Int,
    val startedAt: Long = System.currentTimeMillis(),
    val completedAt: Long? = null,
    val durationSeconds: Int? = null,
    val exercises: List<ExerciseLog> = emptyList(),
    val syncedToPhone: Boolean = false,
    val syncedToHevy: Boolean = false,
    val source: String = "watch",  // "watch" | "phone"
)

/**
 * Payload for Data Layer sync between watch and phone.
 * Wraps one or more workout logs with metadata.
 */
@Serializable
data class SyncPayload(
    val version: Int = 1,
    val deviceId: String,
    val timestamp: Long = System.currentTimeMillis(),
    val workoutLogs: List<WorkoutLog>,
    val personalRecords: List<PersonalRecord> = emptyList(),
)

/**
 * Personal record for an exercise.
 */
@Serializable
data class PersonalRecord(
    val exerciseId: String,
    val exerciseName: String,
    val type: String,              // "max_weight", "max_reps", "max_volume"
    val value: Float,
    val achievedAt: Long,
    val workoutLogId: String,
)

private fun generateLogId(): String {
    val chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    return (1..12).map { chars.random() }.joinToString("")
}
