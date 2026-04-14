package com.nwb.watch

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.Composable
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.wear.compose.navigation.SwipeDismissableNavHost
import androidx.wear.compose.navigation.composable
import androidx.wear.compose.navigation.rememberSwipeDismissableNavController
import com.nwb.watch.ui.WorkoutViewModel
import com.nwb.watch.ui.home.HomeScreen
import com.nwb.watch.ui.settings.SettingsScreen
import com.nwb.watch.ui.workout.ExerciseDetailScreen
import com.nwb.watch.ui.workout.RestTimerScreen
import com.nwb.watch.ui.workout.WorkoutScreen
import com.nwb.watch.ui.theme.NwbWatchTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            NwbWatchTheme {
                NwbWatchNavigation()
            }
        }
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
    const val REST_TIMER = "rest_timer"
    const val SETTINGS = "settings"
    const val SUMMARY = "summary"

    fun exerciseDetail(index: Int) = "exercise/$index"
}

@Composable
fun NwbWatchNavigation() {
    val navController = rememberSwipeDismissableNavController()
    // Share the same ViewModel instance across all screens via Hilt
    val viewModel: WorkoutViewModel = hiltViewModel()

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
            ExerciseDetailScreen(
                viewModel = viewModel,
                exerciseIndex = index,
                onStartSet = {
                    // After completing a set, show rest timer
                    navController.navigate(NavRoutes.REST_TIMER)
                },
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
    }
}
