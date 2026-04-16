package com.nwb.watch.data

import com.nwb.watch.data.model.Phase
import com.nwb.watch.data.model.ScheduleDay
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import javax.inject.Inject
import javax.inject.Singleton

// Mirrors lib/program.ts PROG_START on the web side — keep in sync.
private val DEFAULT_PROGRAM_START: LocalDate = LocalDate.of(2026, 3, 17)

/**
 * Determines today's workout and current training phase based on
 * the 7-day schedule rotation and 6-week program timeline.
 *
 * Stateless — the start date comes from DataStore via [WorkoutState].
 * Callers read the stored epoch, resolve it with [programStartDate],
 * and pass the resulting [LocalDate] into the other methods.
 */
@Singleton
class WorkoutScheduler @Inject constructor(
    private val repository: ExerciseRepository,
) {
    /**
     * Resolve the program start date from a persisted epoch day.
     * First-run fallback matches the web app's hardcoded PROG_START
     * so the watch and PWA agree out of the box.
     */
    fun programStartDate(epoch: Long?): LocalDate =
        epoch?.let { LocalDate.ofEpochDay(it) } ?: DEFAULT_PROGRAM_START

    private fun findNearestPastMonday(date: LocalDate): LocalDate {
        var d = date
        while (d.dayOfWeek != DayOfWeek.MONDAY) d = d.minusDays(1)
        return d
    }

    /** Current day number in the program (0-indexed). */
    fun programDay(today: LocalDate, startDate: LocalDate): Int =
        ChronoUnit.DAYS.between(startDate, today).toInt().coerceAtLeast(0)

    /** Current week number (1-indexed, capped at 6). */
    fun currentWeek(today: LocalDate, startDate: LocalDate): Int =
        (programDay(today, startDate) / 7 + 1).coerceIn(1, 6)

    /** Current phase index (0 = Foundation, 1 = Build, 2 = Peak). */
    fun currentPhaseIndex(today: LocalDate, startDate: LocalDate): Int {
        val week = currentWeek(today, startDate)
        return when {
            week <= 2 -> 0
            week <= 4 -> 1
            else -> 2
        }
    }

    /** Current phase metadata. */
    fun currentPhase(today: LocalDate, startDate: LocalDate): Phase {
        val phases = repository.workoutsData.phases
        return phases[currentPhaseIndex(today, startDate).coerceIn(0, phases.lastIndex)]
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
    fun todayExercises(today: LocalDate, startDate: LocalDate) =
        repository.exercisesForWorkout(
            todayWorkoutKey(today),
            currentPhaseIndex(today, startDate),
        )

    /** Total program progress as a fraction (0.0 to 1.0). */
    fun programProgress(today: LocalDate, startDate: LocalDate): Float =
        (programDay(today, startDate).toFloat() / 42f).coerceIn(0f, 1f)

    /**
     * Given a target week number, compute the start date that would
     * place [today] in that week. Week-1 anchors to today's nearest
     * past Monday, and each earlier week subtracts 7 days.
     */
    fun startDateForWeek(week: Int, today: LocalDate = LocalDate.now()): LocalDate {
        val clamped = week.coerceIn(1, 6)
        return findNearestPastMonday(today).minusWeeks((clamped - 1).toLong())
    }
}
