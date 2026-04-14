package com.nwb.watch.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material3.Button
import androidx.wear.compose.material3.ButtonDefaults
import androidx.wear.compose.material3.IconButton
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import com.nwb.watch.ui.WorkoutViewModel
import com.nwb.watch.ui.theme.NwbSlate
import com.nwb.watch.ui.theme.workoutColor

@Composable
fun HomeScreen(
    viewModel: WorkoutViewModel,
    onStartWorkout: () -> Unit,
    onSettings: () -> Unit,
) {
    val state by viewModel.uiState.collectAsState()
    val listState = rememberScalingLazyListState()

    ScalingLazyColumn(
        modifier = Modifier.fillMaxSize(),
        state = listState,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        // Program progress ring placeholder
        item {
            Spacer(modifier = Modifier.height(8.dp))
        }

        // Workout title
        item {
            Text(
                text = state.workoutTitle,
                style = MaterialTheme.typography.titleMedium,
                color = workoutColor(state.workoutColor),
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
            )
        }

        // Phase & week info
        item {
            Text(
                text = "${state.phaseName} · Week ${state.weekNumber}",
                style = MaterialTheme.typography.bodySmall,
                color = NwbSlate,
                textAlign = TextAlign.Center,
            )
        }

        // Exercise count
        item {
            Text(
                text = "${state.exercises.size} exercises",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                textAlign = TextAlign.Center,
            )
        }

        item {
            Spacer(modifier = Modifier.height(12.dp))
        }

        // Exercise preview dots
        item {
            Row(
                horizontalArrangement = Arrangement.Center,
                modifier = Modifier.fillMaxWidth(),
            ) {
                state.exercises.forEachIndexed { index, exercise ->
                    val dotColor = when (exercise.safety) {
                        "caution" -> com.nwb.watch.ui.theme.NwbYellow
                        "danger" -> com.nwb.watch.ui.theme.NwbRed
                        else -> workoutColor(state.workoutColor)
                    }
                    Box(
                        modifier = Modifier
                            .padding(horizontal = 2.dp)
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(dotColor.copy(alpha = if (index == 0) 1f else 0.4f))
                    )
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(16.dp))
        }

        // Start button
        item {
            Button(
                onClick = {
                    viewModel.startWorkout()
                    onStartWorkout()
                },
                modifier = Modifier.fillMaxWidth(0.8f),
                colors = ButtonDefaults.buttonColors(
                    containerColor = workoutColor(state.workoutColor),
                ),
            ) {
                Text(
                    text = "START",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                )
            }
        }

        // Settings button
        item {
            Spacer(modifier = Modifier.height(8.dp))
            IconButton(
                onClick = onSettings,
                modifier = Modifier.size(36.dp),
            ) {
                Text(
                    text = "\u2699",
                    fontSize = 20.sp,
                )
            }
        }
    }
}
