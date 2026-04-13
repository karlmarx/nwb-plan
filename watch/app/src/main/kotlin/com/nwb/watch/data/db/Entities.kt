package com.nwb.watch.data.db

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverter
import androidx.room.TypeConverters
import com.nwb.watch.data.model.ExerciseLog
import com.nwb.watch.data.model.PersonalRecord
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

/**
 * Room entity for persisting workout logs.
 * ExerciseLog list is stored as serialized JSON string.
 */
@Entity(tableName = "workout_logs")
@TypeConverters(WorkoutLogConverters::class)
data class WorkoutLogEntity(
    @PrimaryKey val id: String,
    val workoutKey: String,
    val workoutTitle: String,
    val phaseIndex: Int,
    val startedAt: Long,
    val completedAt: Long?,
    val durationSeconds: Int?,
    val exercisesJson: String, // Serialized List<ExerciseLog>
    val syncedToPhone: Boolean = false,
    val syncedToHevy: Boolean = false,
    val source: String = "watch",
)

/**
 * Room entity for personal records.
 */
@Entity(tableName = "personal_records")
data class PersonalRecordEntity(
    @PrimaryKey val id: String, // exerciseId + type
    val exerciseId: String,
    val exerciseName: String,
    val type: String,
    val value: Float,
    val achievedAt: Long,
    val workoutLogId: String,
)

class WorkoutLogConverters {
    private val json = Json { ignoreUnknownKeys = true }

    @TypeConverter
    fun fromExerciseLogList(exercises: List<ExerciseLog>): String =
        json.encodeToString(exercises)

    @TypeConverter
    fun toExerciseLogList(data: String): List<ExerciseLog> =
        json.decodeFromString(data)
}
