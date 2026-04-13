package com.nwb.phone

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.nwb.phone.ui.history.HistoryScreen
import com.nwb.phone.ui.theme.NwbPhoneTheme
import com.nwb.phone.ui.theme.NwbSlate
import com.nwb.phone.ui.theme.workoutColor
import com.nwb.phone.ui.workout.PhoneWorkoutViewModel
import com.nwb.phone.ui.workout.WorkoutLogScreen
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            NwbPhoneTheme {
                PhoneApp()
            }
        }
    }
}

@Composable
fun PhoneApp() {
    val navController = rememberNavController()
    val viewModel: PhoneWorkoutViewModel = hiltViewModel()
    val state by viewModel.state.collectAsState()
    var selectedTab by remember { mutableIntStateOf(0) }

    Scaffold(
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = {
                        selectedTab = 0
                        navController.navigate("home") {
                            popUpTo("home") { inclusive = true }
                        }
                    },
                    icon = { Icon(Icons.Default.Home, contentDescription = "Today") },
                    label = { Text("Today") },
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = {
                        selectedTab = 1
                        navController.navigate("workout") {
                            popUpTo("home")
                        }
                    },
                    icon = { Icon(Icons.Default.FitnessCenter, contentDescription = "Log") },
                    label = { Text("Log") },
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = {
                        selectedTab = 2
                        navController.navigate("history") {
                            popUpTo("home")
                        }
                    },
                    icon = { Icon(Icons.Default.History, contentDescription = "History") },
                    label = { Text("History") },
                )
            }
        },
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = "home",
            modifier = Modifier.padding(paddingValues),
        ) {
            composable("home") {
                HomeTab(
                    viewModel = viewModel,
                    onStartWorkout = {
                        viewModel.startWorkout()
                        selectedTab = 1
                        navController.navigate("workout")
                    },
                )
            }

            composable("workout") {
                if (state.isWorkoutActive) {
                    WorkoutLogScreen(
                        viewModel = viewModel,
                        onFinish = {
                            selectedTab = 2
                            navController.navigate("history") {
                                popUpTo("home")
                            }
                        },
                    )
                } else {
                    HomeTab(
                        viewModel = viewModel,
                        onStartWorkout = {
                            viewModel.startWorkout()
                        },
                    )
                }
            }

            composable("history") {
                HistoryScreen(viewModel = viewModel)
            }
        }
    }
}

@Composable
private fun HomeTab(
    viewModel: PhoneWorkoutViewModel,
    onStartWorkout: () -> Unit,
) {
    val state by viewModel.state.collectAsState()
    val count by viewModel.completedCount.collectAsState()

    Column(modifier = Modifier.padding(24.dp)) {
        Text(
            text = "NWB Workout",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = state.workoutTitle,
            style = MaterialTheme.typography.titleLarge,
            color = workoutColor(state.workoutColor),
            fontWeight = FontWeight.Bold,
        )

        Text(
            text = "${state.phaseName} · Week ${state.weekNumber}",
            style = MaterialTheme.typography.bodyMedium,
            color = NwbSlate,
        )

        Text(
            text = "${state.exercises.size} exercises · $count workouts logged",
            style = MaterialTheme.typography.bodySmall,
            color = NwbSlate,
        )

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = onStartWorkout,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(
                containerColor = workoutColor(state.workoutColor),
            ),
        ) {
            Icon(Icons.Default.FitnessCenter, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("START WORKOUT", fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedButton(
            onClick = { viewModel.syncWithWatch() },
            modifier = Modifier.fillMaxWidth(),
        ) {
            Icon(Icons.Default.Sync, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("SYNC WITH WATCH")
        }
    }
}
