package com.nwb.phone.data.sync

import android.util.Log
import com.nwb.phone.data.db.WorkoutLogger
import com.nwb.phone.data.model.ExerciseLog
import com.nwb.phone.data.model.SetLog
import com.nwb.phone.data.model.WorkoutLog
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Syncs completed workout logs to the Hevy API.
 *
 * Flow:
 * 1. User completes workout (logged in Room DB)
 * 2. User taps "Sync to Hevy" or auto-sync triggers
 * 3. Converts WorkoutLog → Hevy workout format
 * 4. POSTs to Hevy API via api key
 * 5. Marks log as synced
 */
@Singleton
class HevySyncService @Inject constructor(
    private val logger: WorkoutLogger,
) {
    companion object {
        private const val TAG = "HevySyncService"
        private const val HEVY_BASE = "https://api.hevyapp.com/v1"
    }

    private val client = OkHttpClient()
    private val json = Json { ignoreUnknownKeys = true; encodeDefaults = true }

    private val _syncState = MutableStateFlow(SyncState.IDLE)
    val syncState: StateFlow<SyncState> = _syncState

    enum class SyncState { IDLE, SYNCING, SUCCESS, ERROR }

    /**
     * Sync all unsynced completed workouts to Hevy.
     * Requires a valid Hevy API key.
     */
    suspend fun syncToHevy(
        apiKey: String,
        exerciseMap: Map<String, String>, // exerciseId → Hevy template ID
    ): Result<Int> {
        _syncState.value = SyncState.SYNCING
        return try {
            val unsynced = logger.unsyncedToHevy()
            if (unsynced.isEmpty()) {
                _syncState.value = SyncState.SUCCESS
                return Result.success(0)
            }

            var synced = 0
            for (log in unsynced) {
                val hevyWorkout = convertToHevyWorkout(log, exerciseMap)
                val success = postWorkout(apiKey, hevyWorkout)
                if (success) {
                    logger.markSyncedToHevy(log.id)
                    synced++
                }
            }

            _syncState.value = SyncState.SUCCESS
            Log.d(TAG, "Synced $synced/${ unsynced.size} workouts to Hevy")
            Result.success(synced)
        } catch (e: Exception) {
            Log.e(TAG, "Hevy sync failed", e)
            _syncState.value = SyncState.ERROR
            Result.failure(e)
        }
    }

    private fun convertToHevyWorkout(
        log: WorkoutLog,
        exerciseMap: Map<String, String>,
    ): HevyWorkout {
        val exercises = log.exercises.mapIndexedNotNull { idx, exerciseLog ->
            val templateId = exerciseMap[exerciseLog.exerciseId] ?: return@mapIndexedNotNull null
            HevyWorkoutExercise(
                index = idx,
                title = exerciseLog.exerciseName,
                notes = exerciseLog.notes,
                exercise_template_id = templateId,
                sets = exerciseLog.sets.mapIndexed { setIdx, set ->
                    HevyWorkoutSet(
                        index = setIdx,
                        type = set.type,
                        weight_kg = set.weightKg,
                        reps = set.reps,
                        duration_seconds = set.durationSeconds,
                    )
                },
            )
        }

        return HevyWorkout(
            title = log.workoutTitle,
            description = "Logged from NWB Watch · Phase ${log.phaseIndex + 1}",
            start_time = formatIso(log.startedAt),
            end_time = formatIso(log.completedAt ?: log.startedAt),
            exercises = exercises,
        )
    }

    private fun postWorkout(apiKey: String, workout: HevyWorkout): Boolean {
        val body = json.encodeToString(workout)
            .toRequestBody("application/json".toMediaType())

        val request = Request.Builder()
            .url("$HEVY_BASE/workouts")
            .header("api-key", apiKey)
            .post(body)
            .build()

        return try {
            val response = client.newCall(request).execute()
            response.use { it.isSuccessful }
        } catch (e: Exception) {
            Log.e(TAG, "Hevy POST failed", e)
            false
        }
    }

    private fun formatIso(epochMs: Long): String {
        val instant = java.time.Instant.ofEpochMilli(epochMs)
        return java.time.format.DateTimeFormatter.ISO_INSTANT.format(instant)
    }

    // ── Hevy API types ──

    @Serializable
    data class HevyWorkout(
        val title: String,
        val description: String,
        val start_time: String,
        val end_time: String,
        val exercises: List<HevyWorkoutExercise>,
    )

    @Serializable
    data class HevyWorkoutExercise(
        val index: Int,
        val title: String,
        val notes: String,
        val exercise_template_id: String,
        val sets: List<HevyWorkoutSet>,
    )

    @Serializable
    data class HevyWorkoutSet(
        val index: Int,
        val type: String,
        val weight_kg: Float? = null,
        val reps: Int? = null,
        val duration_seconds: Int? = null,
    )
}
