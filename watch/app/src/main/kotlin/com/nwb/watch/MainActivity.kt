package com.nwb.watch

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.wear.compose.navigation.SwipeDismissableNavHost
import androidx.wear.compose.navigation.composable
import androidx.wear.compose.navigation.rememberSwipeDismissableNavController
import com.nwb.watch.data.sync.SyncManager
import com.nwb.watch.ui.WorkoutViewModel
import com.nwb.watch.ui.home.HomeScreen
import com.nwb.watch.ui.settings.SettingsScreen
import com.nwb.watch.ui.workout.ExerciseDetailScreen
import com.nwb.watch.ui.workout.ExerciseTimerScreen
import com.nwb.watch.ui.workout.RestTimerScreen
import com.nwb.watch.ui.workout.SetLoggerScreen
import com.nwb.watch.ui.workout.SyncScreen
import com.nwb.watch.ui.workout.WorkoutScreen
import com.nwb.watch.ui.theme.NwbWatchTheme
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject lateinit var syncManager: SyncManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        syncManager.startListening()
        setContent {
            NwbWatchTheme {
                NwbWatchNavigation(syncManager)
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        syncManager.stopListening()
    }

    private fun startWorkoutService() {
        val intent = Intent(this, WorkoutService::class.java).apply {
            action = WorkoutService.ACTION_START
        }
        startForegroundService(intent)
    }

    private fun stopWorkoutService() {
        val intent = Intent(this, WorkoutService::class.java).apply {
            action = WorkoutService.ACTION_STOP
        }
        startService(intent)
    }
}

object NavRoutes {
    const val HOME = "home"
    const val WORKOUT = "workout"
    const val EXERCISE_DETAIL = "exercise/{index}"
    const val SET_LOGGER = "set_logger/{exerciseIndex}/{setIndex}"
    const val EXERCISE_TIMER = "exercise_timer/{exerciseIndex}/{setIndex}"
    const val REST_TIMER = "rest_timer"
    const val SETTINGS = "settings"
    const val SYNC = "sync"
    const val SUMMARY = "summary"

    fun exerciseDetail(index: Int) = "exercise/$index"
    fun setLogger(exerciseIndex: Int, setIndex: Int) = "set_logger/$exerciseIndex/$setIndex"
    fun exerciseTimer(exerciseIndex: Int, setIndex: Int) = "exercise_timer/$exerciseIndex/$setIndex"
}

@Composable
fun NwbWatchNavigation(syncManager: SyncManager) {
    val navController = rememberSwipeDismissableNavController()
    val viewModel: WorkoutViewModel = hiltViewModel()
    val scope = rememberCoroutineScope()

    SwipeDismissableNavHost(
        navController = navController,
        startDestination = NavRoutes.HOME,
    ) {
        composable(NavRoutes.HOME) {
            HomeScreen(
                viewModel = viewModel,
                onStartWorkout = {
                    navController.navigate(NavRoutes.WORKOUT)
                },
                onSettings = {
                    navController.navigate(NavRoutes.SETTINGS)
                },
                onSync = {
                    navController.navigate(NavRoutes.SYNC)
                },
            )
        }

        composable(NavRoutes.WORKOUT) {
            WorkoutScreen(
                viewModel = viewModel,
                onExerciseTap = { index ->
                    navController.navigate(NavRoutes.exerciseDetail(index))
                },
                onEndWorkout = {
                    navController.popBackStack(NavRoutes.HOME, inclusive = false)
                },
            )
        }

        composable(NavRoutes.EXERCISE_DETAIL) { backStackEntry ->
            val index = backStackEntry.arguments?.getString("index")?.toIntOrNull() ?: 0
            val state by viewModel.uiState.collectAsState()
            val exercise = state.exercises.getOrNull(index)

            ExerciseDetailScreen(
                viewModel = viewModel,
                exerciseIndex = index,
                onStartSet = {
                    // Route to set logger or timer based on exercise type
                    val repsStr = exercise?.setsForPhase(state.phaseIndex)?.second ?: ""
                    val isDuration = repsStr.contains("s")
                    if (isDuration) {
                        navController.navigate(
                            NavRoutes.exerciseTimer(index, state.completedSets)
                        )
                    } else {
                        navController.navigate(
                            NavRoutes.setLogger(index, state.completedSets)
                        )
                    }
                },
            )
        }

        composable(NavRoutes.SET_LOGGER) { backStackEntry ->
            val exerciseIndex = backStackEntry.arguments?.getString("exerciseIndex")?.toIntOrNull() ?: 0
            val setIndex = backStackEntry.arguments?.getString("setIndex")?.toIntOrNull() ?: 0
            val state by viewModel.uiState.collectAsState()
            val exercise = state.exercises.getOrNull(exerciseIndex) ?: return@composable
            val totalSets = exercise.setsForPhase(state.phaseIndex).first.toIntOrNull() ?: 4

            SetLoggerScreen(
                exercise = exercise,
                setIndex = setIndex,
                totalSets = totalSets,
                phaseIndex = state.phaseIndex,
                workoutColor = state.workoutColor,
                previousSet = null, // TODO: get from active log
                onLogSet = { set ->
                    viewModel.logSet(exerciseIndex, set)
                    navController.navigate(NavRoutes.REST_TIMER) {
                        popUpTo(NavRoutes.exerciseDetail(exerciseIndex))
                    }
                },
            )
        }

        composable(NavRoutes.EXERCISE_TIMER) { backStackEntry ->
            val exerciseIndex = backStackEntry.arguments?.getString("exerciseIndex")?.toIntOrNull() ?: 0
            val setIndex = backStackEntry.arguments?.getString("setIndex")?.toIntOrNull() ?: 0
            val state by viewModel.uiState.collectAsState()
            val exercise = state.exercises.getOrNull(exerciseIndex) ?: return@composable
            val totalSets = exercise.setsForPhase(state.phaseIndex).first.toIntOrNull() ?: 4
            val targetSecs = exercise.setsForPhase(state.phaseIndex).second
                .replace(Regex("[^0-9]"), "").toIntOrNull() ?: 30

            ExerciseTimerScreen(
                exerciseName = exercise.name,
                setIndex = setIndex,
                totalSets = totalSets,
                targetSeconds = targetSecs,
                workoutColorHex = state.workoutColor,
                onComplete = { set ->
                    viewModel.logSet(exerciseIndex, set)
                    navController.navigate(NavRoutes.REST_TIMER) {
                        popUpTo(NavRoutes.exerciseDetail(exerciseIndex))
                    }
                },
                onCancel = { navController.popBackStack() },
            )
        }

        composable(NavRoutes.REST_TIMER) {
            RestTimerScreen(
                viewModel = viewModel,
                onTimerDone = {
                    navController.popBackStack()
                },
            )
        }

        composable(NavRoutes.SETTINGS) {
            SettingsScreen(viewModel = viewModel)
        }

        composable(NavRoutes.SYNC) {
            SyncScreen(
                syncManager = syncManager,
                onSync = {
                    scope.launch { syncManager.pushWorkoutLogs() }
                },
            )
        }
    }
}
