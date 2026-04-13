package com.nwb.phone.ui.workout

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nwb.phone.data.ExerciseRepository
import com.nwb.phone.data.WorkoutScheduler
import com.nwb.phone.data.db.WorkoutLogger
import com.nwb.phone.data.model.Exercise
import com.nwb.phone.data.model.ExerciseLog
import com.nwb.phone.data.model.PersonalRecord
import com.nwb.phone.data.model.SetLog
import com.nwb.phone.data.model.WorkoutLog
import com.nwb.phone.data.sync.HevySyncService
import com.nwb.phone.data.sync.PhoneSyncManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

data class PhoneUiState(
    val workoutTitle: String = "",
    val workoutKey: String = "",
    val workoutColor: String = "#38bdf8",
    val phaseName: String = "",
    val phaseIndex: Int = 0,
    val weekNumber: Int = 1,
    val exercises: List<Exercise> = emptyList(),
    val isWorkoutActive: Boolean = false,
    val activeLogId: String? = null,
    val currentExerciseIndex: Int = 0,
)

@HiltViewModel
class PhoneWorkoutViewModel @Inject constructor(
    private val scheduler: WorkoutScheduler,
    private val repository: ExerciseRepository,
    private val logger: WorkoutLogger,
    val syncManager: PhoneSyncManager,
    val hevySync: HevySyncService,
) : ViewModel() {

    private val _state = MutableStateFlow(PhoneUiState())
    val state: StateFlow<PhoneUiState> = _state

    /** In-memory exercise logs for the active workout. */
    private val exerciseLogs = mutableListOf<ExerciseLog>()
    private var activeLogId: String? = null

    // Rest timer
    private val _restSeconds = MutableStateFlow(0)
    val restSeconds: StateFlow<Int> = _restSeconds
    private val _restRunning = MutableStateFlow(false)
    val restRunning: StateFlow<Boolean> = _restRunning
    private var restJob: Job? = null

    // Exercise timer (for timed holds)
    private val _exerciseTimerSeconds = MutableStateFlow(0)
    val exerciseTimerSeconds: StateFlow<Int> = _exerciseTimerSeconds
    private val _exerciseTimerRunning = MutableStateFlow(false)
    val exerciseTimerRunning: StateFlow<Boolean> = _exerciseTimerRunning
    private var exerciseTimerJob: Job? = null

    // History
    val recentWorkouts: StateFlow<List<WorkoutLog>> =
        logger.recentLogs(30)
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val personalRecords: StateFlow<List<PersonalRecord>> =
        logger.allRecords()
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val completedCount: StateFlow<Int> =
        logger.completedCount()
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    init {
        refreshToday()
        syncManager.startListening()
    }

    fun refreshToday() {
        val today = LocalDate.now()
        val key = scheduler.todayWorkoutKey(today)
        val phase = scheduler.currentPhase(today)
        val phaseIdx = scheduler.currentPhaseIndex(today)
        val schedule = scheduler.todaySchedule(today)

        _state.value = _state.value.copy(
            workoutTitle = scheduler.todayWorkoutTitle(today),
            workoutKey = key,
            workoutColor = schedule.c,
            phaseName = phase.name,
            phaseIndex = phaseIdx,
            weekNumber = scheduler.currentWeek(today),
            exercises = repository.exercisesForWorkout(key, phaseIdx),
        )
    }

    // ── Workout lifecycle ──

    fun startWorkout() {
        val s = _state.value
        viewModelScope.launch {
            val log = logger.startWorkout(
                workoutKey = s.workoutKey,
                workoutTitle = s.workoutTitle,
                phaseIndex = s.phaseIndex,
                source = "phone",
            )
            activeLogId = log.id

            exerciseLogs.clear()
            s.exercises.forEach { ex ->
                exerciseLogs.add(
                    ExerciseLog(exerciseId = ex.id, exerciseName = ex.name, sets = emptyList())
                )
            }

            _state.value = s.copy(
                isWorkoutActive = true,
                activeLogId = log.id,
                currentExerciseIndex = 0,
            )
        }
    }

    fun logSet(exerciseIndex: Int, set: SetLog) {
        viewModelScope.launch {
            if (exerciseIndex < exerciseLogs.size) {
                val exLog = exerciseLogs[exerciseIndex]
                exerciseLogs[exerciseIndex] = exLog.copy(
                    sets = exLog.sets + set,
                )
                activeLogId?.let {
                    logger.updateExercises(it, exerciseLogs.toList())
                }
            }
        }
    }

    fun advanceExercise() {
        val s = _state.value
        val next = s.currentExerciseIndex + 1
        if (next < s.exercises.size) {
            _state.value = s.copy(currentExerciseIndex = next)
        }
    }

    fun goToExercise(index: Int) {
        _state.value = _state.value.copy(currentExerciseIndex = index)
    }

    fun finishWorkout() {
        viewModelScope.launch {
            activeLogId?.let {
                logger.updateExercises(it, exerciseLogs.toList())
                logger.completeWorkout(it)
            }
            activeLogId = null
            exerciseLogs.clear()
            _state.value = _state.value.copy(isWorkoutActive = false, activeLogId = null)
        }
    }

    // ── Rest timer ──

    fun startRestTimer(seconds: Int) {
        restJob?.cancel()
        _restSeconds.value = seconds
        _restRunning.value = true
        restJob = viewModelScope.launch {
            for (r in seconds downTo 0) {
                _restSeconds.value = r
                if (r > 0) delay(1000)
            }
            _restRunning.value = false
        }
    }

    fun skipRest() {
        restJob?.cancel()
        _restSeconds.value = 0
        _restRunning.value = false
    }

    // ── Exercise timer (for timed holds) ──

    fun startExerciseTimer(targetSeconds: Int) {
        exerciseTimerJob?.cancel()
        _exerciseTimerSeconds.value = 0
        _exerciseTimerRunning.value = true
        exerciseTimerJob = viewModelScope.launch {
            for (t in 1..targetSeconds) {
                delay(1000)
                _exerciseTimerSeconds.value = t
            }
            _exerciseTimerRunning.value = false
        }
    }

    fun stopExerciseTimer() {
        exerciseTimerJob?.cancel()
        _exerciseTimerRunning.value = false
    }

    // ── Sync ──

    fun syncWithWatch() {
        viewModelScope.launch { syncManager.pushToWatch() }
    }

    fun syncToHevy(apiKey: String, exerciseMap: Map<String, String>) {
        viewModelScope.launch { hevySync.syncToHevy(apiKey, exerciseMap) }
    }

    /** Get logged sets for a given exercise in the active workout. */
    fun setsForExercise(exerciseIndex: Int): List<SetLog> {
        return exerciseLogs.getOrNull(exerciseIndex)?.sets ?: emptyList()
    }

    override fun onCleared() {
        super.onCleared()
        syncManager.stopListening()
        restJob?.cancel()
        exerciseTimerJob?.cancel()
    }
}
