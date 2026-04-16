package com.nwb.watch.ui.workout

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material3.Button
import androidx.wear.compose.material3.ButtonDefaults
import androidx.wear.compose.material3.Card
import androidx.wear.compose.material3.CardDefaults
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import androidx.wear.compose.material3.TextButton
import com.nwb.watch.ui.WorkoutViewModel
import com.nwb.watch.ui.theme.NwbSlate
import com.nwb.watch.ui.theme.NwbYellow
import com.nwb.watch.ui.theme.safetyColor
import com.nwb.watch.ui.theme.safetyLabel
import com.nwb.watch.ui.theme.workoutColor

@Composable
fun ExerciseDetailScreen(
    viewModel: WorkoutViewModel,
    exerciseIndex: Int,
    onStartSet: () -> Unit,
) {
    val state by viewModel.uiState.collectAsState()
    val exercise = state.exercises.getOrNull(exerciseIndex) ?: return
    val listState = rememberScalingLazyListState()

    ScalingLazyColumn(
        modifier = Modifier.fillMaxSize(),
        state = listState,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        // Exercise name + safety
        item {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(top = 8.dp, start = 12.dp, end = 12.dp),
            ) {
                Text(
                    text = exercise.name,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = workoutColor(state.workoutColor),
                )

                Row {
                    Text(
                        text = exercise.setsDisplay(state.phaseIndex),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface,
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Rest: ${exercise.restDisplay()}",
                        style = MaterialTheme.typography.bodySmall,
                        color = NwbSlate,
                    )
                }

                Text(
                    text = safetyLabel(exercise.safety),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = safetyColor(exercise.safety),
                    modifier = Modifier.padding(top = 2.dp),
                )
            }
        }

        // Setup section
        item {
            DetailSection(title = "Setup", content = exercise.setup)
        }

        // Execution section
        item {
            DetailSection(title = "Execution", content = exercise.execution)
        }

        // NWB Safety Cues (highlighted)
        item {
            DetailSection(
                title = "\u26A0 NWB Cues",
                content = exercise.nwbCues,
                accentColor = NwbYellow,
            )
        }

        // Tempo if available
        if (exercise.tempo != null) {
            item {
                DetailSection(
                    title = "Tempo",
                    content = exercise.tempo!!,
                    accentColor = workoutColor(state.workoutColor),
                )
            }
        }

        // Read aloud button
        item {
            TextButton(
                onClick = {
                    viewModel.readAloud(
                        "${exercise.name}. ${exercise.setup}. ${exercise.execution}. " +
                            "Safety: ${exercise.nwbCues}"
                    )
                },
            ) {
                Text(
                    text = "\uD83D\uDD0A Read Aloud",
                    fontSize = 12.sp,
                    color = workoutColor(state.workoutColor),
                )
            }
        }

        // Set tracker
        item {
            SetTrackerCard(
                exercise = exercise,
                phaseIndex = state.phaseIndex,
                completedSets = state.completedSets,
                workoutColor = state.workoutColor,
            )
        }

        // Complete set button
        item {
            Spacer(modifier = Modifier.height(8.dp))
            Button(
                onClick = {
                    viewModel.completeSet()
                    onStartSet()
                },
                modifier = Modifier.fillMaxWidth(0.85f),
                colors = ButtonDefaults.buttonColors(
                    containerColor = workoutColor(state.workoutColor),
                ),
            ) {
                val (totalSets, _) = exercise.setsForPhase(state.phaseIndex)
                val total = totalSets.toIntOrNull() ?: 4
                val setNum = (state.completedSets + 1).coerceAtMost(total)
                Text(
                    text = "DONE · Set $setNum/$total",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
private fun DetailSection(
    title: String,
    content: String,
    accentColor: androidx.compose.ui.graphics.Color = MaterialTheme.colorScheme.primary,
) {
    Card(
        onClick = {},
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp, vertical = 3.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
        ),
        shape = RoundedCornerShape(10.dp),
    ) {
        Column(modifier = Modifier.padding(8.dp)) {
            Text(
                text = title,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = accentColor,
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = content,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface,
                fontSize = 11.sp,
                lineHeight = 14.sp,
            )
        }
    }
}

@Composable
private fun SetTrackerCard(
    exercise: com.nwb.watch.data.model.Exercise,
    phaseIndex: Int,
    completedSets: Int,
    workoutColor: String,
) {
    val (totalSetsStr, reps) = exercise.setsForPhase(phaseIndex)
    val totalSets = totalSetsStr.toIntOrNull() ?: 4

    Card(
        onClick = {},
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp, vertical = 3.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
        ),
        shape = RoundedCornerShape(10.dp),
    ) {
        Column(
            modifier = Modifier.padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(
                text = "Sets · $reps reps",
                fontSize = 10.sp,
                color = NwbSlate,
            )
            Spacer(modifier = Modifier.height(4.dp))
            Row {
                for (i in 1..totalSets) {
                    val done = i <= completedSets
                    Text(
                        text = if (done) "\u25CF" else "\u25CB",
                        fontSize = 18.sp,
                        color = if (done) {
                            workoutColor(workoutColor)
                        } else {
                            NwbSlate.copy(alpha = 0.4f)
                        },
                        modifier = Modifier.padding(horizontal = 3.dp),
                    )
                }
            }
        }
    }
}
