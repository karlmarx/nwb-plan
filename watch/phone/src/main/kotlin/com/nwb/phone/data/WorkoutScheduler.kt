package com.nwb.phone.data

import com.nwb.phone.data.model.Phase
import com.nwb.phone.data.model.ScheduleDay
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Determines today's workout and current training phase based on
 * the 7-day schedule rotation and 6-week program timeline.
 */
@Singleton
class WorkoutScheduler @Inject constructor(
    private val repository: ExerciseRepository,
) {
    /**
     * Program start date. Defaults to the nearest past Monday.
     * In a real app, this would come from user settings / DataStore.
     */
    var programStartDate: LocalDate = findNearestPastMonday(LocalDate.now())

    private fun findNearestPastMonday(date: LocalDate): LocalDate {
        var d = date
        while (d.dayOfWeek != DayOfWeek.MONDAY) d = d.minusDays(1)
        return d
    }

    /** Current day number in the program (0-indexed). */
    fun programDay(today: LocalDate = LocalDate.now()): Int =
        ChronoUnit.DAYS.between(programStartDate, today).toInt().coerceAtLeast(0)

    /** Current week number (1-indexed, capped at 6). */
    fun currentWeek(today: LocalDate = LocalDate.now()): Int =
        (programDay(today) / 7 + 1).coerceIn(1, 6)

    /** Current phase index (0 = Foundation, 1 = Build, 2 = Peak). */
    fun currentPhaseIndex(today: LocalDate = LocalDate.now()): Int {
        val week = currentWeek(today)
        return when {
            week <= 2 -> 0
            week <= 4 -> 1
            else -> 2
        }
    }

    /** Current phase metadata. */
    fun currentPhase(today: LocalDate = LocalDate.now()): Phase {
        val phases = repository.workoutsData.phases
        return phases[currentPhaseIndex(today).coerceIn(0, phases.lastIndex)]
    }

    /** Today's schedule entry from the 7-day rotation. */
    fun todaySchedule(today: LocalDate = LocalDate.now()): ScheduleDay {
        val schedule = repository.workoutsData.schedule
        val dayOfWeek = today.dayOfWeek.value // 1=Mon, 7=Sun
        val index = (dayOfWeek - 1).coerceIn(0, schedule.lastIndex)
        return schedule[index]
    }

    /** Today's workout key (e.g. "Push A", "Pull B", "Recovery"). */
    fun todayWorkoutKey(today: LocalDate = LocalDate.now()): String =
        todaySchedule(today).t

    /** Get the full workout title (e.g. "Push A — Heavy Strength"). */
    fun todayWorkoutTitle(today: LocalDate = LocalDate.now()): String {
        val key = todayWorkoutKey(today)
        return repository.workoutsData.workouts[key]?.title ?: key
    }

    /** Get exercises for today, phase-filtered. */
    fun todayExercises(today: LocalDate = LocalDate.now()) =
        repository.exercisesForWorkout(
            todayWorkoutKey(today),
            currentPhaseIndex(today),
        )

    /** Total program progress as a fraction (0.0 to 1.0). */
    fun programProgress(today: LocalDate = LocalDate.now()): Float =
        (programDay(today).toFloat() / 42f).coerceIn(0f, 1f)
}
