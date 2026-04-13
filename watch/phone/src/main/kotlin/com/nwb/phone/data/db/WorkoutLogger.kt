package com.nwb.phone.data.db

import com.nwb.phone.data.model.ExerciseLog
import com.nwb.phone.data.model.PersonalRecord
import com.nwb.phone.data.model.SetLog
import com.nwb.phone.data.model.WorkoutLog
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

/**
 * High-level API for logging workouts, tracking sets, and detecting PRs.
 * Used by both watch and phone ViewModels.
 */
@Singleton
class WorkoutLogger @Inject constructor(
    private val logDao: WorkoutLogDao,
    private val prDao: PersonalRecordDao,
) {
    private val json = Json { ignoreUnknownKeys = true }

    // ── Active workout management ──

    suspend fun startWorkout(
        workoutKey: String,
        workoutTitle: String,
        phaseIndex: Int,
        source: String = "watch",
    ): WorkoutLog {
        val log = WorkoutLog(
            workoutKey = workoutKey,
            workoutTitle = workoutTitle,
            phaseIndex = phaseIndex,
            source = source,
        )
        logDao.insert(log.toEntity())
        return log
    }

    suspend fun getLog(id: String): WorkoutLog? =
        logDao.getById(id)?.toModel()

    suspend fun updateExercises(logId: String, exercises: List<ExerciseLog>) {
        val entity = logDao.getById(logId) ?: return
        logDao.update(entity.copy(exercisesJson = json.encodeToString(exercises)))
    }

    suspend fun completeWorkout(logId: String) {
        val entity = logDao.getById(logId) ?: return
        val now = System.currentTimeMillis()
        val duration = ((now - entity.startedAt) / 1000).toInt()
        logDao.update(entity.copy(completedAt = now, durationSeconds = duration))

        // Check for personal records
        val log = logDao.getById(logId)?.toModel() ?: return
        checkPersonalRecords(log)
    }

    // ── Set logging ──

    suspend fun logSet(
        logId: String,
        exerciseIndex: Int,
        set: SetLog,
    ) {
        val entity = logDao.getById(logId) ?: return
        val exercises = json.decodeFromString<List<ExerciseLog>>(entity.exercisesJson)
            .toMutableList()

        if (exerciseIndex < exercises.size) {
            val exercise = exercises[exerciseIndex]
            val sets = exercise.sets.toMutableList()

            // Replace or append set
            val existingIdx = sets.indexOfFirst { it.index == set.index }
            if (existingIdx >= 0) {
                sets[existingIdx] = set
            } else {
                sets.add(set)
            }
            exercises[exerciseIndex] = exercise.copy(sets = sets)
            logDao.update(entity.copy(exercisesJson = json.encodeToString(exercises)))
        }
    }

    // ── History queries ──

    fun recentLogs(limit: Int = 20): Flow<List<WorkoutLog>> =
        logDao.recentLogs(limit).map { entities ->
            entities.map { it.toModel() }
        }

    fun logsByWorkout(key: String): Flow<List<WorkoutLog>> =
        logDao.logsByWorkout(key).map { entities ->
            entities.map { it.toModel() }
        }

    fun completedCount(): Flow<Int> = logDao.completedCount()

    // ── Sync helpers ──

    suspend fun unsyncedToPhone(): List<WorkoutLog> =
        logDao.unsyncedToPhone().map { it.toModel() }

    suspend fun unsyncedToHevy(): List<WorkoutLog> =
        logDao.unsyncedToHevy().map { it.toModel() }

    suspend fun markSyncedToPhone(id: String) = logDao.markSyncedToPhone(id)
    suspend fun markSyncedToHevy(id: String) = logDao.markSyncedToHevy(id)

    suspend fun importLog(log: WorkoutLog) {
        logDao.insert(log.toEntity())
        checkPersonalRecords(log)
    }

    // ── Personal records ──

    fun allRecords(): Flow<List<PersonalRecord>> =
        prDao.allRecords().map { entities ->
            entities.map { it.toModel() }
        }

    suspend fun recordsForExercise(exerciseId: String): List<PersonalRecord> =
        prDao.forExercise(exerciseId).map { it.toModel() }

    private suspend fun checkPersonalRecords(log: WorkoutLog) {
        for (exercise in log.exercises) {
            val completedSets = exercise.sets.filter { it.completed }
            if (completedSets.isEmpty()) continue

            // Max weight PR
            val maxWeight = completedSets
                .filter { it.type == "weight_reps" }
                .mapNotNull { it.weightKg }
                .maxOrNull()

            if (maxWeight != null) {
                val existing = prDao.getRecord(exercise.exerciseId, "max_weight")
                if (existing == null || maxWeight > existing.value) {
                    prDao.insert(
                        PersonalRecordEntity(
                            id = "${exercise.exerciseId}_max_weight",
                            exerciseId = exercise.exerciseId,
                            exerciseName = exercise.exerciseName,
                            type = "max_weight",
                            value = maxWeight,
                            achievedAt = log.completedAt ?: log.startedAt,
                            workoutLogId = log.id,
                        )
                    )
                }
            }

            // Max reps at heaviest weight PR
            val maxReps = completedSets
                .filter { it.type == "weight_reps" }
                .mapNotNull { it.reps }
                .maxOrNull()

            if (maxReps != null) {
                val existing = prDao.getRecord(exercise.exerciseId, "max_reps")
                if (existing == null || maxReps > existing.value) {
                    prDao.insert(
                        PersonalRecordEntity(
                            id = "${exercise.exerciseId}_max_reps",
                            exerciseId = exercise.exerciseId,
                            exerciseName = exercise.exerciseName,
                            type = "max_reps",
                            value = maxReps.toFloat(),
                            achievedAt = log.completedAt ?: log.startedAt,
                            workoutLogId = log.id,
                        )
                    )
                }
            }

            // Max volume (weight × reps) PR
            val maxVolume = completedSets
                .filter { it.type == "weight_reps" && it.weightKg != null && it.reps != null }
                .maxOfOrNull { (it.weightKg ?: 0f) * (it.reps ?: 0) }

            if (maxVolume != null && maxVolume > 0) {
                val existing = prDao.getRecord(exercise.exerciseId, "max_volume")
                if (existing == null || maxVolume > existing.value) {
                    prDao.insert(
                        PersonalRecordEntity(
                            id = "${exercise.exerciseId}_max_volume",
                            exerciseId = exercise.exerciseId,
                            exerciseName = exercise.exerciseName,
                            type = "max_volume",
                            value = maxVolume,
                            achievedAt = log.completedAt ?: log.startedAt,
                            workoutLogId = log.id,
                        )
                    )
                }
            }
        }
    }

    // ── Conversions ──

    private fun WorkoutLog.toEntity() = WorkoutLogEntity(
        id = id,
        workoutKey = workoutKey,
        workoutTitle = workoutTitle,
        phaseIndex = phaseIndex,
        startedAt = startedAt,
        completedAt = completedAt,
        durationSeconds = durationSeconds,
        exercisesJson = json.encodeToString(exercises),
        syncedToPhone = syncedToPhone,
        syncedToHevy = syncedToHevy,
        source = source,
    )

    private fun WorkoutLogEntity.toModel() = WorkoutLog(
        id = id,
        workoutKey = workoutKey,
        workoutTitle = workoutTitle,
        phaseIndex = phaseIndex,
        startedAt = startedAt,
        completedAt = completedAt,
        durationSeconds = durationSeconds,
        exercises = json.decodeFromString(exercisesJson),
        syncedToPhone = syncedToPhone,
        syncedToHevy = syncedToHevy,
        source = source,
    )

    private fun PersonalRecordEntity.toModel() = PersonalRecord(
        exerciseId = exerciseId,
        exerciseName = exerciseName,
        type = type,
        value = value,
        achievedAt = achievedAt,
        workoutLogId = workoutLogId,
    )
}
