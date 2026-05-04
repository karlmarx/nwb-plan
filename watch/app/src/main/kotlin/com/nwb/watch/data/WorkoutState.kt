package com.nwb.watch.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "workout_state")

/**
 * Persists workout progress and user settings via DataStore.
 */
@Singleton
class WorkoutState @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    // --- Settings keys ---
    private object Keys {
        val TTS_ENABLED = booleanPreferencesKey("tts_enabled")
        val TTS_SPEED = intPreferencesKey("tts_speed") // 50-200 (percentage)
        val HAPTICS_ENABLED = booleanPreferencesKey("haptics_enabled")
        val SUPPLEMENT_LEFT_LEG = booleanPreferencesKey("supplement_left_leg")
        val SUPPLEMENT_CORE = booleanPreferencesKey("supplement_core")
        val NEARBY_EQUIPMENT = stringSetPreferencesKey("nearby_equipment")
        val PROGRAM_START_EPOCH = longPreferencesKey("program_start_epoch")

        // Active workout state
        val ACTIVE_WORKOUT_KEY = stringPreferencesKey("active_workout_key")
        val ACTIVE_EXERCISE_INDEX = intPreferencesKey("active_exercise_index")
        val COMPLETED_SETS = intPreferencesKey("completed_sets")
    }

    // --- Settings flows ---

    val ttsEnabled: Flow<Boolean> = context.dataStore.data
        .map { it[Keys.TTS_ENABLED] ?: true }

    val ttsSpeed: Flow<Int> = context.dataStore.data
        .map { it[Keys.TTS_SPEED] ?: 100 }

    val hapticsEnabled: Flow<Boolean> = context.dataStore.data
        .map { it[Keys.HAPTICS_ENABLED] ?: true }

    val supplementLeftLeg: Flow<Boolean> = context.dataStore.data
        .map { it[Keys.SUPPLEMENT_LEFT_LEG] ?: true }

    val supplementCore: Flow<Boolean> = context.dataStore.data
        .map { it[Keys.SUPPLEMENT_CORE] ?: true }

    val nearbyEquipment: Flow<Set<String>> = context.dataStore.data
        .map { it[Keys.NEARBY_EQUIPMENT] ?: emptySet() }

    val programStartEpoch: Flow<Long?> = context.dataStore.data
        .map { it[Keys.PROGRAM_START_EPOCH] }

    // --- Active workout state ---

    val activeWorkoutKey: Flow<String?> = context.dataStore.data
        .map { it[Keys.ACTIVE_WORKOUT_KEY] }

    val activeExerciseIndex: Flow<Int> = context.dataStore.data
        .map { it[Keys.ACTIVE_EXERCISE_INDEX] ?: 0 }

    val completedSets: Flow<Int> = context.dataStore.data
        .map { it[Keys.COMPLETED_SETS] ?: 0 }

    // --- Mutators ---

    suspend fun setTtsEnabled(enabled: Boolean) {
        context.dataStore.edit { it[Keys.TTS_ENABLED] = enabled }
    }

    suspend fun setTtsSpeed(speed: Int) {
        context.dataStore.edit { it[Keys.TTS_SPEED] = speed.coerceIn(50, 200) }
    }

    suspend fun setHapticsEnabled(enabled: Boolean) {
        context.dataStore.edit { it[Keys.HAPTICS_ENABLED] = enabled }
    }

    suspend fun setSupplementLeftLeg(enabled: Boolean) {
        context.dataStore.edit { it[Keys.SUPPLEMENT_LEFT_LEG] = enabled }
    }

    suspend fun setSupplementCore(enabled: Boolean) {
        context.dataStore.edit { it[Keys.SUPPLEMENT_CORE] = enabled }
    }

    suspend fun setNearbyEquipment(ids: Set<String>) {
        context.dataStore.edit { it[Keys.NEARBY_EQUIPMENT] = ids }
    }

    suspend fun setProgramStartEpoch(epoch: Long) {
        context.dataStore.edit { it[Keys.PROGRAM_START_EPOCH] = epoch }
    }

    suspend fun startWorkout(workoutKey: String) {
        context.dataStore.edit {
            it[Keys.ACTIVE_WORKOUT_KEY] = workoutKey
            it[Keys.ACTIVE_EXERCISE_INDEX] = 0
            it[Keys.COMPLETED_SETS] = 0
        }
    }

    suspend fun advanceExercise(index: Int) {
        context.dataStore.edit {
            it[Keys.ACTIVE_EXERCISE_INDEX] = index
            it[Keys.COMPLETED_SETS] = 0
        }
    }

    suspend fun completeSet() {
        context.dataStore.edit {
            val current = it[Keys.COMPLETED_SETS] ?: 0
            it[Keys.COMPLETED_SETS] = current + 1
        }
    }

    suspend fun endWorkout() {
        context.dataStore.edit {
            it.remove(Keys.ACTIVE_WORKOUT_KEY)
            it.remove(Keys.ACTIVE_EXERCISE_INDEX)
            it.remove(Keys.COMPLETED_SETS)
        }
    }
}
