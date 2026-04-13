package com.nwb.watch.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nwb.watch.coaching.HapticEngine
import com.nwb.watch.coaching.TempoTracker
import com.nwb.watch.coaching.VoiceCoach
import com.nwb.watch.data.ExerciseRepository
import com.nwb.watch.data.WorkoutScheduler
import com.nwb.watch.data.WorkoutState
import com.nwb.watch.data.db.WorkoutLogger
import com.nwb.watch.data.model.Exercise
import com.nwb.watch.data.model.ExerciseLog
import com.nwb.watch.data.model.SetLog
import com.nwb.watch.data.model.WorkoutLog
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

data class WorkoutUiState(
    val workoutTitle: String = "",
    val workoutKey: String = "",
    val workoutColor: String = "#38bdf8",
    val phaseName: String = "",
    val phaseIndex: Int = 0,
    val weekNumber: Int = 1,
    val programProgress: Float = 0f,
    val exercises: List<Exercise> = emptyList(),
    val currentExerciseIndex: Int = 0,
    val completedSets: Int = 0,
    val isWorkoutActive: Boolean = false,
    val restTimerSeconds: Int = 0,
    val isRestTimerRunning: Boolean = false,
    val ttsEnabled: Boolean = true,
    val hapticsEnabled: Boolean = true,
    val activeLogId: String? = null,
    val totalCompletedWorkouts: Int = 0,
)

@HiltViewModel
class WorkoutViewModel @Inject constructor(
    private val scheduler: WorkoutScheduler,
    private val repository: ExerciseRepository,
    private val workoutState: WorkoutState,
    private val voiceCoach: VoiceCoach,
    private val hapticEngine: HapticEngine,
    private val tempoTracker: TempoTracker,
    private val workoutLogger: WorkoutLogger,
    private val backendSync: com.nwb.watch.data.sync.BackendSync,
) : ViewModel() {

    private val _restTimer = MutableStateFlow(0)
    private val _isRestRunning = MutableStateFlow(false)
    private var restTimerJob: Job? = null

    /** ID of the active WorkoutLog being recorded. */
    private var activeLogId: String? = null

    /** In-memory exercise logs for the active workout. */
    private val activeExerciseLogs = mutableListOf<ExerciseLog>()

    val uiState: StateFlow<WorkoutUiState> = combine(
        workoutState.activeWorkoutKey,
        workoutState.activeExerciseIndex,
        workoutState.completedSets,
        workoutState.ttsEnabled,
        workoutState.hapticsEnabled,
    ) { activeKey, exerciseIdx, sets, ttsOn, hapticsOn ->
        val today = LocalDate.now()
        val key = activeKey ?: scheduler.todayWorkoutKey(today)
        val phase = scheduler.currentPhase(today)
        val phaseIdx = scheduler.currentPhaseIndex(today)
        val schedule = scheduler.todaySchedule(today)

        WorkoutUiState(
            workoutTitle = scheduler.todayWorkoutTitle(today),
            workoutKey = key,
            workoutColor = schedule.c,
            phaseName = phase.name,
            phaseIndex = phaseIdx,
            weekNumber = scheduler.currentWeek(today),
            programProgress = scheduler.programProgress(today),
            exercises = repository.exercisesForWorkout(key, phaseIdx),
            currentExerciseIndex = exerciseIdx,
            completedSets = sets,
            isWorkoutActive = activeKey != null,
            ttsEnabled = ttsOn,
            hapticsEnabled = hapticsOn,
            activeLogId = activeLogId,
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), WorkoutUiState())

    /** Stream of completed workout count for UI display. */
    val completedWorkoutCount: StateFlow<Int> =
        workoutLogger.completedCount()
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    init {
        voiceCoach.initialize()
    }

    val currentExercise: Exercise?
        get() {
            val state = uiState.value
            return state.exercises.getOrNull(state.currentExerciseIndex)
        }

    fun startWorkout() {
        val state = uiState.value
        viewModelScope.launch {
            workoutState.startWorkout(state.workoutKey)

            // Create a workout log
            val log = workoutLogger.startWorkout(
                workoutKey = state.workoutKey,
                workoutTitle = state.workoutTitle,
                phaseIndex = state.phaseIndex,
                source = "watch",
            )
            activeLogId = log.id

            // Initialize exercise logs for all exercises
            activeExerciseLogs.clear()
            state.exercises.forEach { exercise ->
                activeExerciseLogs.add(
                    ExerciseLog(
                        exerciseId = exercise.id,
                        exerciseName = exercise.name,
                        sets = emptyList(),
                    )
                )
            }
        }

        // Announce first exercise
        val firstExercise = state.exercises.firstOrNull()
        if (firstExercise != null) {
            voiceCoach.announceExercise(firstExercise.name, firstExercise.setup)
            if (firstExercise.safety == "caution") {
                voiceCoach.announceSafety(firstExercise.nwbCues)
                hapticEngine.safetyAlert()
            }
        }
        hapticEngine.doubleTap()
    }

    /**
     * Log a completed set with weight/reps/duration data.
     * Called from SetLoggerScreen or ExerciseTimerScreen.
     */
    fun logSet(exerciseIndex: Int, set: SetLog) {
        val state = uiState.value
        val exercise = state.exercises.getOrNull(exerciseIndex) ?: return

        viewModelScope.launch {
            workoutState.completeSet()

            // Update in-memory log
            if (exerciseIndex < activeExerciseLogs.size) {
                val exerciseLog = activeExerciseLogs[exerciseIndex]
                val sets = exerciseLog.sets.toMutableList()
                sets.add(set)
                activeExerciseLogs[exerciseIndex] = exerciseLog.copy(sets = sets)

                // Persist to Room
                val logId = activeLogId
                if (logId != null) {
                    workoutLogger.updateExercises(logId, activeExerciseLogs.toList())
                }
            }
        }

        val newSets = state.completedSets + 1
        val totalSets = exercise.setsForPhase(state.phaseIndex).first.toIntOrNull() ?: 4

        voiceCoach.announceSetDone(newSets, totalSets)
        hapticEngine.doubleTap()

        // Check for PR
        if (set.weightKg != null && set.weightKg > 0) {
            voiceCoach.speak(
                "${"%.1f".format(set.weightKg)} kg times ${set.reps}.",
                com.nwb.watch.coaching.CoachPriority.LOW,
            )
        }

        if (newSets >= totalSets) {
            val nextIndex = state.currentExerciseIndex + 1
            if (nextIndex < state.exercises.size) {
                val nextExercise = state.exercises[nextIndex]
                startRestTimer(exercise.rest, nextExercise)
            } else {
                finishWorkout()
            }
        } else {
            startRestTimer(exercise.rest, null)
        }
    }

    fun completeSet() {
        val state = uiState.value
        val exercise = state.exercises.getOrNull(state.currentExerciseIndex) ?: return
        // Quick complete without weight/rep data (legacy path)
        logSet(
            state.currentExerciseIndex,
            SetLog(
                index = state.completedSets,
                type = "bodyweight",
                completed = true,
            ),
        )
    }

    private fun startRestTimer(seconds: Int, nextExercise: Exercise?) {
        restTimerJob?.cancel()
        _restTimer.value = seconds
        _isRestRunning.value = true

        voiceCoach.announceRest(seconds, nextExercise?.name)

        restTimerJob = viewModelScope.launch {
            for (remaining in seconds downTo 0) {
                _restTimer.value = remaining
                when (remaining) {
                    30 -> {
                        hapticEngine.gentleReminder()
                        voiceCoach.announceRestWarning(30)
                    }
                    10 -> {
                        hapticEngine.escalatingWarning()
                        voiceCoach.announceRestWarning(10)
                    }
                    0 -> {
                        hapticEngine.strongPulse()
                        voiceCoach.announceRestWarning(0)
                    }
                }
                if (remaining > 0) delay(1000)
            }
            _isRestRunning.value = false

            if (nextExercise != null) {
                advanceToNextExercise()
            }
        }
    }

    fun skipRest() {
        restTimerJob?.cancel()
        _restTimer.value = 0
        _isRestRunning.value = false
    }

    private fun advanceToNextExercise() {
        val state = uiState.value
        val nextIndex = state.currentExerciseIndex + 1
        if (nextIndex >= state.exercises.size) {
            finishWorkout()
            return
        }

        viewModelScope.launch {
            workoutState.advanceExercise(nextIndex)
        }

        val nextExercise = state.exercises[nextIndex]
        voiceCoach.announceExercise(nextExercise.name, nextExercise.setup)
        if (nextExercise.safety == "caution") {
            voiceCoach.announceSafety(nextExercise.nwbCues)
            hapticEngine.safetyAlert()
        }
        hapticEngine.doubleTap()
    }

    fun goToExercise(index: Int) {
        val state = uiState.value
        val exercise = state.exercises.getOrNull(index) ?: return
        viewModelScope.launch {
            workoutState.advanceExercise(index)
        }
        voiceCoach.announceExercise(exercise.name, exercise.setup)
    }

    private fun finishWorkout() {
        val state = uiState.value
        viewModelScope.launch {
            workoutState.endWorkout()

            // Complete the workout log
            val logId = activeLogId
            if (logId != null) {
                workoutLogger.updateExercises(logId, activeExerciseLogs.toList())
                workoutLogger.completeWorkout(logId)

                // Push to backend if logged in (no-op if not)
                val completedLog = workoutLogger.getLog(logId)
                if (completedLog != null) {
                    backendSync.pushIfLoggedIn(completedLog)
                }
            }
            activeLogId = null
            activeExerciseLogs.clear()
        }
        voiceCoach.announceWorkoutComplete(state.workoutTitle)
        hapticEngine.workoutComplete()
    }

    /** Whether the user is logged in via GitHub. */
    val isLoggedIn: Boolean get() = backendSync.isLoggedIn
    val loginUrl: String get() = backendSync.getLoginUrl()
    val githubUsername: String? get() = backendSync.apiClient.username

    fun handleAuthCallback(token: String, username: String, avatarUrl: String?) {
        backendSync.saveAuth(token, username, avatarUrl)
    }

    fun logout() {
        backendSync.logout()
    }

    fun syncToBackend() {
        viewModelScope.launch { backendSync.syncAll() }
    }

    fun syncToHevy() {
        viewModelScope.launch { backendSync.syncToHevy() }
    }

    fun endWorkout() {
        restTimerJob?.cancel()
        tempoTracker.cancel()
        voiceCoach.stop()
        viewModelScope.launch {
            workoutState.endWorkout()
            val logId = activeLogId
            if (logId != null) {
                workoutLogger.updateExercises(logId, activeExerciseLogs.toList())
                workoutLogger.completeWorkout(logId)
            }
            activeLogId = null
            activeExerciseLogs.clear()
        }
    }

    fun toggleTts() {
        val current = uiState.value.ttsEnabled
        viewModelScope.launch {
            workoutState.setTtsEnabled(!current)
        }
        voiceCoach.enabled = !current
    }

    fun toggleHaptics() {
        val current = uiState.value.hapticsEnabled
        viewModelScope.launch {
            workoutState.setHapticsEnabled(!current)
        }
        hapticEngine.enabled = !current
    }

    fun readAloud(text: String) {
        voiceCoach.speak(text)
    }

    val restTimerSeconds: StateFlow<Int> = _restTimer
    val isRestTimerRunning: StateFlow<Boolean> = _isRestRunning

    override fun onCleared() {
        super.onCleared()
        restTimerJob?.cancel()
        tempoTracker.cancel()
        voiceCoach.shutdown()
    }
}
