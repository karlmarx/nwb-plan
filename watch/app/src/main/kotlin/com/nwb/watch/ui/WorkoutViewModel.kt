package com.nwb.watch.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nwb.watch.coaching.HapticEngine
import com.nwb.watch.coaching.TempoTracker
import com.nwb.watch.coaching.VoiceCoach
import com.nwb.watch.data.ExerciseRepository
import com.nwb.watch.data.SyncClient
import com.nwb.watch.data.WorkoutScheduler
import com.nwb.watch.data.WorkoutState
import com.nwb.watch.data.model.Exercise
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
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
)

@HiltViewModel
class WorkoutViewModel @Inject constructor(
    private val scheduler: WorkoutScheduler,
    private val repository: ExerciseRepository,
    private val workoutState: WorkoutState,
    private val syncClient: SyncClient,
    private val voiceCoach: VoiceCoach,
    private val hapticEngine: HapticEngine,
    private val tempoTracker: TempoTracker,
) : ViewModel() {

    private val _restTimer = MutableStateFlow(0)
    private val _isRestRunning = MutableStateFlow(false)
    private var restTimerJob: Job? = null

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
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), WorkoutUiState())

    init {
        voiceCoach.initialize()
        // Pull remote state on app open
        viewModelScope.launch { syncClient.pull() }
    }

    private fun syncPush() {
        viewModelScope.launch { syncClient.push() }
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
        syncPush()
    }

    fun completeSet() {
        val state = uiState.value
        val exercise = state.exercises.getOrNull(state.currentExerciseIndex) ?: return
        val newSets = state.completedSets + 1
        val totalSets = exercise.setsForPhase(state.phaseIndex).first.toIntOrNull() ?: 4

        viewModelScope.launch {
            workoutState.completeSet()
        }

        voiceCoach.announceSetDone(newSets, totalSets)
        hapticEngine.doubleTap()

        if (newSets >= totalSets) {
            // All sets done — move to next exercise or finish
            val nextIndex = state.currentExerciseIndex + 1
            if (nextIndex < state.exercises.size) {
                val nextExercise = state.exercises[nextIndex]
                startRestTimer(exercise.rest, nextExercise)
            } else {
                finishWorkout()
            }
        } else {
            // More sets to go — start rest timer
            startRestTimer(exercise.rest, null)
        }
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

            // Auto-advance to next exercise if all sets were done
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
        }
        voiceCoach.announceWorkoutComplete(state.workoutTitle)
        hapticEngine.workoutComplete()
        syncPush()
    }

    fun endWorkout() {
        restTimerJob?.cancel()
        tempoTracker.cancel()
        voiceCoach.stop()
        viewModelScope.launch {
            workoutState.endWorkout()
        }
        syncPush()
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

    fun setCurrentWeek(week: Int) {
        val startDate = scheduler.startDateForWeek(week, LocalDate.now())
        viewModelScope.launch {
            workoutState.setProgramStartEpoch(startDate.toEpochDay())
        }
        syncPush()
    }

    /** Manual sync — pull then push. Returns true if successful. */
    suspend fun syncNow(): Boolean {
        return try {
            syncClient.pull()
            syncClient.push()
            true
        } catch (_: Exception) {
            false
        }
    }

    /** Whether sync credentials are configured. */
    fun hasSyncCredentials(): Boolean {
        val secret = kotlinx.coroutines.runBlocking { workoutState.syncSecret.first() }
        val url = kotlinx.coroutines.runBlocking { workoutState.syncUrl.first() }
        return !secret.isNullOrBlank() && !url.isNullOrBlank()
    }

    /** Set sync URL and secret (called from ADB helper or future pairing UI). */
    fun setSyncConfig(url: String, secret: String) {
        viewModelScope.launch {
            workoutState.setSyncUrl(url)
            workoutState.setSyncSecret(secret)
        }
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
