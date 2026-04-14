package com.nwb.watch.data

import android.content.Context
import com.nwb.watch.R
import com.nwb.watch.data.model.Exercise
import com.nwb.watch.data.model.SupplementsData
import com.nwb.watch.data.model.WorkoutsData
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Loads and caches exercise/workout/supplement data from bundled JSON resources.
 * All data is static for the 6-week program — loaded once at app start.
 */
@Singleton
class ExerciseRepository @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private val json = Json { ignoreUnknownKeys = true }

    val exercises: Map<String, Exercise> by lazy {
        val raw = context.resources.openRawResource(R.raw.exercises)
            .bufferedReader().use { it.readText() }
        json.decodeFromString<Map<String, Exercise>>(raw)
    }

    val workoutsData: WorkoutsData by lazy {
        val raw = context.resources.openRawResource(R.raw.workouts)
            .bufferedReader().use { it.readText() }
        json.decodeFromString<WorkoutsData>(raw)
    }

    val supplementsData: SupplementsData by lazy {
        val raw = context.resources.openRawResource(R.raw.supplements)
            .bufferedReader().use { it.readText() }
        json.decodeFromString<SupplementsData>(raw)
    }

    /** Look up an exercise by its display name (the key in the exercises map). */
    fun exercise(name: String): Exercise? = exercises[name]

    /** Get exercises for a specific workout (e.g. "Push A"). */
    fun exercisesForWorkout(workoutKey: String, phaseIndex: Int): List<Exercise> {
        val workout = workoutsData.workouts[workoutKey] ?: return emptyList()
        return workout.exercises.mapNotNull { name ->
            exercises[name]?.takeIf { it.availableInPhase(phaseIndex) }
        }
    }

    /** Get the core supplement routine for a workout day. */
    fun coreSupplement(workoutKey: String) =
        supplementsData.core[workoutKey]

    /** Get supplement exercise detail data by name. */
    fun supplementExercise(name: String) =
        supplementsData.supplementExercises[name]

    /** Get left leg maintenance exercises. */
    fun leftLegExercises(isLegsDay: Boolean): List<String> {
        val base = supplementsData.leftLeg.base
        return if (isLegsDay) base + supplementsData.leftLeg.legsExtra else base
    }

    /** Get mobility supplements applicable to a workout category. */
    fun mobilitySupplements(category: String) =
        supplementsData.mobilitySupplement.filter { mob ->
            "all" in mob.appliesTo || category in mob.appliesTo
        }
}
